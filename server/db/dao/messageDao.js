const Message = require('../models/Message');

async function createMessage({ author, content, timestamp }) {
  return Message.create({
    author,
    content,
    timestamp,
  });
}

async function findMessageById(messageId) {
  return Message.findById(messageId);
}

module.exports = {
  createMessage,
  findMessageById,
};
