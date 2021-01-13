const User = require('../models/User');
const router = require('express').Router();
const { registerValidation, loginValidation, updatePasswordValidation } = require('../auth/validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verify = require ('../auth/verifyToken');

//Validation
const Joi = require('@hapi/joi');

router.post('/verify', verify, (req, res) => {
    if(req.user) return res.status(200).json({success: true, message: 'Success', user: req.user});
    else return res.status(404).json({success: false, message: 'Denied Access'});
});

router.post('/register', async (req, res) => {

    // Validate data before adding user
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).json({success: false, message: error.details[0].message});

    // Check if the user's email is already in the database
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).json({success: false, message: 'Email already exists'});

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
        const token = await jwt.sign({_id: newUser._id}, process.env.SECRET_AUTH_TOKEN);
        const query = { email: user.email };
        const set = { $set: { token: token } };
        await User.updateOne(query, set);

        return res.status(200).send({success: true, message: 'Success', Authentication: token});
    }catch(err) {
        return res.status(400).json({success: false, message: err});
    }
});

router.delete('/logout', verify, async (req, res) =>{

    // check if the user is logged in
    if(req.user == null) res.status(401).json({success: false, message: 'Already logged out'});

    // delete the token from the user
    const query = { _id: req.user._id };
    const set = { token: null }
    const result = await User.updateOne(query, set);    

    if(result.nModified > 0) res.status(200).json({success: true, message: 'Success'});
    else res.status(404).json({success: false, message: 'Token not found'});
})

router.post('/login', async (req, res) =>{

    // Validate data before adding user
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).json({success: false, message: error.details[0].message});

    // Check if the user's email is already in the database
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).json({success: false, message: 'Email or password is incorrect'});
    
    // Check if password is valid
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) res.status(400).json({success: false, message: 'Email or password is incorrect'});

    //Create and assign a token to a user
    const token = jwt.sign({_id: user._id}, process.env.SECRET_AUTH_TOKEN);
    try{
        const query = { email: user.email };
        const set = { $set: { token: token } };
        await User.updateOne(query, set);
        return res.status(200).json({success: true, message: 'Success', Authorization: 'Bearer ' + token});
    }catch(err){
        return res.status(400).json({success: false, message: 'Failed to log in'});
    }
});

router.post('/check-password', verify, async (req, res) => {
    // Validate data before adding user
    const {error} = updatePasswordValidation(req.body);
    if(error) return res.status(400).json({success: false, message: error.details[0].message});

    const validPass = await bcrypt.compare(req.body.oldPassword, req.user.password);
    if(!validPass) return res.status(400).json({success: false, message: 'Old Password is Incorrect'});

    try{
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const query = { email: req.user.email };
        const set = { $set: { password: hashPassword } };
        await User.updateOne(query, set);

        return res.status(200).json({success: true, message: 'Success'});
    }catch{ 
        return res.status(400).json({success: false, message: 'Failed to change password'});
    }
})

module.exports = router;