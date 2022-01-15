const TextChannel = require('../models/TextChannel');
const ChatLog = require('../models/ChatLog');
const GroupServer = require('../models/GroupServer');

async function createTextChannel(name, groupServerId) {
  try {
    // create new chat log first
    const chatLog = await ChatLog.create({ chat_log: [] });
    // create new text channel
    const textChannel = await TextChannel.create({
      name,
      group_server_id: groupServerId,
      chat_log: chatLog._id,
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
  try {
    const groupServer = await GroupServer.findById(groupServerId);
    const promises = [];
    groupServer.text_channels.forEach((textChannel) => {
      promises.push(TextChannel.findById(textChannel));
    });
    const results = await Promise.all(promises);
    return results;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function deleteTextChannel(query) {
  const textChannel = await TextChannel.findOne(query);
  if (textChannel) { // delete chat log associated with the text channel
    await ChatLog.findByIdAndDelete(textChannel.chat_log);
    return TextChannel.findByIdAndDelete(textChannel._id);
  } return null;
}

module.exports = {
  createTextChannel,
  findTextChannelById,
  findTextChannelsByServerId,
  deleteTextChannel,
};
