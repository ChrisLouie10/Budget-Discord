const PrivateChat = require('../models/PrivateChat');
const ChatLog = require('../models/ChatLog');

// when you add a friend private chat created
async function createPrivateChat(userId, friendId) {
  try {
    // create new chat log first
    const chatLog = await ChatLog.create({ chat_log: [] });
    // create new text channel
    const privateChat = await PrivateChat.create({
      users: [userId, friendId],
      chat_log: chatLog._id,
    });

    return privateChat;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function findPrivateChatsByUserId(userId) {
  return PrivateChat.find({ users: userId });
}

async function deletePrivateChat(query) {
  const privateChat = await PrivateChat.findOne(query);
  if (privateChat) { // delete chat log associated with the private chat
    await ChatLog.findByIdAndDelete(privateChat.chat_log);
    return PrivateChat.findByIdAndDelete(privateChat._id);
  } return null;
}
module.exports = {
  createPrivateChat,
  findPrivateChatsByUserId,
  deletePrivateChat,
};
