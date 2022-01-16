const router = require('express').Router();
const { verify } = require('../lib/utils/tokenUtils');
const {
  createPrivateChat,
  findPrivateChatsByUserId,
  deletePrivateChat,
} = require('../db/dao/privateChatDao');
const { findChatLogById } = require('../db/dao/chatLogDao');
const { findUserById } = require('../db/dao/userDao');
const {
  createPrivateChatValidation,
} = require('../lib/validation/privateChatValidation');

router.get('/', verify, async (req, res) => {
  try {
    await findPrivateChatsByUserId(req.body.userId);
    return res.status(500).json({ message: 'Unknown error occured' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Unknown error occured' });
  }
});

// create a private chat between user and a friend
router.post('/', verify, async (req, res) => {
  const { error } = createPrivateChatValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const friend = await findUserById(req.body.friendID);
    if (!friend) return res.status(404).json({ success: false, message: 'User does not exist' });

    const rawTextChannel = await createPrivateChat(req.body.name, req.params.groupServerId);
    if (rawTextChannel) {
      return res.status(201).json({
        textChannelId: rawTextChannel._id,
        textChannel: {
          groupServerId: req.params.groupServerId,
          name: rawTextChannel.name,
        },
      });
    }
    return res.status(500).json({ message: 'An error occured when creating a text channel' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Unknown error occured' });
  }
});

// delete a text channel from a group server
router.delete('/:groupServerId/text-channels/:textChannelId', verify, async (req, res) => {
  const { error } = textChannelValidation(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!checkUserPermission(req.user._id, req.params.groupServerId)) {
    return res.status(401).json({ message: 'User is not authorized to delete text channels' });
  }

  const { groupServerId, textChannelId } = req.params;

  try {
    const rawGroupServer = await findServerById(groupServerId);
    if (rawGroupServer) {
      await removeTextChannel(groupServerId, textChannelId);
      const result = await deletePrivateChat({ _id: textChannelId });
      if (result) return res.json({});
      return res.status(404).json({ message: 'No text channel found' });
    } return res.status(404).json({ message: 'No server found' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

// get chat logs
router.get('/:groupServerId/text-channels/:textChannelId/chat-logs', verify, async (req, res) => {
  const { error } = textChannelValidation(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { groupServerId, textChannelId } = req.params;

  try {
    const rawGroupServer = await findServerById(groupServerId);
    const rawTextChannel = await findTextChannelById(textChannelId);
    const textChannelIds = rawGroupServer.text_channels;

    if (textChannelIds.includes(mongoose.Types.ObjectId(textChannelId)) && rawTextChannel) {
      const rawChatLog = await findChatLogById(rawTextChannel.chat_log);
      if (rawChatLog) return res.json({ chatLog: rawChatLog.chat_log });
      return res.status(404).json({ message: 'Could not find chat log' });
    } return res.status(404).json({ message: 'Could not find text channel' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});
module.exports = router;
