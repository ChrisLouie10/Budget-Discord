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
  return user.save();
}

async function findUserById(id) {
  return User.findOne({ _id: id });
}

async function findUsersByIds(ids) {
  return User.find({ _id: { $in: ids } });
}

async function findUserByNameAndNumber(name, number) {
  return User.findOne({ name, number_id: number });
}

async function findUserByEmail(email) {
  return User.findOne({ email });
}

async function findUsersByName(name) {
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

async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

module.exports = {
  createUser,
  findUserById,
  findUsersByIds,
  findUserByNameAndNumber,
  findUserByEmail,
  findUsersByName,
  updateUserName,
  updateUserPassword,
  deleteUser,
  generateRandomNumberId,
};
