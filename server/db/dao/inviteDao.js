const Invite = require('../models/Invite');

async function deleteInvite(query) {
  return Invite.deleteOne(query);
}

module.exports = {
  deleteInvite,
};
