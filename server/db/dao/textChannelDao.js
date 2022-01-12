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

module.exports = {
  createTextChannel,
  findTextChannelById,
};
