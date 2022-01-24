const { findUsersByIds } = require('../../db/dao/userDao');

async function formatRawPrivateChat(rawPrivateChat, userId) {
  const result = { id: rawPrivateChat._id };
  const users = {};

  const rawUsers = await findUsersByIds(rawPrivateChat.users);

  // If private chat contains only one other user, set private chat name to that user's name
  if (rawUsers.length === 2) {
    result.name = (rawUsers.find((user) => String(user._id) !== String(userId))).name;
  } else {
    const names = rawUsers.map((user) => user.name);
    result.name = names.toString();
  }

  rawUsers.forEach((rawUser) => {
    users[rawUser._id] = {
      id: rawUser._id,
      name: rawUser.name,
      numberID: rawUser.number_id,
    };
  });

  result.users = users;
  return result;
}

module.exports = {
  formatRawPrivateChat,
};
