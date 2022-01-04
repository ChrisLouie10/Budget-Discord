const jwt = require('jsonwebtoken');
const { findUser } = require('../../db/dao/userDao');

// Middleware that checks if a user has a token
// returns the user's data if true
// returns an error if false

async function verify(req, res, next) {
  // check if user has an access token
  let token = req.header('Authorization');
  if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

  // verify access token
  if (token) {
    // eslint-disable-next-line consistent-return
    await jwt.verify(token, process.env.SECRET_AUTH_TOKEN, async (error, id) => {
      if (error) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid',
        });
      }
      // eslint-disable-next-line consistent-return
      const user = await findUser({ _id: id._id });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is not valid',
        });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Auth token is not supplied',
    });
  }
}

function generateToken(id) {
  return jwt.sign({ _id: id }, process.env.SECRET_AUTH_TOKEN, { expiresIn: '1h' });
}

module.exports = {
  verify,
  generateToken,
};
