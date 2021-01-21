const GroupServer = require('../models/GroupServer.js');
const User = require('../models/User');
const router = require('express').Router();
const verify = require('../auth/verifyToken');

//expiration is in minutes
//0 limit = infinite use
function createInvite(expiration, limit){
    let invite = {};
    
    if (limit > 0) invite.limit = limit;
    if (expiration <= 0){
        //Generate random 10 digit code if no expiration
        invite.code = Math.floor((1 + Math.random()) * 0x10000).toString(16)
            + Math.floor((1 + Math.random()) * 0x10000).toString(16);
    }
    else{
        const date = new Date();
        invite.date = date.toUTCString();
        invite.expiration = expiration;
        invite.code = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
            + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return invite;
}

router.post('/create', verify, async (req, res) => {
    if (req.body.type === "create"){
        GroupServer.create({
            name: req.body.name,
            owner: req.body.userId,
            users: [req.body.userId],
        },
        (err, groupServer) => {
            if (err){
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else{
                const server = {
                    id: groupServer._id,
                    name: groupServer.name
                };
                res.status(200).json({success: true, message: 'Success', server: server});
            }
        });
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/find-one', verify, async (req, res) => {
    if (req.body.type === "find-one" && req.body.serverId && req.body.userId){
        await GroupServer.findById(req.body.serverId, (err, groupServer) => {
            if (err) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else if (groupServer !== null){
                let server = {};
                const properties = {
                    name: groupServer.name,
                    invite: groupServer.invite
                }
                if (req.body.userId === groupServer.owner)
                    properties.owner = true;
                else if (groupServer.admins){
                    groupServer.admins.forEach((admin) => {
                        if (admin === req.body.userId){
                            properties.admin = true;
                            return;
                        }
                    });
                }
                server[groupServer._id] = properties;

                res.status(200).json({success: true, message: 'Success', server: server});
            }
            else res.status(200).json({success: true, message: 'Success', server: null});
        });
    }   
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/find', verify, async (req, res) => {
    if (req.body.type === "find" && req.body.userId){
        let servers = {};
        await GroupServer.find({users: req.body.userId}, (err, groupServers) => {
            if (err) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else{
                groupServers.forEach((groupServer) => {
                    const properties = {
                        name: groupServer.name,
                        invite: groupServer.invite
                    };
                    if (req.body.userId === groupServer.owner)
                    properties.owner = true;
                    else if (groupServer.admins){
                        groupServer.admins.forEach((admin) => {
                            if (admin === req.body.userId){
                                properties.admin = true;
                                return;
                            }
                        });
                    }
                    servers[groupServer._id] = properties;
                });
                res.status(200).json({success: true, message: 'Success', servers: servers});
            }
        });
    }   
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/verify', verify, async (req, res) => {
    if (req.body.type === "verify" && req.body.userId && req.body.serverId){
        const groupServer = await GroupServer.find({users: req.body.userId, 
           _id: req.body.serverId});
        res.status(200).json({success: true, message: 'Success.', access: groupServer !== null});
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/create-invite', verify, async (req, res) => {
    if (req.body.type === "create-invite" 
        && req.body.userId 
        && req.body.serverId
        && req.body.expiration
        && req.body.limit){
        GroupServer.findById(req.body.serverId, (err, groupServer) => {
            if (err || groupServer === null) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else{
                const invite = createInvite(req.body.expiration, req.body.limit);
                GroupServer.findByIdAndUpdate(req.body.serverId, {invite: invite})
                    .catch(err => {
                        res.statusMessage = err;
                        res.status(500).json({success: false, message: err});
                    })
                    .then(groupServer => {
                        res.status(200).json({success: true, message: 'Success', code: invite.code});
                    });
            }
        });
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/join', verify, async (req, res) => {
    if (req.body.type === "join" && req.body.userId && req.body.inviteCode){
        const groupServer = await GroupServer.findOne({"invite.code": req.body.inviteCode});
        if (groupServer === null)
            res.status(401).json({success: false, message: "Invalid invite code."});
        else{
            let alreadyMember = false;
            groupServer.users.forEach(user => {
                if (user === req.body.userId){
                    alreadyMember = true;
                    return;
                }
            });
            if (alreadyMember){
                res.status(400).json({success: false, message: "Requesting user is already part of the group server."});
                return;
            }
            if (groupServer.invite.expiration){
                const creationDate = new Date(groupServer.invite.date);
                const currentDate = new Date();
                const timeLapsed = (currentDate.getTime() - creationDate.getTime()) / 60000;
                console.log("timelapsed in minutes:", timeLapsed);
                if (timeLapsed >= groupServer.invite.expiration){
                    await GroupServer.findByIdAndUpdate(groupServer._id, {invite: null});
                    res.status(401).json({success: false, message: "Expired invite code."});
                    return;
                } 
            }
            if (groupServer.invite.limit === 0){
                await GroupServer.findByIdAndUpdate(groupServer._id, {invite: null});
                res.status(401).json({success: false, message: "Expired invite code."});
            }
            else{
                groupServer.users.push(req.body.userId);
                GroupServer.findOneAndUpdate({_id: groupServer._id}, 
                    {users: groupServer.users, "invite.limit": groupServer.invite.limit ? groupServer.invite.limit - 1 : null},
                    {new: true}, 
                    (err, _groupServer) => {
                    if (err){
                        res.statusMessage = err;
                        res.status(500).json({success: false, message: err});
                    }
                    else if (_groupServer !== null){
                        if (_groupServer.invite.limit === 0)
                            GroupServer.findByIdAndUpdate(_groupServer._id, {invite: null});
                        res.status(200).json({success: true, message: 'Success.', serverId: _groupServer._id});
                    }
                });
            }
        }
    }
    else res.status(400).json({success: false, message: "Failed. Bad request."});
});

router.post('/delete', verify, async (req, res) => {
    if (req.body.type === "delete" && req.body.serverId){
        GroupServer.findById(req.body.serverId, (err, groupServer) => {
            if (err) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else if(groupServer.owner === req.body.userId){
                GroupServer.findByIdAndDelete(req.body.serverId, (err, groupServer) => {
                    if (err) {
                        res.statusMessage = err;
                        res.status(500).json({success: false, message: err});
                    }
                    else res.status(200).json({success: true, message: 'Success'});
                });
            }
            else res.status(401).json({success: false, message: 'The requesting user is not the owner of the groupserver.'});
        });
    }
    else res.status(400).json({success: false, message: "Failed. Bad request."});
});

module.exports = router;