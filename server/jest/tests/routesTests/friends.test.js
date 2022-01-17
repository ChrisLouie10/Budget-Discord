const request = require('supertest');
const app = require('../../../servers/express');
const Users = require('../../../db/dao/userDao');
const Friends = require('../../../db/dao/friendDao');

jest.mock('../../../db/dao/userDao');
jest.mock('../../../db/dao/friendDao');

const testName = 'testName';
const testEmail = 'testEmail@testEmail.com';
const testPassword = 'testPassword123';
const testId = 'testId';
const testFriendId = 'testFriendId';
const testFriendName = 'testFriendName';
const testFriends = [
  { _id: 'testFriendId1', name: 'testFriendName', number_id: 1, friends: [], friend_request: []},
  { _id: 'testFriendId2', name: 'testFriendName', number_id: 2, friends: [], friend_request: []},
  { _id: 'testFriendId3', name: 'testFriendName', number_id: 3, friends: [], friend_request: []},
];

let cookie;

beforeAll(async () => {
  Users.createUser.mockResolvedValue({_id: testId, name: testName, email: testEmail, password: testPassword});
  Users.findUserById.mockResolvedValue({_id: testId, name: testName, email: testEmail, friends: [testFriendId], friend_request: [testFriendId]});
  const createResponse = await request(app)
    .post('/api/user/register')
    .set({ 'Content-Type': 'application/json' })
    .send({
      name: testName,
      email: testEmail,
      password: testPassword,
  });
  expect(createResponse.statusCode).toBe(201);
  expect(Users.createUser.mock.calls.length).toBe(1);
  cookie = createResponse.headers['set-cookie'];
});

describe('Testing basic auth methods', () => {

  test('Find User: three users of the same name', async () => {
    Users.findUsersByName.mockResolvedValueOnce(testFriends);
    const findResponse = await request(app)
      .post('/api/friends/find')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        friendName: testFriendName,
        friendNumber: ''
      });
    expect(findResponse.body.success).toBe(true);
    expect(Users.findUsersByName.mock.calls.length).toBe(1);
    expect(Users.findUserByNameAndNumber.mock.calls.length).toBe(0);
    expect(findResponse.body.friendResult.length).toBe(3);
  });

  test('Find User with Number: first of three friends with numberID of 2', async () => {
    Users.findUsersByName.mockResolvedValueOnce(testFriends);
    Users.findUserByNameAndNumber.mockResolvedValueOnce(testFriends[1]);
    const findResponse = await request(app)
      .post('/api/friends/find')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        friendName: testFriendName,
        friendNumber: '2'
      });
    expect(findResponse.body.success).toBe(true);
    expect(Users.findUsersByName.mock.calls.length).toBe(1);
    expect(Users.findUserByNameAndNumber.mock.calls.length).toBe(1);
    expect(findResponse.body.friendResult.length).toBe(3);
    expect(findResponse.body.friendResult[0].numberID).toBe(2);
  });

  test('Send Friend Request: Should call sendFriendRequest', async () => {
    Friends.sendFriendRequest.mockResolvedValue();
    const sendResponse = await request(app)
      .post('/api/friends/send')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        friendID: testId,
      });
    expect(sendResponse.body.success).toBe(true);
    expect(Users.findUserById.mock.calls.length).toBe(2);
    expect(Friends.sendFriendRequest.mock.calls.length).toBe(1);
  });

  test('Accept Friend Request: Should call addFriend', async () => {
    Friends.addFriend.mockResolvedValue();
    const sendResponse = await request(app)
      .post('/api/friends/accept')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        friendID: testId,
      });
    expect(sendResponse.body.success).toBe(true);
    expect(Users.findUserById.mock.calls.length).toBe(2);
    expect(Friends.addFriend.mock.calls.length).toBe(1);
  });

  test('Get Friend Requests: should return friends', async () => {
    Users.findUsersByIds.mockResolvedValueOnce(testFriends);
    const sendResponse = await request(app)
      .get('/api/friends/requests')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(sendResponse.body.success).toBe(true);
    expect(Users.findUsersByIds.mock.calls.length).toBe(1);
    expect(sendResponse.body.friendRequests.length).toBe(3);
  });

  test('Get Friends: should return friends', async () => {
    Users.findUsersByIds.mockResolvedValueOnce(testFriends);
    const sendResponse = await request(app)
      .get('/api/friends/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(sendResponse.body.success).toBe(true);
    expect(Users.findUsersByIds.mock.calls.length).toBe(1);
    expect(sendResponse.body.friends.length).toBe(3);
  });

  test('Delete Friend: should call deleteFriend', async () => {
    Friends.deleteFriend.mockResolvedValueOnce();
    const sendResponse = await request(app)
      .delete('/api/friends/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(sendResponse.body.success).toBe(true);
    expect(Users.findUserById.mock.calls.length).toBe(2);
    expect(Friends.deleteFriend.mock.calls.length).toBe(1);
  });
  
});