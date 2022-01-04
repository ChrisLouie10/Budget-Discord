const mongoose = require('mongoose');

const mongodburi = process.env.mongodburi || 'mongodb://localhost/budget-discord';

mongoose.connect(mongodburi, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
}).then(() => {
  console.log('Connected to database');
}).catch((err) => {
  console.log(err);
});

const mongodb = mongoose.connection;
module.exports = mongodb;
