const router = require('express').Router();
const mongoose = require('mongoose');
const { verify } = require('../lib/utils/tokenUtils');
const {
  createPrivateChat,
  findPrivateChatsByUserId,
  deletePrivateChat,
  findPrivateChatById,
  findPrivateChatByUsers,
} = require('../db/dao/privateChatDao');
const { findChatLogById } = require('../db/dao/chatLogDao');
const { findMessageById } = require('../db/dao/messageDao');
const { findUserById } = require('../db/dao/userDao');
const {
  createPrivateChatValidation,
  privateChatIdValidation,
} = require('../lib/validation/privateChatValidation');
const { friendIdValidation } = require('../lib/validation/friendValidation');
const { formatRawPrivateChat } = require('../lib/utils/privateChatUtils');

// get all private chats for a user
router.get('/', verify, async (req, res) => {
  try {
    const rawPrivateChats = await findPrivateChatsByUserId(req.user._id);
    if (rawPrivateChats.length > 0) {
      const privateChats = [];
      const promises = [];

      rawPrivateChats.forEach((rawPrivateChat) => {
        promises.push(formatRawPrivateChat(rawPrivateChat, req.user._id));
      });

      const results = await Promise.all(promises);
      results.forEach((result) => {
        privateChats.push(result);
      });

      return res.status(200).json({ success: true, privateChats });
    } return res.status(200).json({ success: true, message: 'User has no private chats', privateChats: [] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Unknown error occured' });
  }
});

// create a private chat between user and a friend
router.post('/', verify, async (req, res) => {
  const { error } = createPrivateChatValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { userId, friendId } = req.body;

  try {
    const friend = await findUserById(friendId);
    if (!friend) return res.status(404).json({ success: false, message: 'User does not exist' });

    const rawExistingChat = await findPrivateChatByUsers([userId, friendId]);

    if (rawExistingChat) return res.status(400).json({ success: false, message: 'Private chat already exists' });

    const rawPrivateChat = await createPrivateChat(userId, friendId);
    if (rawPrivateChat) {
      return res.status(201).json({ success: true, privateChatId: rawPrivateChat._id });
    }
    return res.status(500).json({ success: false, message: 'An error occured when creating a private chat' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Unknown error occured' });
  }
});

// get a private chat between a user and a friend
router.get('/:friendID', verify, async (req, res) => {
  const { error } = friendIdValidation(req.params);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { friendID } = req.params;
  const userID = req.user._id;

  try {
    const friend = await findUserById(friendID);
    if (!friend) return res.status(404).json({ success: false, message: 'User does not exist' });

    const rawExistingChat = await findPrivateChatByUsers([userID, friendID]);

    if (rawExistingChat) {
      return res.status(201).json({ success: true, privateChatId: rawExistingChat._id });
    }
    return res.status(400).json({ success: false, message: 'Private chat does not exist' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
});

// delete a private chat from a user
router.delete('/:privateChatId', verify, async (req, res) => {
  const { error } = privateChatIdValidation(req.params);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { privateChatId } = req.params;

  try {
    const rawPrivateChat = await findPrivateChatById(privateChatId);

    if (!rawPrivateChat) return res.status(404).json({ success: false, message: 'Private Chat is not found' });
    if (!rawPrivateChat.users.includes(mongoose.Types.ObjectId(req.user._id))) {
      return res.status(401).json({ success: false, message: 'User is not authorized to delete this private chat' });
    }

    await deletePrivateChat({ _id: privateChatId });
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
});

// get chat logs
router.get('/:privateChatId/chat-logs', verify, async (req, res) => {
  const { error } = privateChatIdValidation(req.params);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const { privateChatId } = req.params;

  try {
    const rawPrivateChat = await findPrivateChatById(privateChatId);

    if (!rawPrivateChat) return res.status(404).json({ success: false, message: 'Private Chat is not found' });
    if (!rawPrivateChat.users.includes(mongoose.Types.ObjectId(req.user._id))) return res.status(401).json({ success: false, message: 'User is not authorized to get this private chat' });

    const rawChatLog = await findChatLogById(rawPrivateChat.chat_log);
    if (rawChatLog) {
      const promises = [];
      rawChatLog.chat_log.forEach((messageId) => {
        promises.push(findMessageById(messageId));
      });
      const chatLog = await Promise.all(promises);
      return res.json({ chatLog });
    }
    return res.status(404).json({ success: false, message: 'Could not find chat log' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
});
module.exports = router;
