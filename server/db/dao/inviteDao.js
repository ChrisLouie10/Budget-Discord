const Invite = require('../models/Invite');
const GroupServer = require('../models/GroupServer');

async function createInvite(groupServerId, expiration, limit) {
  // generate 10 random characters
  const code = Math.floor((1 + Math.random()) * 0x10000).toString(16)
    + Math.floor((1 + Math.random()) * 0x10000).toString(16);
  const rawInvite = await Invite.create({
    code,
    expiration,
    limit: (limit > 0) ? limit : undefined,
  });
  await GroupServer.findByIdAndUpdate({ _id: groupServerId }, { invite: rawInvite._id });
  return rawInvite;
}

async function deleteInvite(query) {
  return Invite.deleteOne(query);
}

async function findInviteByCode(code) {
  return Invite.findOne({ code });
}

async function AddNumberToInviteUse(inviteId, number) {
  return Invite.findByIdAndUpdate(inviteId, { $inc: { limit: number } });
}

module.exports = {
  createInvite,
  deleteInvite,
  findInviteByCode,
  AddNumberToInviteUse,
};
