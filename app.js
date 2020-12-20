const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

//Import Routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');

mongoose.connect('mongodb://localhost/budget-discord', {
  useUnifiedTopology: true,  
  useNewUrlParser: true
});
const db = mongoose.connection
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));

app.get('/', (req, res) => {
  res.send('I eat ass');
});

app.use(express.json());

app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);

app.listen(5000, () => console.log('connected'));