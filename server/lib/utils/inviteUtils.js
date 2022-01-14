const { deleteInvite, AddNumberToInviteUse } = require('../../db/dao/inviteDao');

function checkInviteExpiration(invite) { // returns true if not expired
  const creationDate = invite.date;
  const currentDate = new Date();
  const timeLapse = (currentDate.getTime() - creationDate.getTime()) / 60000;
  return invite.expiration <= 0 || (timeLapse < invite.expiration && invite.limit !== 0);
}

async function decreaseInviteUse(invite) {
  if (invite.limit) {
    await AddNumberToInviteUse(invite._id, -1);
    if (invite.limit - 1 <= 0) await deleteInvite({ _id: invite._id });
  }
}

module.exports = {
  checkInviteExpiration,
  decreaseInviteUse,
};
