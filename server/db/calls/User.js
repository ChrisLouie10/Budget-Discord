require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const binarySearch = require('../../lib/binarySearch');

async function createUser(name, email, hashPassword, numberId) {
  const user = new User({
    name,
    email,
    password: hashPassword,
    number_id: numberId,
  });
  const newUser = await user.save();
  // Create and assign a jwt to a user
  return jwt.sign({ _id: newUser._id }, process.env.SECRET_AUTH_TOKEN);
}

async function generateRandomNumberId(name) {
  let numberID = Math.floor(Math.random() * Math.floor(1000));
  const userNumberIDs = await User.find({ name });
  /*
  if (userNumberIDs.length == 1000) {
    return res.status(400).json({
      success: false,
      message: `Username unavailable: Too many called${req.body.name}`
    });
  }
  */
  while (binarySearch(userNumberIDs, numberID)) {
    numberID += 647;
    numberID = numberID < 1000 ? numberID : numberID - 1000;
  }
  return numberID;
}

module.exports = {
  createUser,
  generateRandomNumberId,
};
