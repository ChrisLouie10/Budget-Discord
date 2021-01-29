const User = require('../models/User');
const GroupServer = require('../models/GroupServer.js');
const TextChannel = require('../models/TextChannel.js');
const Invite = require("../models/Invite");
const router = require('express').Router();
const verify = require('../auth/verifyToken');

//expiration is in minutes
//0 limit = infinite use
async function createInvite(groupServerId, expiration, limit){

    let code;
    //Generate random 10 digit code if no expiration
    if (expiration <= 0){
        code = Math.floor((1 + Math.random()) * 0x10000).toString(16)
        + Math.floor((1 + Math.random()) * 0x10000).toString(16);
    }
    else{
        code = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
        + Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    try{ 
        await Invite.deleteMany({group_server_id: groupServerId});
        let invite = await Invite.create({
            group_server_id: groupServerId,
            code: code,
            date: new Date(),
            expiration: expiration,
            limit: (limit > 0) ? limit : undefined
        });
        return invite;
    } catch (e) {
        return e;
    }
}

router.post('/create', verify, async (req, res) => {
    if (req.body.type === "create" &&
        req.body.name &&
        req.body.userId){
        await GroupServer.create({
            name: req.body.name,
            owner: req.body.userId,
            users: [req.body.userId],
            date: new Date(),
            textChannels: []
        },
        async (err, groupServer) => {
            if (err){
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else if (groupServer !== null){
                try{
                    const textChannel = await TextChannel.create({
                        name: "general",
                        date: new Date(),
                        group_server_id: groupServer._id,
                        chat_log: []
                    });
                    await GroupServer.findByIdAndUpdate(groupServer._id, {$push : {textChannels : textChannel._id}});
                }catch(e){
                    res.status(500).json({success: false, message: 'Something went wrong when creating a text channel.', err: e});
                    return;
                }
                User.findByIdAndUpdate(req.body.userId, 
                {$push : { groupServers : groupServer._id }}, 
                {new: true}, 
                async (err, user) => {
                    if (err){
                        res.statusMessage = err;
                        res.status(500).json({success: false, message: err});
                    }
                    else if (user !== null){
                        const server = {
                            id: groupServer._id,
                            name: groupServer.name
                        };
                        res.status(200).json({success: true, message: 'Success', server: server});
                    }
                    else res.status(500).json({success: false, message: 'Something went wrong when updating user info.'});
                });
            }
            else res.status(500).json({success: false, message: 'Something went wrong when creating a new group server.'});
        });
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post("/create-channel", verify, async (req, res) => {
    if (req.body.type === "create-channel" &&
        req.body.name &&
        req.body.userId &&
        req.body.groupServerId){
        try{
            let groupServer = await GroupServer.findById(req.body.groupServerId);
            let permission = groupServer.owner == req.body.userId;
            if (!permission){
                groupServer.admins.forEach((admin) => {
                    if (admin == req.body.userId){
                        permission = true;
                        return;
                    }
                });
            }
            if (permission){
                const textChannel = await TextChannel.create({
                    name: req.body.name,
                    date: new Date(),
                    group_server_id: req.body.groupServerId,
                    chat_log: []
                });
                groupServer = await GroupServer.findByIdAndUpdate(req.body.groupServerId, {$push : {textChannels : textChannel._id}}, {new : true});
                res.status(200).json({success: true, message: "Success.", textChannel: textChannel});
            }
            else res.status(401).json({success: false, message: 'The user is not authorized to create channels.'});
        } catch(e){
            res.statusMessage = e;
            res.status(500).json({success: false, message: "Something went wrong.", err: e});
        }
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/find-one', verify, async (req, res) => {
    if (req.body.type === "find-one" && 
        req.body.groupServerId && 
        req.body.userId){
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
                if (req.body.userId == groupServer.owner)
                    properties.owner = true;
                else if (groupServer.admins){
                    groupServer.admins.forEach((admin) => {
                        if (admin == req.body.userId){
                            properties.admin = true;
                            return;
                        }
                    });
                }
                server[groupServer._id] = properties;
                res.status(200).json({success: true, message: 'Success', server: server});
            }
            else res.status(200).json({success: false, message: 'No match found. ', server: null});
        });
    }   
    else res.status(400).json({success: false, message: 'Failed. Bad request.\n' + JSON.stringify(req.body)});
});

//Returns a dictionary of groupServers
//that match the id's from req.body.servers
//key = _id, value = {name: String, invite: Object, admin: boolean} 
router.post('/find', verify, async (req, res) => {
    if (req.body.type === "find" && req.body.userId){
        let _groupServers = {};
        let textChannels = {};
        let inviteCodes = {};
        await GroupServer.find({users: req.body.userId}, async (err, groupServers) => {
            if (err) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else if (groupServers.length > 0){
                const promise = new Promise((resolve, reject) => {
                    groupServers.forEach(async (groupServer, index, array) => {
                        const properties = {
                            name: groupServer.name,
                            invite: groupServer.invite,
                            owner: (req.body.userId == groupServer.owner) ? true : undefined,
                            textChannels: groupServer.textChannels
                        };
                        if (groupServer.admins){
                            groupServer.admins.forEach((admin) => {
                                if (admin == req.body.userId){
                                    properties.admin = true;
                                    return;
                                }
                            });
                        }
                        _groupServers[groupServer._id] = properties;

                        if(req.body.getTextChannels){
                            await TextChannel.find({group_server_id: groupServer._id}, (err, textChannels_) => {
                                if (err) {
                                    res.statusMessage = err;
                                    res.status(500).json({success: false, message: err});
                                    reject();
                                }
                                else if (textChannels_ !== null){
                                    textChannels_.forEach(textChannel => {
                                        const properties = {
                                            groupServerId: textChannel.group_server_id,
                                            name: textChannel.name,
                                            date: textChannel.date,
                                            chatLog: textChannel.chat_log
                                        };
                                        textChannels[textChannel._id] = properties;
                                    });
                                }
                            });
                        }
                        if (req.body.getInviteCodes){
                            const _invite = await Invite.findOne({group_server_id: groupServer._id});
                            if (!(_invite instanceof Error)) {
                                if (_invite !== null) inviteCodes[groupServer._id] = _invite.code;
                            }
                            else{
                                res.status(500).json({success: false, message: "Failed"});
                                reject();
                            }
                        }
                        if (index === array.length - 1) resolve();
                    });
                });
                promise.then(()=>{
                    res.status(200).json({
                        success: true, 
                        message: 'Success', 
                        servers: _groupServers, 
                        textChannels: req.body.getTextChannels ? textChannels : undefined,
                        inviteCodes: req.body.getInviteCodes ? inviteCodes : undefined
                    });
                });
            }
            else res.status(200).json({
                success: false, 
                message: 'Success', 
                servers: {}, 
                textChannels: req.body.getTextChannels ? {} : undefined,
                inviteCodes: req.body.getInviteCodes ? {} : undefined
            });
        });
    }   
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/verify', verify, async (req, res) => {
    if (req.body.type === "verify" && req.body.userId && req.body.groupServerId){
        try{
            const groupServer = await GroupServer.find({users: req.body.userId, 
                _id: req.body.groupServerId});
            const textChannel = await TextChannel.findById(req.body.textChannelId);
            res.status(200).json({success: true, message: 'Success.', access: (groupServer !== null && textChannel !== null)});
        } catch(e){
            res.status(500).json({success: false, message: "Failed. Something went wrong.", access: false, err: e});
        }
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/create-invite', verify, async (req, res) => {
    if (req.body.type === "create-invite" 
        && req.body.userId 
        && req.body.groupServerId
        && req.body.expiration
        && req.body.limit){
        GroupServer.findById(req.body.groupServerId, async (err, groupServer) => {
            if (err) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else{
                const invite = await createInvite(req.body.groupServerId, req.body.expiration, req.body.limit);
                if (!(invite instanceof Error)) res.status(200).json({success: true, message: "Success", code: invite.code});
                else res.status(500).json({success: false, message: "Failed", err: invite});
            }
        });
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post('/join', verify, async (req, res) => {
    if (req.body.type === "join" && req.body.userId && req.body.inviteCode){
        //Retrieve invite from DB
        const invite = await Invite.findOne({code: req.body.inviteCode});
        if (!(invite instanceof Error)){    
            //Check if invite is expired
            const creationDate = invite.date;
            const currentDate = new Date();
            //time-lapse in minutes
            const timeLapse = (currentDate.getTime() - creationDate.getTime()) / 60000;
            if (invite.expiration <= 0 || (timeLapse < invite.expiration && invite.limit !== 0)){
                GroupServer.findById(invite.group_server_id, async (err, groupServer) => {
                    if (!err){
                        //Check if requesting member is already a member of the group server
                        let alreadyMember = false;
                        groupServer.users.forEach(user => {
                            if (user == req.body.userId){
                                alreadyMember = true;
                                return;
                            }
                        });
                        if (!alreadyMember){
                            const _groupServer = await GroupServer.findByIdAndUpdate(invite.group_server_id, {$push : {users: req.body.userId}}, {new: true});
                            if (!(_groupServer instanceof Error)){
                                //Decrease invite number of uses left, if there is a limit
                                if (invite.limit){
                                    invite.limit--;
                                    if (invite.limit <= 0){
                                        const _invite = await Invite.findOneAndDelete(invite._id);
                                        if (!(invite instanceof Error)){
                                            const user = await User.findByIdAndUpdate(req.body.userId, {$push : {groupServers : _groupServer.id}});
                                            if (!(user instanceof Error)) res.status(200).json({success: true, message: 'Success.', serverId: _groupServer._id, user: user});
                                            else res.status(500).json({success: false, message: "Failed to update user information.", err: user});
                                        }
                                        else res.status(500).json({success: false, message: "Failed to remove expired invite. However, the user successfully joined the group server.", err: _invite});
                                    }
                                }
                                else {
                                    const user = await User.findByIdAndUpdate(req.body.userId, {$push : {groupServers : _groupServer.id}});
                                    if (!(user instanceof Error)) res.status(200).json({success: true, message: 'Success.', serverId: _groupServer._id, user: user});
                                    else res.status(500).json({success: false, message: "Failed to update user information.", err: user});
                                }
                            }
                            else res.status(500).json({success: false, message: "Failed to add user to the group server.", err: _groupServer});
                        }
                        else{
                            res.status(400).json({success: false, message: "Requesting user is already part of the group server."});
                        }
                    }
                    else if (err){
                        res.statusMessage = err;
                        res.status(500).json({success: false, message: err});
                    }
                    else if (groupServer === null || !groupServer) res.status(500).json({success: false, message: "Failed. Something went wrong."});
                });
            }
            else{
                const _invite = Invite.findOneAndDelete({code: req.body.inviteCode});
                if (!(invite instanceof Error)) res.status(401).json({success: false, message: "Expired invite code."});
                else res.status(500).json({success: false, message: "Failed to remove expired invite.", err: invite});
            }
        }
        else res.status(500).json({success: false, message: "Failed", err: invite});
    }
    else res.status(400).json({success: false, message: "Failed. Bad request."});
});

router.post("/leave", verify, async (req, res) => {
    if (req.body.type === "leave" && req.body.groupServerId && req.body.userId){
        const groupServer = await GroupServer.findByIdAndUpdate(req.body.groupServerId, {$pull : {users : req.body.userId}}, {new: true});
        if (!(groupServer instanceof Error)){
            const user = await User.findByIdAndUpdate(req.body.userId, {$pull : {groupServers : req.body.groupServerId}}, {new: true});
            if (!(user instanceof Error)){
                res.status(200).json({success: true, message: "Success", user: user});
            }
            else res.status(500).json({success: false, message: "Failed to update new user information.", err: user});
        }   
        else res.status(500).json({success: false, message: "Failed to remove user from Group Server.", err: groupServer});
    }
    else res.status(400).json({success: false, message: 'Failed. Bad request.'});
});

router.post("/delete-channel", verify, async (req, res) => {
    if (req.body.type === "delete-channel" && 
        req.body.groupServerId &&
        req.body.textChannelId &&
        req.body.userId){
            try{
                const groupServer = await GroupServer.findById(req.body.groupServerId);
                let authorized = groupServer.owner == req.body.userId;
                if (!authorized){
                    groupServer.admins.forEach(admin => {
                        if (admin == req.body.userId){
                            authorized = true;
                            return;
                        }
                    });
                }
                if (authorized){
                    const deletedTextChannel = await TextChannel.findByIdAndDelete(req.body.textChannelId);
                    const _groupServer = await GroupServer.findByIdAndUpdate(req.body.groupServerId, {$pull : {textChannels : req.body.textChannelId}});
                    res.status(200).json({success: true, message: "Success."});
                }
                else res.status(401).json({success: false, message: 'The user is not authorized to delete channels.'});
            }catch (e){
                res.status(500).json({success: false, message: 'Something went wrong when deleting a channel.', err: e});
            }
        }
        else res.status(400).json({success: false, message: "Failed. Bad request."}); 
});

router.post('/delete', verify, async (req, res) => {
    if (req.body.type === "delete" && req.body.groupServerId){
        GroupServer.findById(req.body.groupServerId, (err, groupServer) => {
            if (err) {
                res.statusMessage = err;
                res.status(500).json({success: false, message: err});
            }
            else if(groupServer.owner == req.body.userId){
                GroupServer.findByIdAndDelete(req.body.groupServerId, async (err, groupServer) => {
                    if (err) {
                        res.statusMessage = err;
                        res.status(500).json({success: false, message: err});
                    }
                    else {
                        const invite = await Invite.findOneAndDelete({group_server_id : groupServer._id});
                        if (!(invite instanceof Error)) res.status(200).json({success: true, message: 'Success'});
                        else res.status(500).json({success: false, message: "Failed to remove group server's invite code."});
                    }
                });
            }
            else res.status(401).json({success: false, message: 'The requesting user is not the owner of the groupserver.'});
        });
    }
    else res.status(400).json({success: false, message: "Failed. Bad request."});
});

module.exports = router;