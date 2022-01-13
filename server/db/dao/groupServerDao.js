const GroupServer = require('../models/GroupServer');
const { createTextChannel } = require('./textChannelDao');

async function createGroupServer(name, ownerId) {
  try {
    // create group server
    const groupServer = await GroupServer.create({
      name,
      owner: ownerId,
      users: [ownerId],
      text_channels: [],
    });

    // create text channel for the group server
    await createTextChannel('general', groupServer._id);

    // find updated group server and return that
    return await GroupServer.findById(groupServer._id);
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function checkUserPemission(userId, groupServerId) {
  try {
    const groupServer = await GroupServer.findById(groupServerId);
    // check if user is the owner
    if (groupServer.owner == userId) return true;

    // check if user is an admin
    const { admins } = groupServer;
    for (let i = 0; i < admins.length; i += 1) {
      if (admins[i] == userId) return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

async function findServerById(groupServerId) {
  return GroupServer.findById(groupServerId);
}

async function findServersByUserId(userId) {
  return GroupServer.find({ users: userId });
}

module.exports = {
  createGroupServer,
  checkUserPemission,
  findServerById,
  findServersByUserId,
};
