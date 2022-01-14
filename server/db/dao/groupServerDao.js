const GroupServer = require('../models/GroupServer');
const Invite = require('../models/Invite');
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
    return GroupServer.findById(groupServer._id);
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function checkUserPermission(userId, groupServerId) {
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

async function findServerByInvite(inviteCode) {
  const rawInvite = await Invite.findOne({ code: inviteCode });
  if (rawInvite) return GroupServer.findOne({ invite: rawInvite._id });
  return null;
}

async function findServerByIdAndUserId(groupServerId, userId) {
  return GroupServer.findOne({ _id: groupServerId, users: userId });
}

async function findServersByUserId(userId) {
  return GroupServer.find({ users: userId });
}

async function deleteServer(query) {
  return GroupServer.deleteOne(query);
}

async function removeTextChannel(groupServerId, textChannelId) {
  return GroupServer.findByIdAndUpdate(groupServerId, {
    $pull: {
      text_channels: textChannelId,
    },
  });
}

async function removeUserFromServer(groupServerId, userId) {
  return GroupServer.findByIdAndUpdate(groupServerId, {
    $pull: {
      users: userId,
    },
  }, {
    new: true,
  });
}

async function addUserToServer(groupServerId, userId) {
  return GroupServer.findByIdAndUpdate(groupServerId, {
    $push: {
      users: userId,
    },
  }, {
    new: true,
  });
}

module.exports = {
  createGroupServer,
  checkUserPermission,
  findServerById,
  findServerByInvite,
  findServerByIdAndUserId,
  findServersByUserId,
  deleteServer,
  removeTextChannel,
  removeUserFromServer,
  addUserToServer,
};
