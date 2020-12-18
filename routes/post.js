const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify, (req, res) => {
  res.json({
    posts: {
      title: 'my first post',
      description: 'data you need to be logged in to access.'
    }
  })
});

module.exports = router;