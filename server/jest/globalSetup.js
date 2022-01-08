const mongoose = require('mongoose');

// eslint-disable-next-line
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost/budget-discord-test-env', {
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
