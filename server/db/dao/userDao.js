require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { binarySearch } = require('../../lib/utils/searchUtils');

// Generates a unique number id for the given name
async function generateRandomNumberId(name) {
  let numberID = Math.floor(Math.random() * Math.floor(1000));
  const userNumberIDs = await User.find({ name });
  // if (userNumberIDs.length == 500) return -1;
  while (binarySearch(userNumberIDs, numberID)) {
    numberID += 647;
    numberID %= 1000;
  }
  return numberID;
}

async function createUser(name, email, hashPassword) {
  const user = new User({
    name,
    email,
    password: hashPassword,
    number_id: await generateRandomNumberId(name),
  });
  const newUser = await user.save();
  // Create and assign a jwt to a user
  return jwt.sign({ _id: newUser._id }, process.env.SECRET_AUTH_TOKEN);
}

async function findUser(query) {
  return User.findOne(query);
}

async function findUsersWithName(name) {
  return User.find({ name });
}

async function updateUserName(id, name) {
  const numberID = await generateRandomNumberId(name);
  const query = { _id: id };
  const set = { $set: { name, number_id: numberID } };
  return User.updateOne(query, set);
}

async function updateUserPassword(id, password) {
  const query = { _id: id };
  const set = { $set: { password } };
  return User.updateOne(query, set);
}

async function deleteUser(query) {
  return User.deleteOne(query);
}

module.exports = {
  createUser,
  findUser,
  findUsersWithName,
  updateUserName,
  updateUserPassword,
  deleteUser,
  generateRandomNumberId,
};
