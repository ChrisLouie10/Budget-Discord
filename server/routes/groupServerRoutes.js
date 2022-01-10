const router = require('express').Router();
const User = require('../db/models/User');
const GroupServer = require('../db/models/GroupServer');
const TextChannel = require('../db/models/TextChannel');
const Invite = require('../db/models/Invite');
const { verify } = require('../lib/utils/tokenUtils');

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

// Creates a new group server
router.post('/create', verify, async (req, res) => {
  if (req.body.type === 'create'
    && req.body.name
    && req.body.userId) {
    // Create new groupServer using request body parameters
    const groupServer = await GroupServer.create({
      name: req.body.name,
      owner: req.body.userId,
      users: [req.body.userId],
      date: new Date(),
      textChannels: [],
    });
    if (groupServer !== null) {
      // Create the new groupServer's first textChannel
      const textChannel = await TextChannel.create({
        name: 'general',
        date: new Date(),
        group_server_id: groupServer._id,
        chat_log: [],
      });
      if (textChannel !== null) {
        // Push the new textChannel Id into the groupServer's textChannels property
        await GroupServer.findByIdAndUpdate(groupServer._id, {
          $push: { textChannels: textChannel._id },
        });
        // Push the new groupServer Id into the user's groupServers property
        const user = await User.findByIdAndUpdate(
          req.body.userId,
          { $push: { group_servers: groupServer._id } },
          { new: true },
        );
        if (user !== null) {
          // Return the new groupServer to client
          const _textChannel = {};
          _textChannel[textChannel._id] = {
            groupServerId: textChannel.group_server_id,
            name: textChannel.name,
            date: textChannel.date,
          };
          const _groupServer = {
            name: groupServer.name,
            owner: true,
            textChannels: _textChannel,
          };
          res.status(200).json({
            success: true, message: 'Success', groupServer: _groupServer, groupServerId: groupServer._id,
          });
        } else res.status(500).json({ success: false, message: 'Something went wrong when updating user info.' });
      } else res.status(500).json({ success: false, message: 'Something went wrong when creating a new text channel.' });
    } else res.status(500).json({ success: false, message: 'Something went wrong when creating a new group server.' });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

// Creates a new channel in a group server
router.post('/create-channel', verify, async (req, res) => {
  if (req.body.type === 'create-channel'
        && req.body.name
        && req.body.userId
        && req.body.groupServerId) {
    // Find the groupServer we want to create a new channel for
    const groupServer = await GroupServer.findById(req.body.groupServerId);
    if (groupServer !== null) {
      // Check whether the user attempting to create a new channel is
      // the owner of the groupServer or an admin
      let permission = groupServer.owner == req.body.userId;
      if (!permission) {
        groupServer.admins.forEach((admin) => {
          if (admin === req.body.userId) {
            permission = true;
          }
        });
      }
      if (permission) {
        // Create the new textChannel
        const textChannel = await TextChannel.create({
          name: req.body.name,
          date: new Date(),
          group_server_id: req.body.groupServerId,
          chat_log: [],
        });
        // Update the groupServer's information to reflect the new textChannel
        // and return the new textChannel to client
        await GroupServer.findByIdAndUpdate(req.body.groupServerId, {
          $push: { textChannels: textChannel._id },
        });
        res.status(200).json({
          success: true,
          message: 'Success.',
          textChannelId: textChannel._id,
          textChannel: {
            groupServerId: textChannel.group_server_id,
            name: textChannel.name,
            date: textChannel.date,
          },
        });
      } else res.status(401).json({ success: false, message: 'The user is not authorized to create channels.' });
    } else res.status(500).json({ success: false, message: 'Something went wrong when searching for a groupServer.' });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

// Returns a single group server
router.post('/find-one', verify, async (req, res) => {
  if (req.body.type === 'find-one'
        && req.body.groupServerId
        && req.body.userId) {
    const groupServer = await GroupServer.findById(req.body.serverId);
    if (groupServer !== null) {
      const server = {};
      const properties = {
        name: groupServer.name,
        invite: groupServer.invite,
      };

      if (req.body.userId == groupServer.owner) {
        properties.owner = true;
      } else if (groupServer.admins && !properties.owner) {
        groupServer.admins.forEach((admin) => {
          if (admin == req.body.userId) {
            properties.admin = true;
          }
        });
      }
      server[groupServer._id] = properties;
      res.status(200).json({ success: true, message: 'Success', server });
    } else res.status(500).json({ success: false, message: 'No match found.' });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

// Returns a dictionary of groupServers
// that match the id's from req.body.servers
// key = _id, value = {name: String, inviteCode: String, owner/admin: boolean, textChannels: Object}
router.post('/find', verify, async (req, res) => {
  if (req.body.type === 'find' && req.body.userId) {
    const groupServers = {};
    // Find the user's groupServers
    const _groupServers = await GroupServer.find({ users: req.body.userId });
    if (_groupServers.length > 0) {
      // Iterate through each groupServer. Put the iteration inside a promise
      // to force compiler to "wait" before returning to client
      const promise = new Promise((resolve) => {
        _groupServers.forEach(async (groupServer, index, array) => {
          // Push groupServer info. to the groupServers object
          const properties = {
            name: groupServer.name,
            owner: (req.body.userId == groupServer.owner) ? true : undefined,
          };
          // Check whether the user is an admin
          if (groupServer.admins && !properties.owner) {
            groupServer.admins.forEach((admin) => {
              if (admin == req.body.userId) {
                properties.admin = true;
              }
            });
          }
          // Give user access to invite code if they are the owner/admin
          if (properties.owner || properties.admin) {
            const invite = await Invite.findOne({ group_server_id: groupServer._id });
            if (invite !== null) {
              properties.inviteCode = invite.code;
            }
          }

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
          properties.textChannels = textChannels;
          groupServers[groupServer._id] = properties;

          // End promise after the last groupServer
          if (index === array.length - 1) resolve();
        });
      });
      promise.then(() => {
        // Return the group servers to client as well as the textChannels
        // and invites if they were requested
        res.status(200).json({
          success: true,
          message: 'Success',
          groupServers,
        });
      });
    } else res.status(200).json({ success: false, message: 'No group servers found.', groupServers: null });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

router.post('/get-chat-log', verify, async (req, res) => {
  if (req.body.type === 'get-chat-log' && req.body.textChannelId) {
    try {
      const textChannel = await TextChannel.findById(req.body.textChannelId);
      if (textChannel !== null) { res.status(200).json({ success: true, message: 'Success.', chatLog: textChannel.chat_log }); } else { res.status(400).json({ success: false, message: 'Failed. No match found.' }); }
    } catch (e) {
      res.status(500).json({ success: false, message: 'Failed. Something went wrong.', err: e });
    }
  } else res.status(400).json({ success: false, message: `Failed. Bad request. \n${JSON.stringify(req.body)}` });
});

// Verifies whether a user is part of a groupServer and has access to the channel
router.post('/verify', verify, async (req, res) => {
  if (req.body.type === 'verify'
        && req.body.userId
        && req.body.groupServerId
        && req.body.textChannelId) {
    try {
      const groupServer = await GroupServer.find(
        { _id: req.body.groupServerId, users: req.body.userId },
      );
      const textChannel = await TextChannel.findById(req.body.textChannelId);
      res.status(200).json({ success: true, message: 'Success.', access: (groupServer !== null && textChannel !== null) });
    } catch (e) {
      res.status(500).json({ success: false, message: 'Failed. Something went wrong.', err: e });
    }
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

// Creates an invite for a group server
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

// Deletes a group server
router.post('/delete', verify, async (req, res) => {
  if (req.body.type === 'delete' && req.body.groupServerId) {
    // Find the group server we want to delete
    const groupServer = await GroupServer.findById(req.body.groupServerId);
    if (groupServer !== null) {
      // Check whether the user making the delete request is authorized
      if (groupServer.owner == req.body.userId) {
        // Remove the group server and its text channels as well as its invite code
        try {
          await GroupServer.findByIdAndDelete(groupServer._id);
          await TextChannel.deleteMany({ group_server_id: groupServer._id });
          await Invite.findOneAndDelete({ group_server_id: groupServer._id });
          const users = await User.find({ group_servers: groupServer._id });
          if (users.length > 0) {
            users.forEach(async (user) => {
              await User.findByIdAndUpdate(user._id, { $pull: { group_servers: groupServer._id } });
            });
          }
          res.status(200).json({ success: true, message: 'Success' });
        } catch (e) {
          res.status(500).json({ success: false, message: `Something went wrong when deleting the group server.\n${e}`, err: e });
        }
      } else res.status(401).json({ success: false, message: 'The requesting user is not the owner of the group server.' });
    } else res.status(500).json({ success: false, message: 'Something went wrong when looking for the group server to delete.' });
  } else res.status(400).json({ success: false, message: `Failed. Bad request.\n${JSON.stringify(req.body)}` });
});

module.exports = router;
