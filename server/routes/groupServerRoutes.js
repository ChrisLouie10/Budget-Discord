const router = require('express').Router();
const mongoose = require('mongoose');
const { verify } = require('../lib/utils/tokenUtils');
const {
  createServerValidation,
  createTextChannelValidation,
  groupServerValidation,
  textChannelValidation,
  inviteValidation,
  createInviteValidation,
} = require('../lib/validation/groupServerValidation');
const {
  createGroupServer,
  checkUserPermission,
  findServerByInvite,
  findServerByIdAndUserId,
  findServersByUserId,
  findServerById,
  deleteServer,
  removeTextChannel,
  removeUserFromServer,
  addUserToServer,
} = require('../db/dao/groupServerDao');
const {
  createTextChannel,
  findTextChannelById,
  deleteTextChannel,
} = require('../db/dao/textChannelDao');
const { findMessageById } = require('../db/dao/messageDao');
const {
  createInvite, deleteInvite, findInviteByCode,
} = require('../db/dao/inviteDao');
const { findChatLogById } = require('../db/dao/chatLogDao');
const { formatRawGroupServer } = require('../lib/utils/groupServerUtils');
const { checkInviteExpiration, decreaseInviteUse } = require('../lib/utils/inviteUtils');

// get all of user's group servers
router.get('/', verify, async (req, res) => {
  try {
    const rawGroupServers = await findServersByUserId(req.user._id);
    if (rawGroupServers.length > 0) {
      const groupServers = {};
      const promises = [];

      rawGroupServers.forEach((rawGroupServer) => {
        promises.push(formatRawGroupServer(rawGroupServer));
      });

      const results = await Promise.all(promises);
      results.forEach((result) => {
        groupServers[result.id] = result.groupServer;
      });
      return res.json({ groupServers });
    } return res.status(404).json({ message: 'User is not a member of any servers' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Unknown error occured' });
  }
});

// create a group server
router.post('/', verify, async (req, res) => {
  const { error } = createServerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, userId } = req.body;

  try {
    const rawGroupServer = await createGroupServer(name, userId);
    if (rawGroupServer) {
      const textChannels = {};
      const rawTextChannel = await findTextChannelById(rawGroupServer.text_channels[0]);
      const groupServer = {
        name: rawGroupServer.name,
        owner: rawGroupServer.owner,
        admins: [],
        textChannels: {},
      };

      textChannels[rawTextChannel._id] = {
        groupServerId: rawGroupServer._id,
        name: rawTextChannel.name,
      };
      groupServer.textChannels = textChannels;
      return res.status(201).json({ groupServer, groupServerId: rawGroupServer._id });
    }
    return res.status(500).json({ message: 'An error ocurred when creating the server' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Unknown error occured' });
  }
});

// get a specific group server
router.get('/:groupServerId', verify, async (req, res) => {
  const { error } = groupServerValidation(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const rawGroupServer = await findServerByIdAndUserId(req.params.groupServerId, req.user._id);
    if (rawGroupServer) {
      const result = await formatRawGroupServer(rawGroupServer);
      const groupServer = {};
      groupServer[result.id] = result.groupServer;
      return res.json({ groupServer });
    } return res.status(404).json({ message: 'No server found' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Unknown error occured' });
  }
});

// delete a group server
router.delete('/:groupServerId', verify, async (req, res) => {
  const { error } = groupServerValidation(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try { // remove all text channels and invite associated to group server
    const rawGroupServer = await findServerById(req.params.groupServerId);
    if (rawGroupServer) {
      if (rawGroupServer.owner.toString() === req.user._id.toString()) {
        const promises = [];
        rawGroupServer.text_channels.forEach((textChannelId) => {
          promises.push(removeTextChannel(req.params.groupServerId, textChannelId));
          promises.push(deleteTextChannel({ _id: textChannelId }));
        });
        await Promise.all(promises);
        if (rawGroupServer.invite) await deleteInvite({ _id: rawGroupServer.invite });
        await deleteServer({ _id: rawGroupServer._id });
        return res.json({});
      } return res.status(401).json({ message: 'User is not allowed to delete the server' });
    } return res.status(404).json({ message: 'No server found' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Unknown error occured' });
  }
});

// create a text channel in a group server
router.post('/:groupServerId/text-channels', verify, async (req, res) => {
  const { serverError } = groupServerValidation(req.params);
  const { channelError } = createTextChannelValidation(req.body);
  if (serverError) return res.status(400).json({ message: serverError.details[0].message });
  if (channelError) return res.status(400).json({ message: channelError.details[0].message });

  if (!checkUserPermission(req.user._id, req.params.groupServerId)) {
    return res.status(401).json({ message: 'User is not authorized to create text channels' });
  }

  try {
    const rawTextChannel = await createTextChannel(req.body.name, req.params.groupServerId);
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
      const result = await deleteTextChannel({ _id: textChannelId });
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
      if (rawChatLog) {
        const promises = [];
        rawChatLog.chat_log.forEach((messageId) => {
          promises.push(findMessageById(messageId));
        });
        const chatLog = await Promise.all(promises);
        return res.json({ chatLog });
      }
      return res.status(404).json({ message: 'Could not find chat log' });
    } return res.status(404).json({ message: 'Could not find text channel' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

// Adds a user to a group server
router.post('/users', verify, async (req, res) => {
  const { error } = inviteValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { inviteCode } = req.body;
    const rawGroupServer = await findServerByInvite(inviteCode);
    const rawInvite = await findInviteByCode(inviteCode);

    if (!rawGroupServer) return res.status(404).json({ message: 'No server found' });
    if (!rawInvite) return res.status(404).json({ message: 'Invite code was not found' });
    if (!checkInviteExpiration(rawInvite)) {
      await deleteInvite({ code: inviteCode });
      return res.status(401).json({ message: 'Expired invite code' });
    }
    if (rawGroupServer.users.includes(mongoose.Types.ObjectId(req.user._id))) {
      return res.status(204).json({ message: 'User is already a member of the server' });
    }

    const rawNewGroupServer = await addUserToServer(rawGroupServer._id, req.user._id);
    if (rawNewGroupServer) {
      await decreaseInviteUse(rawInvite);
      const result = await formatRawGroupServer(rawNewGroupServer);
      return res.status(201).json({ groupServerId: result.id, groupServer: result.groupServer });
    } return res.status(500).json({ message: 'An error occured when attempting to add the user to the server' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

// remove a user from a group server
router.delete('/:groupServerId/users', verify, async (req, res) => {
  const { error } = groupServerValidation(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const rawGroupServer = await removeUserFromServer(req.params.groupServerId, req.user._id);
    if (rawGroupServer) {
      return res.json({});
    } return res.status(404).json({ message: 'No server found' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

// create an invite for a group server
router.post('/:groupServerId/invite', verify, async (req, res) => {
  const { serverError } = groupServerValidation(req.params);
  const { inviteError } = createInviteValidation(req.body);
  if (serverError) return res.status(400).json({ message: serverError.details[0].message });
  if (inviteError) return res.status(400).json({ message: inviteError.details[0].message });

  try {
    // Find the groupServer we want to create an invite for
    const rawGroupServer = await findServerById(req.params.groupServerId);
    if (rawGroupServer) {
      // Create a new invite for the groupServer
      const rawInvite = await createInvite(
        req.params.groupServerId,
        req.body.expiration,
        req.body.limit,
      );
      if (rawInvite) {
        return res.status(201).json({ code: rawInvite.code });
      } return res.status(500).json({ message: 'An error occured when creating an invite code' });
    } return res.status(404).json({ message: 'No server found' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({});
  }
});

module.exports = router;
