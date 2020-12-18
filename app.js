const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/budget-discord', {
  useUnifiedTopology: true,  
  useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', () => console.log('Connected to Database'))

app.get('/', (req, res) => {
  res.send('I eat ass')
});

app.listen(3000, () => console.log('connected'))