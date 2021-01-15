const GroupServer = require('../models/GroupServer.js');
const User = require('../models/User');
const router = require('express').Router();
const verify = require('../auth/verifyToken');

router.post('/create', verify, async (req, res) => {
    GroupServer.create({
        serverName: req.body.serverName,
        owner: req.body.userId,
        users: [req.body.userId],
    },
    (err, groupServer) => {
        if (err){
            res.statusMessage = err;
            res.status(500).json({success: false, message: err});
        }
        else{
            if (req.user.servers)
                req.user.servers.push(groupServer._id);
            else{
                req.user.servers = [];
                req.user.servers.push(groupServer._id);
            }
            User.findOneAndUpdate({_id: req.body.userId}, {servers: req.user.servers}, {new: true}, (err, user) => {
                if (err){
                    res.statusMessage = err;
                    res.status(500).json({success: false, message: err});
                }
                else res.status(200).json({success: true, message: 'Success', user: user});
            });
        }
    });
});

router.post('/find', verify, async (req, res) => {
    const serverIds = req.body.serverIds;
    let servers = [];

    const promise = serverIds.map((serverId) => {
        return GroupServer.findById(serverId, (err, groupServer) => {
            if (err){
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else{
                const server = {
                    serverName : groupServer.serverName,
                    id: groupServer._id
                }
                servers.push(server);
            }
        });
    });
    
    Promise.all(promise).then(()=>{
        console.log(servers);
        res.status(200).json({success: true, message: 'Success', servers: servers});
    });
});

router.post('/delete', verify, async (req, res) => {
    if (req.serverId){
        GroupServer.findByIdAndDelete(req.body.serverId, (err, groupServer) => {
            if (err) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else{
                const index = req.user.servers.indexOf(req.body.serverId);
                if (index > -1) req.user.servers.splice(index, 1);
                User.findOneAndUpdate({_id: req.body.userId}, {servers: req.user.servers}, {new: true}, (err, user) => {
                    if (err) {
                        res.statusMessage = err;
                        res.status(500).json({success: false, message: err});
                    }
                    else res.status(200).json({success: true, message: 'Success', user: user});
                });
            }
        });
    }
    else res.status(400).json({success: false, message: "server id is null"});
});

module.exports = router;