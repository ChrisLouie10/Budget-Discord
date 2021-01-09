const User = require('../models/User');
const router = require('express').Router();
const { registerValidation, loginValidation, updatePasswordValidation } = require('../auth/validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Validation
const Joi = require('@hapi/joi');
const { join } = require('path');

router.post('/register', async (req, res) => {

    // Validate data before adding user
    const {error} = registerValidation(req.body);
    if(error) {
        res.statusMessage = error.details[0].message;
        return res.sendStatus(400);
    }
    // Check if the user's email is already in the database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) {
        res.statusMessage = 'Email already exists';
        return res.sendStatus(400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Add user to database
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
    });
    try{
        const newUser = await user.save();
    
        //Create and assign a refresh and access token to a user
        const accessToken = generateAccessToken(newUser);
        const refreshToken = jwt.sign({_id: newUser._id}, process.env.SECRET_REFRESH_TOKEN);
        const query = { email: user.email };
        const set = { $set: { token: refreshToken } };
        await User.updateOne(query, set);

        res.status(200).send({'auth-token': refreshToken, 'access-token': accessToken});
    }catch(err){
        res.statusMessage = err;
        res.sendStatus(400);
    }
});

router.delete('/logout', async (req, res) =>{

    // check if the user has a refresh token
    const refreshToken = req.header('auth-token');
    if(refreshToken == null) {
        res.statusMessage = 'Already logged out';
        res.sendStatus(401);
    }
    // delete the refresh token from the user
    const query = { token: refreshToken };
    const set = { token: null }
    const result = await User.updateOne(query, set);    
    if(result.nModified > 0){
        res.status(200).send("Token Deleted");
    } else {
        res.statusMessage = 'Token not found';
        res.sendStatus(404);
    }
})

router.post('/login', async (req, res) =>{

    // Validate data before adding user
    const {error} = loginValidation(req.body);
    if(error) {
        res.statusMessage = error.details[0].message;
        res.status(400).send();
    }

    // Check if the user's email is already in the database
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        res.statusMessage = 'Email or password is incorrect';
        res.status(400).send();
    }

    // Check if password is valid
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) {
        res.statusMessage = 'Email or password is incorrect';
        res.status(400).send();
    }

    //Create and assign a refresh and access token to a user
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign({_id: user._id}, process.env.SECRET_REFRESH_TOKEN);
    try{
        const query = { email: user.email };
        const set = { $set: { token: refreshToken } };
        await User.updateOne(query, set);
        res.status(200).send({'auth-token': refreshToken, 'access-token': accessToken});
    }catch(err){
        res.status(400).send(err);
    }
});

router.post('/token', async (req, res) => {

    // check if user has refresh token
    const refreshToken = req.header('auth-token');
    if(refreshToken == null) {
        res.status(401).send();
    }

    // check if the refresh token is valid
    const found = await User.findOne({token: refreshToken});
    if(refreshToken == null) {
        res.status(400).send();
    }
    
    // verify refresh token
    jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
        if (err) res.status(403).send();

        // send back a new access token
        const accessToken = generateAccessToken(found);
        res.status(200).send({ accessToken: accessToken });
    });
});

router.post('/check-password', async (req, res) => {
    // Validate data before adding user
    const {error} = updatePasswordValidation(req.body);
    if(error) {
        res.statusMessage = error.details[0].message;
        res.status(400).send();
    }

    const user = await User.findOne({email: req.body.email});
    const validPass = await bcrypt.compare(req.body.oldPassword, user.password);
    if(!validPass) {
        res.statusMessage = 'Old Password is Incorrect';
        res.status(400).send();
    }

    try{
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const query = { email: user.email };
        const set = { $set: { password: hashPassword } };
        await User.updateOne(query, set);
        res.status(200).send({result: true, message: 'Success'});
    }catch{
        res.statusMessage = 'Failed to change password';
        res.status(400).send();
    }

})

function generateAccessToken(user){
    return jwt.sign({user}, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '30m'});
}

module.exports = router;