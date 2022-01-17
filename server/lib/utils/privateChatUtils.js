async function formatRawPrivateChat(rawPrivateChat) {
//   const result = { id: rawPrivateChat._id };
//   const properties = {
//     users: rawPrivateChat.users,
//   };
//   const users = {};

  //   rawPrivateChat.users.forEach((rawUser) => {
  //     textChannels[rawTextChannel._id] = {
  //       groupServerId: rawUser._id,
  //       name: rawUser.name,
  //       numberID: rawUser.number_id,
  //     };
  //   });
  //   properties.textChannels = textChannels;
  //   result.privateChat = properties;
  //   return result;
  return rawPrivateChat;
}

module.exports = {
  formatRawPrivateChat,
};
