const jwt = require('jsonwebtoken');

module.exports = function verify(req, res, next){

    // check if user has an access token
    const token = localStorage.getItem('access-token');
    if(!token) return res.status(400).send('Access Denied');

    // verify access token
    try{
        const verified = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        req.user = verified;
        next();
    }catch(err){
        res.status(400).send('Invalid Token');
    }
}



