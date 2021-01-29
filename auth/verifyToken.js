const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware that checks if a user has a token
// returns the user's data if true
// returns an error if false

const verify = async function (req, res, next){

    // check if user has an access token
    let token = req.header('Authorization');
    if(token.startsWith('Bearer ')) token = token.slice(7, token.length);

    // verify access token
    if(token){
        await jwt.verify(token, process.env.SECRET_AUTH_TOKEN, (err, id) => {
            if(err) {
<<<<<<< HEAD
                return res.status(401).json({
=======
                return res.json({
>>>>>>> f0fbb3e6f45f9b9b3bf27ee65a1038b987a0a335
                    success: false, 
                    message: 'Token is not valid'
                });
            } else{
                User.findOne({_id: id._id}, (err, obj) => {
                    req.user = obj;
                    next();
                });
            }
        });
    }else{
<<<<<<< HEAD
        res.status(401).json({
=======
        res.json({
>>>>>>> f0fbb3e6f45f9b9b3bf27ee65a1038b987a0a335
            success: false,
            message: 'Auth token is not supplied'
        });
    }
}

module.exports = verify;



