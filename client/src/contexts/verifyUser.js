const jwt = require('jsonwebtoken');

module.exports = function verify(){

    // check if user has an access token
    const token = localStorage.getItem('access-token');
    if(!token) {
        console.log('Token missing');
        return false;
    }
    // verify access token
    try{
        const verified = jwt.verify(token, process.env.REACT_APP_SECRET_ACCESS_TOKEN);
        return true;
    }catch(err){
        console.log('Invalid Token');
        return false;
    }
}

