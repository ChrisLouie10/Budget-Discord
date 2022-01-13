const TextChannel = require('../models/TextChannel');
const GroupServer = require('../models/GroupServer');

async function createTextChannel(name, groupServerId) {
  try {
    // create new text channel
    const textChannel = await TextChannel.create({
      name,
      group_server_id: groupServerId,
      chat_log: [],
    });
    // update group server's text channels
    await GroupServer.findOneAndUpdate({ _id: groupServerId }, {
      $push: { text_channels: textChannel._id },
    });
    return textChannel;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function findTextChannelById(id) {
  return TextChannel.findById(id);
}

async function findTextChannelsByServerId(groupServerId) {
  const groupServer = await GroupServer.findById(groupServerId);
  const promises = [];
  groupServer.text_channels.forEach((textChannel) => {
    promises.push(TextChannel.findById(textChannel));
  });
  const results = await Promise.all(promises);
  return results;
}

async function deleteTextChannel(query) {
  return TextChannel.deleteOne(query);
}

module.exports = {
  createTextChannel,
  findTextChannelById,
  findTextChannelsByServerId,
  deleteTextChannel,
};
