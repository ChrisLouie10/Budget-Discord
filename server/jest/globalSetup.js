require('dotenv').config();
const mongoose = require('mongoose');

// eslint-disable-next-line
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_SERVER, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// eslint-disable-next-line
afterAll(async () => {
  await setTimeout(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  }, 500);
});
