const { findTextChannelsByServerId } = require('../../db/dao/textChannelDao');
const { findInviteById } = require('../../db/dao/inviteDao');
const { findUsersByIds } = require('../../db/dao/userDao');

function generateUniqueSessionId() {
  function rand() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return rand();
}

async function formatRawGroupServer(rawGroupServer) {
  const result = { id: rawGroupServer._id };
  const properties = {
    name: rawGroupServer.name,
    owner: rawGroupServer.owner,
    admins: rawGroupServer.admins,
    users: {},
  };
  const rawInvite = await findInviteById(rawGroupServer.invite);
  const rawTextChannels = await findTextChannelsByServerId(rawGroupServer._id);
  const rawUsers = await findUsersByIds(rawGroupServer.users);
  const textChannels = {};

  if (rawInvite) properties.inviteCode = rawInvite.code;

  rawTextChannels.forEach((rawTextChannel) => {
    textChannels[rawTextChannel._id] = {
      groupServerId: rawGroupServer._id,
      name: rawTextChannel.name,
    };
  });
  rawUsers.forEach((rawUser) => {
    properties.users[rawUser._id] = {
      name: rawUser.name,
      numberID: rawUser.number_id,
    };
  });
  properties.textChannels = textChannels;
  result.groupServer = properties;
  return result;
}

module.exports = {
  generateUniqueSessionId,
  formatRawGroupServer,
};
