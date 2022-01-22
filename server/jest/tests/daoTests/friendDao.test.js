const request = require('supertest');
const app = require('../../../servers/express');
const {
  createUser,
  findUserById
} = require('../../../db/dao/userDao');
const {
  addFriend,
  sendFriendRequest,
  deleteFriend,
} = require('../../../db/dao/friendDao');

const testName = 'testName';
const testEmail = 'testEmail@testEmail.com';
const testPassword = 'testPassword123';

let userId1;
let userId2;

beforeAll(async () => {
  let user = await createUser(testName, testEmail, testPassword);
  expect(user._id).toBeDefined();
  userId1 = user._id;
  user = await createUser(testName, testEmail, testPassword);
  expect(user._id).toBeDefined();
  userId2 = user._id;
});

describe('Testing friendDao methods', () => {

  test('Send Friend Request: should have friend in friend request', async () => {
    await sendFriendRequest(userId1, userId2);
    const user2 = await findUserById(userId2);
    expect(user2.friend_request[0]._id).toMatchObject(userId1);
  });

  test('Adding Friend: both friends should be in each other friends', async () => {
    await addFriend(userId1, userId2);
    const user1 = await findUserById(userId1);
    expect(user1.friends[0]._id).toMatchObject(userId2);
    const user2 = await findUserById(userId2);
    expect(user2.friends[0]._id).toMatchObject(userId1);
  });

  test('Removing Friend: should no longer be friends', async () => {
    await deleteFriend(userId1, userId2);
    const user1 = await findUserById(userId1);
    expect(user1.friends.length).toBe(0);
    const user2 = await findUserById(userId2);
    expect(user2.friends.length).toBe(0);
  });
  
});