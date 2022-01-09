const router = require('express').Router();
const {
  verify,
  generateToken,
} = require('../lib/utils/tokenUtils');
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  updateNameValidation,
  deleteAccountValidation,
} = require('../lib/validation/authValidation');
const {
  createUser,
  findUser,
  updateUserName,
  updateUserPassword,
  deleteUser,
} = require('../db/dao/userDao');
const {
  comparePasswords,
  hashPassword,
} = require('../lib/utils/passwordUtils');
const {
  userToObject,
} = require('../db/converters/userConverter');

router.get('/', verify, async (req, res) => {
  const user = await findUser({ _id: req.user._id });
  if (user) return res.status(200).json({ success: true, message: 'Success', user: userToObject(user) });
  return res.status(401).json({ success: false, message: 'Denied Access' });
});

router.delete('/logout', verify, async (req, res) => {
  res.cookie('token', '', { httpOnly: true, maxAge: 1 });
  return res.status(200).json({ success: true, message: 'Success' });
});

router.post('/register', async (req, res) => {
  // Validate data before adding user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check if the user's email is already in the database
  if (await findUser({ email: req.body.email })) return res.status(400).json({ success: false, message: 'Email already exists' });

  // Create User and return jwt to user.
  return createUser(req.body.name, req.body.email, await hashPassword(req.body.password))
    .then((token) => {
      res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
      return res.status(201).json({ success: true, message: 'Success' });
    })
    .catch((err) => res.status(500).json({ success: false, message: err }));
});

router.post('/login', async (req, res) => {
  // Validate data before adding user
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check if the user's email is already in the database
  const user = await findUser({ email: req.body.email });
  if (!user) return res.status(400).json({ success: false, message: 'Email or password is incorrect' });

  // Check if password is valid
  const validPass = await comparePasswords(req.body.password, user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Email or password is incorrect' });

  // Create and assign a token to a user
  const token = generateToken(user._id);
  try {
    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
    return res.status(201).json({ success: true, message: 'Success' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to log in' });
  }
});

router.put('/password', verify, async (req, res) => {
  // Validate data
  const { error } = updatePasswordValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check password
  const validPass = await comparePasswords(req.body.oldPassword, req.user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Old Password is Incorrect' });

  // Update password
  return updateUserPassword(req.user._id, await hashPassword(req.body.password))
    .then(() => res.status(200).json({ success: true, message: 'Success' }))
    .catch(() => res.status(500).json({ success: false, message: 'Failed to change password' }));
});

router.put('/name', verify, async (req, res) => {
  // Validate data
  const { error } = updateNameValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check password
  const validPass = await comparePasswords(req.body.password, req.user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Password is incorrect' });

  // Update name
  return updateUserName(req.user._id, req.body.name)
    .then(() => res.status(200).json({ success: true, message: 'Success' }))
    .catch(() => res.status(500).json({ success: false, message: 'Failed to change name' }));
});

router.delete('/', verify, async (req, res) => {
  // Validate data
  const { error } = deleteAccountValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check password
  const validPass = await comparePasswords(req.body.password, req.user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Password is incorrect' });

  // Delete user
  return deleteUser({ _id: req.user._id })
    .then(() => res.status(200).json({ success: true, message: 'Success' }))
    .catch(() => res.status(500).json({ success: false, message: 'Failed to delete account' }));
});

module.exports = router;
