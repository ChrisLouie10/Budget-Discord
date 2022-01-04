const bcrypt = require('bcryptjs');

function comparePasswords(password1, password2) {
  return bcrypt.compare(password1, password2);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

module.exports = {
  comparePasswords,
  hashPassword,
};
