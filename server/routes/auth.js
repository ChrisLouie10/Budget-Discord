require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = require('express').Router();
const User = require('../db/models/User');
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  updateNameValidation,
  deleteAccountValidation,
} = require('../auth/validation');
const verify = require('../auth/verifyToken');
const { createUser, generateRandomNumberId } = require('../db/calls/user');

router.get('/verify', verify, (req, res) => {
  if (req.user) return res.status(200).json({ success: true, message: 'Success', user: req.user });
  return res.status(401).json({ success: false, message: 'Denied Access' });
});

router.post('/register', async (req, res) => {
  // Validate data before adding user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check if the user's email is already in the database
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json({ success: false, message: 'Email already exists' });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // Generate a non copy of a number id
  const numberId = await generateRandomNumberId(req.body.name);

  return createUser(req.body.name, req.body.email, hashPassword, numberId)
    .then((token) => res.status(201).json({ success: true, message: 'Success', Authentication: token }))
    .catch((err) => res.status(500).json({ success: false, message: err }));
});

router.delete('/logout', verify, async (req, res) => res.status(200).json({ success: true, message: 'Success' }));

router.post('/login', async (req, res) => {
  // Validate data before adding user
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check if the user's email is already in the database
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ success: false, message: 'Email or password is incorrect' });

  // Check if password is valid
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Email or password is incorrect' });

  // Create and assign a token to a user
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_AUTH_TOKEN, { expiresIn: '1h' });
  try {
    return res.status(201).json({ success: true, message: 'Success', Authorization: `Bearer ${token}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to log in' });
  }
});

router.patch('/change-password', verify, async (req, res) => {
  // Validate data
  const { error } = updatePasswordValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check password
  const validPass = await bcrypt.compare(req.body.oldPassword, req.user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Old Password is Incorrect' });

  // Update password
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const query = { _id: req.user._id };
    const set = { $set: { password: hashPassword } };
    await User.updateOne(query, set);

    return res.status(200).json({ success: true, message: 'Success' });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

router.patch('/change-name', verify, async (req, res) => {
  // Validate data
  const { error } = updateNameValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check password
  const validPass = await bcrypt.compare(req.body.password, req.user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Password is incorrect' });

  // Update name
  try {
    const numberID = await generateRandomNumberId(req.body.name);
    const query = { _id: req.user._id };
    const set = { $set: { name: req.body.name, number_id: numberID } };
    await User.updateOne(query, set);

    return res.status(200).json({ success: true, message: 'Success' });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to change name' });
  }
});

router.delete('/delete-account', verify, async (req, res) => {
  // Validate data
  const { error } = deleteAccountValidation(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  // Check password
  const validPass = await bcrypt.compare(req.body.password, req.user.password);
  if (!validPass) return res.status(400).json({ success: false, message: 'Password is incorrect' });

  try {
    const query = { _id: req.user._id };
    await User.deleteOne(query);

    return res.status(200).json({ success: true, message: 'Success' });
  } catch {
    return res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

module.exports = router;
