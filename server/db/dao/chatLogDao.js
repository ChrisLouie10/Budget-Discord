const ChatLog = require('../models/ChatLog');

async function addMessageToChatLog(chatLogId, messageObj) {
  return ChatLog.findByIdAndUpdate(
    chatLogId,
    { $push: { chat_log: messageObj } },
    { new: true },
  );
}

async function findChatLogById(chatLogId) {
  return ChatLog.findById(chatLogId);
}

module.exports = {
  addMessageToChatLog,
  findChatLogById,
};
