const ChatLog = require('../models/ChatLog');
const { createMessage } = require('./messageDao');

async function addMessageToChatLog(chatLogId, message) {
  const rawMessage = await createMessage(message);
  if (rawMessage) {
    return ChatLog.findByIdAndUpdate(
      chatLogId,
      { $push: { chat_log: rawMessage._id } },
      { new: true },
    );
  } return null;
}

async function findChatLogById(chatLogId) {
  return ChatLog.findById(chatLogId);
}

module.exports = {
  addMessageToChatLog,
  findChatLogById,
};
