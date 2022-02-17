const request = require('supertest');
const app = require('../../../servers/express');
const Users = require('../../../db/dao/userDao');
const ChatLogs = require('../../../db/dao/chatLogDao');
const PrivateChat = require('../../../db/dao/privateChatDao');
const PrivateChatUtils = require('../../../lib/utils/privateChatUtils');

jest.mock('../../../db/dao/userDao');
jest.mock('../../../db/dao/chatLogDao');
jest.mock('../../../db/dao/privateChatDao');
jest.mock('../../../lib/utils/privateChatUtils');

const testUser = {
  _id: '61e39d1995404235acc624ae',
  name: 'testName',
  email: 'testemail@testEmail.com',
  password: 'testPassword123',
};
const testFriend = {
  _id: '61e39d1995404235acc676er',
  name: 'testFriend',
  email: 'testfriend@testEmail.com',
  password: 'testPassword123',
};
const testPrivateChat = {
  _id: '615ird1995404235acc624ea',
  users: ['61e39d1995404235acc624ae', '61e39d1995404235acc624ej'],
  name: 'testFriendName',
  chat_log: 'chatLogId',
  createdAt: new Date(),
};
const testFormattedPrivateChat= {
  id: '61e39d1995404235acc624e1',
  name: 'serverName',
  users: {
      '61e39d1995404235acc624ae': {id: '61e39d1995404235acc624ae',
      name: 'ab',
      numberID: 123}
  }
};
const testChatLog = {
  _id: '61e39d1995404235acc624eb',
  chat_log: [],
};
const testPrivateChatId = '56e39d1995404235acc624ea'
const testId = '61e39d1995404235acc624ea';
const testFriendId = '61e39d1995404235acc624ej';

let cookie;

beforeAll(async () => {
    Users.createUser.mockResolvedValue(testUser);
    Users.findUserById.mockResolvedValue(testUser);
    const createResponse = await request(app)
      .post('/api/user/register')
      .set({ 'Content-Type': 'application/json' })
      .send({
        name: 'testName',
        email: 'testEmail@testEmail.com',
        password: 'testPassword123',
    });
    expect(createResponse.statusCode).toBe(201);
    expect(Users.createUser.mock.calls.length).toBe(1);
    cookie = createResponse.headers['set-cookie'];
});

describe('Testing private chat endpoints', () => {
    test('Find Private Chats: User has private chats', async () => {
        PrivateChat.findPrivateChatsByUserId.mockResolvedValueOnce([testPrivateChat]);
        PrivateChatUtils.formatRawPrivateChat.mockResolvedValueOnce(testFormattedPrivateChat);
        const response = await request(app)
          .get('/api/private-chat/')
          .set({
            'Cookie': cookie,
            'Content-Type': 'application/json',
          });
        expect(response.statusCode).toBe(200);
        expect(Users.findUserById.mock.calls.length).toBe(1);
        expect(PrivateChat.findPrivateChatsByUserId.mock.calls.length).toBe(1);
        expect(PrivateChatUtils.formatRawPrivateChat.mock.calls.length).toBe(1);
    });
    
    test('Find Private Chats: User has no private chats', async () => {
        PrivateChat.findPrivateChatsByUserId.mockResolvedValueOnce([]);
        const response = await request(app)
          .get('/api/private-chat/')
          .set({
            'Cookie': cookie,
            'Content-Type': 'application/json',
          });
        expect(response.statusCode).toBe(200);
        expect(Users.findUserById.mock.calls.length).toBe(1);
        expect(PrivateChat.findPrivateChatsByUserId.mock.calls.length).toBe(1);
    })

    test('Find Private Chats: Unexpected error occurs', async () => {
        const response = await request(app)
          .get('/api/private-chat/')
          .set({
            'Cookie': cookie,
            'Content-Type': 'application/json',
          });
        expect(response.statusCode).toBe(500);
        expect(Users.findUserById.mock.calls.length).toBe(1);
    });

    test('Create Private Chat: Successfully create', async () => {
      Users.findUserById.mockResolvedValueOnce(testFriend);
      PrivateChat.findPrivateChatByUsers.mockResolvedValueOnce();
      PrivateChat.createPrivateChat.mockResolvedValueOnce(testPrivateChat);
      const response = await request(app)
      .post('/api/private-chat/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        userId: testId, 
        friendId: testFriendId,
      });
      expect(response.statusCode).toBe(201);
      expect(Users.findUserById.mock.calls.length).toBe(2);
      expect(PrivateChat.createPrivateChat.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatByUsers.mock.calls.length).toBe(1);
    });

    test('Create Private Chat: Fail to create', async () => {
      Users.findUserById.mockResolvedValueOnce(testFriend);
      PrivateChat.findPrivateChatByUsers.mockResolvedValueOnce();
      PrivateChat.createPrivateChat.mockResolvedValueOnce();
      const response = await request(app)
      .post('/api/private-chat/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        userId: testId, 
        friendId: testFriendId,
      });
      expect(response.statusCode).toBe(500);
      expect(Users.findUserById.mock.calls.length).toBe(2);
      expect(PrivateChat.createPrivateChat.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatByUsers.mock.calls.length).toBe(1);
    });

    test('Create Private Chat: Unexpected error occurs', async () => {
      const response = await request(app)
      .post('/api/private-chat/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        userId: testId, 
        friendId: testFriendId,
      });
      expect(response.statusCode).toBe(500);
      expect(Users.findUserById.mock.calls.length).toBe(2);
    });
    
    test('Create Private Chat: Friend Does Not Exist', async () => {
      Users.findUserById.mockResolvedValueOnce(testUser);
      Users.findUserById.mockResolvedValueOnce();
      const response = await request(app)
      .post('/api/private-chat/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        userId: testId, 
        friendId: testFriendId,
      });
      expect(response.statusCode).toBe(404);
      expect(Users.findUserById.mock.calls.length).toBe(2);
    });

    test('Create Private Chat: Private Chat Exists', async () => {
      Users.findUserById.mockResolvedValueOnce(testFriend);
      PrivateChat.findPrivateChatByUsers.mockResolvedValueOnce(testPrivateChat);
      const response = await request(app)
      .post('/api/private-chat/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        userId: testId, 
        friendId: testFriendId,
      });
      expect(response.statusCode).toBe(400);
      expect(Users.findUserById.mock.calls.length).toBe(2);
      expect(PrivateChat.findPrivateChatByUsers.mock.calls.length).toBe(1);
    });

    test('Find Private Chat Between 2 Users: Successfully find', async () => {
      PrivateChat.findPrivateChatByUsers.mockResolvedValueOnce(testPrivateChat);
      const response = await request(app)
        .get(`/api/private-chat/${testFriendId}`)
        .set({
          'Cookie': cookie,
          'Content-Type': 'application/json',
        });
      expect(response.statusCode).toBe(201);
      expect(Users.findUserById.mock.calls.length).toBe(2);
      expect(PrivateChat.findPrivateChatByUsers.mock.calls.length).toBe(1);
    });

    test('Find Private Chat Between 2 Users: Chat Does Not Exist', async () => {
      PrivateChat.findPrivateChatByUsers.mockResolvedValueOnce();
      const response = await request(app)
        .get(`/api/private-chat/${testFriendId}`)
        .set({
          'Cookie': cookie,
          'Content-Type': 'application/json',
        });
      expect(response.statusCode).toBe(400);
      expect(Users.findUserById.mock.calls.length).toBe(2);
      expect(PrivateChat.findPrivateChatByUsers.mock.calls.length).toBe(1);
    });

    test('Find Private Chat Between 2 Users: Friend Does Not Exist', async () => {
      Users.findUserById.mockResolvedValueOnce(testUser);
      Users.findUserById.mockResolvedValueOnce();
      const response = await request(app)
        .get(`/api/private-chat/${testFriendId}`)
        .set({
          'Cookie': cookie,
          'Content-Type': 'application/json',
        });
      expect(response.statusCode).toBe(404);
      expect(Users.findUserById.mock.calls.length).toBe(2);
    });

    test('Delete a Private Chat: Successfully delete', async () => {
      PrivateChat.findPrivateChatById.mockResolvedValueOnce(testPrivateChat);
      const response = await request(app)
      .delete(`/api/private-chat/${testPrivateChatId}`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(200);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
    });

    test('Delete a Private Chat: Private Chat Does Not Exist', async () => {
      PrivateChat.findPrivateChatById.mockResolvedValueOnce();
      const response = await request(app)
      .delete(`/api/private-chat/${testPrivateChatId}`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(404);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
    });

    test('Delete a Private Chat: User Has No Permission', async () => {
      Users.findUserById.mockResolvedValueOnce(testFriend);
      PrivateChat.findPrivateChatById.mockResolvedValueOnce(testPrivateChat);
      const response = await request(app)
      .delete(`/api/private-chat/${testPrivateChatId}`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(401);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
    });

    test('Delete a Private Chat: Unexpected error occurs', async () => {
      PrivateChat.findPrivateChatById.mockResolvedValueOnce({});
      const response = await request(app)
      .delete(`/api/private-chat/${testPrivateChatId}`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(500);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
    });

    test('Find ChatLog: Successfully find', async () => {
      PrivateChat.findPrivateChatById.mockResolvedValueOnce(testPrivateChat);
      ChatLogs.findChatLogById.mockResolvedValueOnce(testChatLog);
      const response = await request(app)
      .get(`/api/private-chat/${testPrivateChatId}/chat-logs`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(200);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
      expect(ChatLogs.findChatLogById.mock.calls.length).toBe(1);
    });

    test('Find ChatLog: Private Chat Does Not Exist', async () => {
      PrivateChat.findPrivateChatById.mockResolvedValueOnce();
      const response = await request(app)
      .get(`/api/private-chat/${testPrivateChatId}/chat-logs`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(404);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
    });

    test('Find ChatLog: User Has No Permission', async () => {
      Users.findUserById.mockResolvedValueOnce(testFriend);
      PrivateChat.findPrivateChatById.mockResolvedValueOnce(testPrivateChat);
      const response = await request(app)
      .get(`/api/private-chat/${testPrivateChatId}/chat-logs`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(401);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
    });

    test('Find ChatLog: ChatLog Not Found', async () => {
      PrivateChat.findPrivateChatById.mockResolvedValueOnce(testPrivateChat);
      ChatLogs.findChatLogById.mockResolvedValueOnce();
      const response = await request(app)
      .get(`/api/private-chat/${testPrivateChatId}/chat-logs`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(404);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
      expect(ChatLogs.findChatLogById.mock.calls.length).toBe(1);
    });

    test('Find ChatLog: Unexpected Error', async () => {
      PrivateChat.findPrivateChatById.mockResolvedValueOnce(testPrivateChat);
      ChatLogs.findChatLogById.mockResolvedValueOnce({});
      const response = await request(app)
      .get(`/api/private-chat/${testPrivateChatId}/chat-logs`)
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(500);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(PrivateChat.findPrivateChatById.mock.calls.length).toBe(1);
      expect(ChatLogs.findChatLogById.mock.calls.length).toBe(1);
    });
});