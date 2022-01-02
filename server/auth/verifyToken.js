const jwt = require('jsonwebtoken');
const User = require('../db/models/User');

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
                return res.status(401).json({
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
        res.status(401).json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
}

module.exports = verify;



