const GroupServer = require('../models/GroupServer.js');
const User = require('../models/User');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const verify = require('../auth/verifyToken');


function generateAccessToken(user){
    return jwt.sign({user}, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '30m'});
}

router.post('/create', verify, async (req, res) => {
    GroupServer.create({
        serverName: req.body.serverName,
        serverId: req.body.serverId,
        owner: req.body.userId,
        users: [req.body.userId],
    },
    (err, groupServer) => {
        if (err){
            res.statusMessage = err;
            res.status(500).send(err);
        }
        else{
            const server = {
                serverName: req.body.serverName,
                serverId: req.body.serverId
            }
            if (req.user.servers)
                req.user.servers.push(server);
            else{
                req.user.servers = [];
                req.user.servers.push(server);
            }
            User.findOneAndUpdate({_id: req.body.userId}, {servers: req.user.servers}, {new: true}, (err, _user) => {
                if (err){
                    res.statusMessage = err;
                    res.status(500).json({success: false, message: err});
                }
                else{
                    res.status(200).json({success: true, message: 'Success', user: _user});
                }
            });
        }
    });
});

module.exports = router;