const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../db/models/User');
const GroupServer = require('../db/models/GroupServer');
const TextChannel = require('../db/models/TextChannel');
const Invite = require('../db/models/Invite');
const { verify } = require('../lib/utils/tokenUtils');
const {
  createServerValidation,
  createTextChannelValidation,
  groupServerValidation,
  chatLogsValidation,
} = require('../lib/validation/groupServerValidation');
const {
  createGroupServer,
  checkUserPemission,
  findServerByIdAndUserId,
  findServersByUserId,
  findServerById,
  deleteServer,
} = require('../db/dao/groupServerDao');
const {
  createTextChannel,
  findTextChannelById,
  findTextChannelsByServerId,
  deleteTextChannel,
} = require('../db/dao/textChannelDao');
const { deleteInvite } = require('../db/dao/inviteDao');

// expiration is in minutes
// 0 limit = infinite use
async function createInvite(groupServerId, expiration, limit) {
  let code;
  // Generate random 10 digit code if no expiration
  if (expiration <= 0) {
    code = Math.floor((1 + Math.random()) * 0x10000).toString(16)
        + Math.floor((1 + Math.random()) * 0x10000).toString(16);
  } else {
    code = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
        + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  try {
    // Delete the groupServer's existing invite(s)
    await Invite.deleteMany({ group_server_id: groupServerId });
    // Create a brand new invite
    const invite = await Invite.create({
      group_server_id: groupServerId,
      code,
      date: new Date(),
      expiration,
      limit: (limit > 0) ? limit : undefined,
    });
    return invite;
  } catch (e) {
    return e;
  }
}

async function formatRawGroupServer(rawGroupServer) {
  const result = { id: rawGroupServer._id };
  const properties = {
    name: rawGroupServer.name,
    owner: rawGroupServer.owner,
    admins: rawGroupServer.admins,
  };
  const rawTextChannels = await findTextChannelsByServerId(rawGroupServer._id);
  const textChannels = {};

  rawTextChannels.forEach((rawTextChannel) => {
    textChannels[rawTextChannel._id] = {
      groupServerId: rawTextChannel.group_server_id,
      name: rawTextChannel.name,
    };
  });
  properties.textChannels = textChannels;
  result.groupServer = properties;
  return result;
}

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

  try {
    const { name, userId } = req.body;
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
        groupServerId: rawTextChannel.group_server_id,
        name: rawTextChannel.name,
      };
      groupServer.textChannels = textChannels;
      return res.json({ groupServer });
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
    const rawGroupServer = await GroupServer.findById(req.params.groupServerId);
    if (rawGroupServer) {
      if (rawGroupServer.owner.toString() === req.user._id.toString()) {
        const promises = [];
        rawGroupServer.text_channels.forEach((textChannelId) => {
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

  if (!checkUserPemission(req.user._id, req.params.groupServerId)) {
    return res.status(401).json({ message: 'User is not authorized to create text channels' });
  }

  try {
    const textChannel = await createTextChannel(req.body.name, req.params.groupServerId);
    if (textChannel) {
      return res.json({
        textChannelId: textChannel._id,
        textChannel: {
          groupServerId: textChannel.group_server_id,
          name: textChannel.name,
        },
      });
    }
    return res.status(500).json({ message: 'An error occured when creating a text channel' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Unknown error occured' });
  }
});

// get chat logs
router.get('/:groupServerId/text-channels/:textChannelId/chat-logs', verify, async (req, res) => {
  const { error } = chatLogsValidation(req.params);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { groupServerId, textChannelId } = req.params;
  const rawGroupServer = await findServerById(groupServerId);
  const rawTextChannel = await findTextChannelById(textChannelId);
  const textChannelIds = rawGroupServer.text_channels;

  if (textChannelIds.includes(mongoose.Types.ObjectId(textChannelId)) && rawTextChannel) {
    return res.json({ chatLog: rawTextChannel.chat_log });
  } return res.status(404).json({ message: 'Could not find text channel' });
});

// creates an invite for a group server
router.post('/create-invite', verify, async (req, res) => {
  if (req.body.type === 'create-invite'
        && req.body.userId
        && req.body.groupServerId
        && req.body.expiration
        && req.body.limit) {
    // Find the groupServer we want to create an invite for
    const groupServer = await GroupServer.findById(req.body.groupServerId);
    if (groupServer !== null) {
      // Create a new invite for the groupServer
      const invite = await createInvite(
        req.body.groupServerId,
        req.body.expiration,
        req.body.limit,
      );
      // Return the new invite code to client
      if (!(invite instanceof Error) && invite !== null) { res.status(200).json({ success: true, message: 'Success', code: invite.code }); } else { res.status(500).json({ success: false, message: 'Failed', err: invite }); }
    } else res.status(500).json({ success: false, message: 'Something went wrong when looking for a groupServer' });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

// Adds a user to a group server
router.post('/join', verify, async (req, res) => {
  if (req.body.type === 'join' && req.body.userId && req.body.inviteCode) {
    // Retrieve invite from DB
    const invite = await Invite.findOne({ code: req.body.inviteCode });
    if (invite !== null) {
      // Check if invite is expired
      // time-lapse in minutes
      const creationDate = invite.date;
      const currentDate = new Date();
      const timeLapse = (currentDate.getTime() - creationDate.getTime()) / 60000;
      if (invite.expiration <= 0 || (timeLapse < invite.expiration && invite.limit !== 0)) {
        const groupServer = await GroupServer.findById(invite.group_server_id);
        if (groupServer !== null) {
          // Check if requesting member is already a member of the group server
          let newMember = true;
          groupServer.users.forEach((user) => {
            if (user == req.body.userId) {
              newMember = false;
            }
          });
          if (newMember) {
            await GroupServer.findByIdAndUpdate(invite.group_server_id, {
              $push: { users: req.body.userId },
            });
            // Decrease invite number of uses left, if there is a limit
            if (invite.limit) {
              invite.limit -= 1;
              if (invite.limit <= 0) await Invite.findOneAndDelete({ _id: invite._id });
              else await Invite.findByIdAndUpdate(invite._id, { limit: invite.limit });
            }
            // Return the new group server to client
            const user = await User.findByIdAndUpdate(req.body.userId, {
              $push: { group_servers: groupServer.id },
            });
            const _textChannels = await TextChannel.find({ group_server_id: groupServer._id });
            const textChannels = {};
            if (_textChannels.length > 0) {
              _textChannels.forEach((textChannel) => {
                textChannels[textChannel._id] = {
                  groupServerId: textChannel.group_server_id,
                  name: textChannel.name,
                  date: textChannel.date,
                };
              });
            }
            res.status(200).json({
              success: true,
              message: 'Success.',
              groupServerId: groupServer._id,
              user,
              groupServer: {
                name: groupServer.name,
                textChannels,
              },
            });
          } else {
            res.status(400).json({ success: false, message: 'Requesting user is already part of the group server.' });
          }
        } else res.status(500).json({ success: false, message: 'Something went wrong when looking for a group server' });
      } else {
        const _invite = Invite.findOneAndDelete({ code: req.body.inviteCode });
        if (!(_invite instanceof Error)) res.status(401).json({ success: false, message: 'Expired invite code.' });
        else res.status(500).json({ success: false, message: 'Failed to remove expired invite.', err: _invite });
      }
    } else res.status(500).json({ success: false, message: "Failed. Invite code doesn't exist." });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

// Removes a user from a group server
router.post('/leave', verify, async (req, res) => {
  if (req.body.type === 'leave' && req.body.groupServerId && req.body.userId) {
    // Find the group server and remove the user in it
    const groupServer = await GroupServer.findByIdAndUpdate(req.body.groupServerId, {
      $pull: {
        users: req.body.userId,
      },
    }, {
      new: true,
    });
    if (groupServer !== null) {
      // Update the user info.
      const user = await User.findByIdAndUpdate(req.body.userId, {
        $pull: {
          group_servers: req.body.groupServerId,
        },
      }, {
        new: true,
      });
      if (user !== null) {
        res.status(200).json({ success: true, message: 'Success', user });
      } else res.status(500).json({ success: false, message: 'Failed to update new user information.', err: user });
    } else res.status(500).json({ success: false, message: 'Failed to remove user from Group Server.' });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

// Deletes a channel from a group server
router.post('/delete-channel', verify, async (req, res) => {
  if (req.body.type === 'delete-channel'
        && req.body.groupServerId
        && req.body.textChannelId
        && req.body.userId) {
    // Look for the group server we want to delete a channel from
    const groupServer = await GroupServer.findById(req.body.groupServerId);
    if (groupServer !== null) {
      // Check whether user making the request to delete is authorized
      let authorized = groupServer.owner == req.body.userId;
      if (!authorized) {
        groupServer.admins.forEach((admin) => {
          if (admin == req.body.userId) {
            authorized = true;
          }
        });
      }
      if (authorized) {
        // Delete the text channel and update the group server information
        await TextChannel.findByIdAndDelete(req.body.textChannelId);
        await GroupServer.findByIdAndUpdate(req.body.groupServerId, {
          $pull: {
            textChannels: req.body.textChannelId,
          },
        });
        res.status(200).json({ success: true, message: 'Success.' });
      } else res.status(401).json({ success: false, message: 'The user is not authorized to delete channels.' });
    } else res.status(500).json({ success: false, message: 'Something went wrong when looking for the group server.' });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

module.exports = router;
