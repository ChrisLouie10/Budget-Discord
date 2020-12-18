const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {registerValidation, loginValidation} = require('../validation');

//Register
router.post('/register', async (req, res) => {
  //Validates the data before we add user
  const { error } = registerValidation(req.body);

  //prints error to user if one occurs
  if(error) return res.status(400).send(error.details[0].message);

  //Checking if the user is already in the database
  const emailExist = await User.findOne({email: req.body.email});
  if(emailExist) return res.status(400).send('Email already exists');

  //Hash password
  const hashPassword = await bcrypt.hash(req.body.password, 10);

  //Create new user, send error if something is wrong
  const user = new User({
    name: req.body.name, 
    email: req.body.email, 
    password: hashPassword
  });
  try {
    const saveUser = await user.save();
    res.send(saveUser);
  }catch(err){
    res.status(400).send(err);
  }

});

// Login
router.post('/login', async (req, res) => {
  // Validates the data before we add user
  const { error } = loginValidation(req.body);

  // Prints error to user if one occurs
  if(error) return res.status(400).send(error.details[0].message);

  //Checking if the user is already in the database
  const user = await User.findOne({email: req.body.email});
  if(!user) return res.status(400).send('Invalid Email or Password');

  // Checking if password is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if(!validPass) return res.status(400).send('Invalid Email or Password');

  //Create and assign a token
  const token = jwt.sign({_id: user._id}, process.env.ACCESS_TOKEN_SECRET);
  res.header('auth-token', token).send(token);
});

module.exports = router;