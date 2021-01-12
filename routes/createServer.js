const GroupServer = require('../models/GroupServer.js');
const User = require('../models/User');
const router = require('express').Router();

router.post('/create', async (req, res) => {
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
            User.findOne({_id: req.body.userId}, (err, user) => {
                if (err){
                    res.statusMessage = err;
                    res.status(500).send(err);
                }
                else{
                    const server = {
                        serverName: req.body.serverName,
                        serverId: req.body.serverId
                    }
                    if (user.servers)
                        user.servers.push(server);
                    else{
                        user.servers = [];
                        user.servers.push(server);
                    }
                    User.findOneAndUpdate({_id: req.body.userId}, {servers: user.servers}, {new: true}, (err, _user) => {
                        if (err){
                            res.statusMessage = err;
                            res.status(500).send(err);
                        }
                        else{
                            const data = {
                                user: _user
                            }
                            res.status(200).send(data);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;