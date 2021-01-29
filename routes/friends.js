const User = require('../models/User');
<<<<<<< HEAD
const router = require('express').Router();
const verify = require ('../auth/verifyToken');

router.post('/find-users', verify, async (req, res) => {
  if(req.body.friendNumber != ""){
    const user = await User.findOne({ name: req.body.friendName, number_id: parseInt(req.body.friendNumber) });
    if(!user) return res.status(404).json({success: false, message: 'No friends found with that name'});
    else return res.status(200).json({ success: true, message: 'Success', friendResult: [{ name: user.name, numberID: user.number_id }] });
  }
  const users = await User.find({name: req.body.friendName});
  if(users.length == 0) return res.status(404).json({ success: false, message: 'No friends found with that name' });
  return res.status(200).json({success: true, message: 'Success', friendResult: users
      .filter((user) => JSON.stringify(user._id) !== JSON.stringify(req.user._id) && !req.user.friends.includes(user._id))
      .map((friend) => { return { name: friend.name, id: friend._id, numberID: friend.number_id }; })
  });
});

router.post('/send-friend-request', verify, async (req, res) => {
  const friend = await User.findOne({ _id: req.body.friendID });
  if(!friend) return res.status(404).json({ success: false, message: 'User does not exist'});

  if(friend.friends.includes(req.user._id) || req.user.friends.includes(req.body.friendID)) return res.status(400).json({ success: false, message: 'Already Friends' });

  if(friend.friend_request.includes(req.user._id)) return res.status(400).json({ success: false, message: 'Friend request already sent' });
  if(req.user.friend_request.includes(req.body.friendID)) {
    try{
      addFriend(req.user._id, req.body.friendID);

      return res.status(200).json({ success: true, message: 'Success' });
    }
    catch{
      return res.status(400).json({ success: false, message: 'Failed to accept Friend Request' }); 
=======
const Friends = require('../models/Friends');
const router = require('express').Router();
const verify = require ('../auth/verifyToken');

router.post('/find', verify, async (req, res) => {
  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});
  console.log(user.friends)

  const friends = await User.find({name: req.body.friendName})
    if(friends.length == 0) return res.status(400).json({success: false, message: 'No friends found with that name'});
    return res.status(200).json({success: true, message: 'Success', friendResult: friends
      .filter((friend) => JSON.stringify(friend._id) !== JSON.stringify(req.user._id) && !user.friends.includes(friend._id))
      .map((friend) => { return {name: friend.name, id: friend._id}; })
    });
});

router.post('/send-friend-request', verify, async (req, res) => {
  const friend = await Friends.findOne({user_id: req.body.friendID});
  if(!friend) return res.status(400).json({success: false, message: 'User cannot be found'});

  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});

  if(friend.friends.includes(req.user._id) || user.friends.includes(req.body.friendID)) return res.status(400).json({success: false, message: 'Already Friends'});

  if(friend.friend_request.includes(req.user._id)) return res.status(400).json({success: false, message: 'Friend request already sent'});
  if(user.friend_request.includes(req.body.friendID)) {
    try{
      addFriend(req.user._id, req.body.friendID);

      return res.status(200).json({success: true, message: 'Success'});
    }
    catch{
      return res.status(400).json({success: false, message: 'Failed to accept Friend Request'}); 
>>>>>>> f0fbb3e6f45f9b9b3bf27ee65a1038b987a0a335
    }
  }

  try{
<<<<<<< HEAD
    const query = { _id: req.body.friendID };
    const set = { $push: { friend_request: req.user._id} };
    await User.updateOne(query, set);
=======
    const query = { user_id: req.body.friendID };
    const set = { $push: { friend_request: req.user._id} };
    await Friends.updateOne(query, set);
>>>>>>> f0fbb3e6f45f9b9b3bf27ee65a1038b987a0a335

    return res.status(200).json({success: true, message: 'Friend Request Sent'});
  }
  catch{
    return res.status(400).json({success: false, message: 'Failed to send friend request'}); 
  }
});

router.post('/accept-friend-request', verify, async (req, res) => {
<<<<<<< HEAD
  const friend = await User.findOne({_id: req.body.friendID});
  if(!friend) return res.status(404).json({success: false, message: 'User does not exist'});

  if(req.user.friends.includes(req.body.friendID) && friend.friends.includes(req.user._id)) 
=======
  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});
  const friend = await Friends.findOne({user_id: req.body.friendID});
  if(!friend) return res.status(400).json({success: false, message: 'Friend cannot be found'});

  if(user.friends.includes(req.body.friendID) && friend.friends.includes(req.user._id)) 
>>>>>>> f0fbb3e6f45f9b9b3bf27ee65a1038b987a0a335
  return res.status(400).json({success: false, message: 'Already friends'});

  try{
    addFriend(req.user._id, req.body.friendID);

    return res.status(200).json({success: true, message: 'Success'});
  }
  catch{
    return res.status(400).json({success: false, message: 'Failed to accept Friend Request'}); 
  }
})

router.get('/get-friend-requests', verify, async (req, res) => {
<<<<<<< HEAD
  let friendRequestUsers = await Promise.all(req.user.friend_request.map(async (friendID) => {
    return await User.find({ _id: friendID });
  }));

  return res.status(200).json({success: true,  message: 'Success', friendRequests: friendRequestUsers.map((friendReq) => {
    return { id: friendReq[0]._id, name: friendReq[0].name, numberID: friendReq[0].number_id };
  })});
})

router.get('/get-friends', verify, async (req, res) => {
  let friends = await Promise.all(req.user.friends.map(async (friendID) => {
    return await User.find({ _id: friendID });
  }));
  
  return res.status(200).json({success: true,  message: 'Success', friends: friends.map((friend) => {
    return { id: friend[0]._id, name: friend[0].name, numberID: friend[0].number_id };
  })});
})

router.delete('/delete-friend', verify, async (req, res) => {
  const friend = await User.findOne({ _id: req.body.friendID });
  if(!friend) return res.status(400).json({success: false, message: 'Friend cannot be found'});

  try{
    const queryUser = { _id: req.user._id};
    const setUser = { $pull: { friends: req.body.friendID } };

    const queryFriend = { _id: req.body.friendID };
    const setFriend = { $pull: { friends: req.user._id }};

    await User.updateOne(queryUser, setUser);
    await User.updateOne(queryFriend, setFriend);
=======
  const userFriends = await Friends.findOne({user_id: req.user._id});
  if(!userFriends) return res.status(400).json({success: false, message: 'User cannot be found'});

  let friendRequestUsers = userFriends.friend_request.map(async (friend) => {
    let data = {};
    data.id = friend;
    let user = await User.findOne({_id: friend});
    data.name = user.name;
    friendRequestUsers.push(data);
  });
  await Promise.all(friendRequestUsers);
  friendRequestUsers.shift();
  return res.status(200).json({success: true,  message: 'Success', friendRequests: friendRequestUsers});
})

router.get('/get-friends', verify, async (req, res) => {
  const userFriends = await Friends.findOne({user_id: req.user._id});
  if(!userFriends) return res.status(400).json({success: false, message: 'User cannot be found'});

  let friends = userFriends.friends.map(async (friend) => {
    let data = {};
    data.id = friend;
    let user = await User.findOne({_id: friend});
    data.name = user.name;
    friends.push(data);
  });
  await Promise.all(friends);
  friends.shift();
  return res.status(200).json({success: true,  message: 'Success', friends: friends});
})

router.delete('/delete-friend', verify, async (req, res) => {
  const user = await Friends.findOne({user_id: req.user._id});
  if(!user) return res.status(400).json({success: false, message: 'User cannot be found'});
  const friend = await Friends.findOne({user_id: req.body.friendID});
  if(!friend) return res.status(400).json({success: false, message: 'Friend cannot be found'});

  try{
    const queryUser = { user_id: req.user._id};
    const setUser = { $pull: { friends: req.body.friendID } };

    const queryFriend = { user_id: req.body.friendID };
    const setFriend = { $pull: { friends: req.user._id }};

    await Friends.updateOne(queryUser, setUser);
    await Friends.updateOne(queryFriend, setFriend);
>>>>>>> f0fbb3e6f45f9b9b3bf27ee65a1038b987a0a335

    return res.status(200).json({success: true, message: 'Success'});
  } catch{
    return res.status(400).json({success: false, message: 'Failed to remove friend'}); 
  }
})

async function addFriend(user_id, friend_id){
<<<<<<< HEAD
  const queryUser = { _id: user_id};
  const setUserPush = { $push: { friends: friend_id } };
  const setUserPull = { $pull: { friend_request: friend_id } };

  const queryFriend = { _id: friend_id };
  const setFriend = { $push: { friends: user_id }};

  await User.updateOne(queryUser, setUserPush);
  await User.updateOne(queryUser, setUserPull);
  await User.updateOne(queryFriend, setFriend);
=======
  const queryUser = { user_id: user_id};
  const setUserPush = { $push: { friends: friend_id } };
  const setUserPull = { $pull: { friend_request: friend_id } };

  const queryFriend = { user_id: friend_id };
  const setFriend = { $push: { friends: user_id }};

  await Friends.updateOne(queryUser, setUserPush);
  await Friends.updateOne(queryUser, setUserPull);
  await Friends.updateOne(queryFriend, setFriend);
>>>>>>> f0fbb3e6f45f9b9b3bf27ee65a1038b987a0a335
}

module.exports = router;