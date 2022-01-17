require('dotenv').config();
const mongoose = require('mongoose');
const passwordUtils = require('../lib/utils/passwordUtils');

// eslint-disable-next-line
jest.mock('../lib/utils/passwordUtils');

// eslint-disable-next-line
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_SERVER, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  passwordUtils.hashPassword.mockResolvedValue('testHashPassword');
  passwordUtils.comparePasswords.mockResolvedValue(true);
});

// eslint-disable-next-line
afterEach(() => {
  // eslint-disable-next-line
  jest.clearAllMocks();
});

// eslint-disable-next-line
afterAll(async () => {
  await setTimeout(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }, 500);
});
