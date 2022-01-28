const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../servers/express');
const Users = require('../../../db/dao/userDao');
const GroupServers = require('../../../db/dao/groupServerDao');
const TextChannels = require('../../../db/dao/textChannelDao');
const ChatLogs = require('../../../db/dao/chatLogDao');
const Invites = require('../../../db/dao/inviteDao');
const GroupServerUtils = require('../../../lib/utils/groupServerUtils');
const InviteUtils = require('../../../lib/utils/inviteUtils');

jest.mock('../../../db/dao/userDao');
jest.mock('../../../db/dao/groupServerDao');
jest.mock('../../../db/dao/textChannelDao');
jest.mock('../../../db/dao/chatLogDao');
jest.mock('../../../db/dao/inviteDao');
jest.mock('../../../lib/utils/groupServerUtils');
jest.mock('../../../lib/utils/inviteUtils');

const testUser = {
  _id: '61e39d1995404235acc624e0',
  name: 'testName',
  email: 'testEmail@testEmail.com',
  password: 'testPassword123',
};
const testGroupServer = {
  _id: '61e39d1995404235acc624e1',
  name: 'server 1',
  owner: '61e39d1995404235acc624e0',
  admins: [],
  users: ['61e39d1995404235acc624e0'],
  text_channels: ['61e39d1995404235acc624ea'],
  createdAt: new Date(),
};
const testFormattedGroupServer = {
  id: '61e39d1995404235acc624e1',
  name: 'serverName',
  owner: 'ownerId',
  admins: [],
  textChannels: {
    '61e39d1995404235acc624ea': {
      groupServerId: '61e39d1995404235acc624e1',
      name: 'textChannelName',
    },
  },
};
const testTextChannel = {
  _id: '61e39d1995404235acc624ea',
  name: 'general',
  chat_log: 'chatLogId',
  createdAt: new Date(),
};
const testChatLog = {
  _id: '61e39d1995404235acc624eb',
  chat_log: [],
};
const testInvite = {
  _id: '61e39d1995404235acc624ec',
  date: new Date(),
  expiration: -1,
}

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

describe('Testing groupServer endpoints', () => {
  test('Find GroupServers: User is a member of a server', async () => {
    GroupServers.findServersByUserId.mockResolvedValueOnce([testGroupServer]);
    GroupServerUtils.formatRawGroupServer.mockResolvedValueOnce(testFormattedGroupServer);
    const response = await request(app)
      .get('/api/group-servers/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(response.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServersByUserId.mock.calls.length).toBe(1);
    expect(GroupServerUtils.formatRawGroupServer.mock.calls.length).toBe(1);
  });

  test('Find GroupServers: User is not part of any group servers', async () => {
    GroupServers.findServersByUserId.mockResolvedValueOnce([]);
    const response = await request(app)
      .get('/api/group-servers/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServersByUserId.mock.calls.length).toBe(1);
  });

  test('Find GroupServers: Unexpected error occurs', async () => {
    const response = await request(app)
      .get('/api/group-servers/')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Create GroupServer: Successfully create', async () => {
    GroupServers.createGroupServer.mockResolvedValueOnce(testGroupServer);
    TextChannels.findTextChannelById.mockResolvedValueOnce(testTextChannel);
    const response = await request(app)
    .post('/api/group-servers/')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      name: 'server 1',
    });
    expect(response.statusCode).toBe(201);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.createGroupServer.mock.calls.length).toBe(1);
    expect(TextChannels.findTextChannelById.mock.calls.length).toBe(1);
  });

  test('Create GroupServer: Fail to create', async () => {
    GroupServers.createGroupServer.mockResolvedValueOnce(testGroupServer);
    const response = await request(app)
    .post('/api/group-servers/')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      name: 'server 1',
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.createGroupServer.mock.calls.length).toBe(1);
  });

  test('Create GroupServer: Unexpected error occurs', async () => {
    const response = await request(app)
    .post('/api/group-servers/')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      name: 'server 1',
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Find specific GroupServer: Successfully find', async () => {
    GroupServers.findServerByIdAndUserId.mockResolvedValueOnce(testGroupServer);
    GroupServerUtils.formatRawGroupServer.mockResolvedValueOnce(testFormattedGroupServer);
    const response = await request(app)
    .get('/api/group-servers/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByIdAndUserId.mock.calls.length).toBe(1);
    expect(GroupServerUtils.formatRawGroupServer.mock.calls.length).toBe(1);
  });

  test('Find specific GroupServer: Fail validation', async () => {
    const response = await request(app)
    .get('/api/group-servers/invalid-server-id')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Find specific GroupServer: Find nothing', async () => {
    const response = await request(app)
    .get('/api/group-servers/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Find specific GroupServer: Unexpected error occurs', async () => {
    GroupServers.findServerByIdAndUserId.mockResolvedValueOnce(testGroupServer);
    const response = await request(app)
    .get('/api/group-servers/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByIdAndUserId.mock.calls.length).toBe(1);
  });
  
  test('Delete a GroupServer: Successfully delete', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
  });
  
  test('Delete a GroupServer: Fail validation', async () => {
    const response = await request(app)
    .delete('/api/group-servers/invalid-server-id')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Delete a GroupServer: Unauthorized user', async () => {
    Users.findUserById.mockResolvedValueOnce({ _id: "unauthorizedId", name: 'testName', email: 'test@test.com', password: 'Password123' });
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(401);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
  });

  test('Delete a GroupServer: Fail to find server', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(null);
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
  });

  test('Delete a GroupServer: Unexpected error occurs', async () => {
    GroupServers.findServerById.mockResolvedValueOnce({ owner: mongoose.Types.ObjectId('61e39d1995404235acc624e0') });
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
  });

  test('Create TextChannel: Successfully create', async () => {
    GroupServers.checkUserPermission.mockResolvedValueOnce(true);
    TextChannels.createTextChannel.mockResolvedValueOnce(testTextChannel);
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624ea/text-channels')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      name: 'textChannelName',
    });
    expect(response.statusCode).toBe(201);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.checkUserPermission.mock.calls.length).toBe(1);
    expect(TextChannels.createTextChannel.mock.calls.length).toBe(1);
  });

  test('Create TextChannel: Fail parameter validation', async () => {
    const response = await request(app)
    .post('/api/group-servers/invalid-server-id/text-channels')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      name: 'textChannelName',
    });
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Create TextChannel: Fail body validation', async () => {
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624ea/text-channels')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Create TextChannel: Unauthorized user', async () => {
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624ea/text-channels')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      name: 'textChannelName',
    });
    expect(response.statusCode).toBe(401);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Create TextChannel: Fail to create', async () => {
    GroupServers.checkUserPermission.mockResolvedValueOnce(true);
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624ea/text-channels')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      name: 'textChannelName',
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.checkUserPermission.mock.calls.length).toBe(1);
  });

  test('Delete a TextChannel: Successfully delete', async () => {
    GroupServers.checkUserPermission.mockResolvedValueOnce(true);
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    TextChannels.deleteTextChannel.mockResolvedValueOnce(true);
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.checkUserPermission.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
    expect(TextChannels.deleteTextChannel.mock.calls.length).toBe(1);
  });

  test('Delete a TextChannel: Fail validation', async () => {
    const response = await request(app)
    .delete('/api/group-servers/invalid-server-id/text-channels/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Delete a TextChannel: Unauthorized user', async () => {
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(401);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Delete a TextChannel: No channel found', async () => {
    GroupServers.checkUserPermission.mockResolvedValueOnce(true);
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.checkUserPermission.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
  });

  test('Delete a TextChannel: No server found', async () => {
    GroupServers.checkUserPermission.mockResolvedValueOnce(true);
    const response = await request(app)
    .delete('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.checkUserPermission.mock.calls.length).toBe(1);
  });

  test('Find ChatLog: Successfully find', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    TextChannels.findTextChannelById.mockResolvedValueOnce(testTextChannel);
    ChatLogs.findChatLogById.mockResolvedValueOnce(testChatLog);
    const response = await request(app)
    .get('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea/chat-logs')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
    expect(TextChannels.findTextChannelById.mock.calls.length).toBe(1);
    expect(ChatLogs.findChatLogById.mock.calls.length).toBe(1);
  });

  test('Find ChatLog: Fail validation', async () => {
    const response = await request(app)
    .get('/api/group-servers/invalid-server-id/text-channels/61e39d1995404235acc624ea/chat-logs')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Find ChatLog: Fail to find text channel', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    TextChannels.findTextChannelById.mockResolvedValueOnce(null);
    const response = await request(app)
    .get('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea/chat-logs')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
    expect(TextChannels.findTextChannelById.mock.calls.length).toBe(1);
  });

  test('Find ChatLog: Fail to find chat log', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    TextChannels.findTextChannelById.mockResolvedValueOnce(testTextChannel);
    ChatLogs.findChatLogById.mockResolvedValueOnce(null);
    const response = await request(app)
    .get('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea/chat-logs')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
    expect(TextChannels.findTextChannelById.mock.calls.length).toBe(1);
    expect(ChatLogs.findChatLogById.mock.calls.length).toBe(1);
  });

  test('Find ChatLog: Unexpected error occurs', async () => {
    GroupServers.findServerById.mockResolvedValueOnce({});
    TextChannels.findTextChannelById.mockResolvedValueOnce(testTextChannel);
    const response = await request(app)
    .get('/api/group-servers/61e39d1995404235acc624ea/text-channels/61e39d1995404235acc624ea/chat-logs')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
    expect(TextChannels.findTextChannelById.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Successfully join', async () => {
    Users.findUserById.mockResolvedValueOnce({ _id: '61e39d1995404235acc624e9', name: 'testName2', email: 'test2@test.com', password: 'Password123' });
    GroupServers.findServerByInvite.mockResolvedValueOnce(testGroupServer);
    Invites.findInviteByCode.mockResolvedValueOnce(testInvite);
    InviteUtils.checkInviteExpiration.mockResolvedValueOnce(true);
    GroupServers.addUserToServer.mockResolvedValueOnce(testGroupServer);
    GroupServerUtils.formatRawGroupServer.mockResolvedValueOnce(testGroupServer);
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({ 
      inviteCode: '123456789', 
    });
    expect(response.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByInvite.mock.calls.length).toBe(1);
    expect(Invites.findInviteByCode.mock.calls.length).toBe(1);
    expect(InviteUtils.checkInviteExpiration.mock.calls.length).toBe(1);
    expect(GroupServers.addUserToServer.mock.calls.length).toBe(1);
    expect(GroupServerUtils.formatRawGroupServer.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Fail validation', async () => {
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Fail to find group server', async () => {
    GroupServers.findServerByInvite.mockResolvedValueOnce(null);
    Invites.findInviteByCode.mockResolvedValueOnce(testInvite);
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({ 
      inviteCode: '123456789', 
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByInvite.mock.calls.length).toBe(1);
    expect(Invites.findInviteByCode.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Fail to find invite', async () => {
    GroupServers.findServerByInvite.mockResolvedValueOnce(testGroupServer);
    Invites.findInviteByCode.mockResolvedValueOnce(null);
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({ 
      inviteCode: '123456789', 
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByInvite.mock.calls.length).toBe(1);
    expect(Invites.findInviteByCode.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Expired invite', async () => {
    GroupServers.findServerByInvite.mockResolvedValueOnce(testGroupServer);
    Invites.findInviteByCode.mockResolvedValueOnce(testInvite);
    Invites.deleteInvite.mockResolvedValueOnce(true);
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({ 
      inviteCode: '123456789', 
    });
    expect(response.statusCode).toBe(401);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByInvite.mock.calls.length).toBe(1);
    expect(Invites.findInviteByCode.mock.calls.length).toBe(1);
    expect(Invites.deleteInvite.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Already a member', async () => {
    GroupServers.findServerByInvite.mockResolvedValueOnce(testGroupServer);
    Invites.findInviteByCode.mockResolvedValueOnce(testInvite);
    InviteUtils.checkInviteExpiration.mockResolvedValueOnce(true);
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({ 
      inviteCode: '123456789', 
    });
    expect(response.statusCode).toBe(204);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByInvite.mock.calls.length).toBe(1);
    expect(Invites.findInviteByCode.mock.calls.length).toBe(1);
    expect(InviteUtils.checkInviteExpiration.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Fail to join', async () => {
    Users.findUserById.mockResolvedValueOnce({ _id: '61e39d1995404235acc624e9', name: 'testName2', email: 'test2@test.com', password: 'Password123' });
    GroupServers.findServerByInvite.mockResolvedValueOnce(testGroupServer);
    Invites.findInviteByCode.mockResolvedValueOnce(testInvite);
    InviteUtils.checkInviteExpiration.mockResolvedValueOnce(true);
    GroupServers.addUserToServer.mockResolvedValueOnce(null);
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({ 
      inviteCode: '123456789', 
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByInvite.mock.calls.length).toBe(1);
    expect(Invites.findInviteByCode.mock.calls.length).toBe(1);
    expect(InviteUtils.checkInviteExpiration.mock.calls.length).toBe(1);
    expect(GroupServers.addUserToServer.mock.calls.length).toBe(1);
  });

  test('Join GroupServer: Unexpected error occurs', async () => {
    Users.findUserById.mockResolvedValueOnce({ _id: '61e39d1995404235acc624e9', name: 'testName2', email: 'test2@test.com', password: 'Password123' });
    GroupServers.findServerByInvite.mockResolvedValueOnce(testGroupServer);
    Invites.findInviteByCode.mockResolvedValueOnce(testInvite);
    InviteUtils.checkInviteExpiration.mockResolvedValueOnce(true);
    GroupServers.addUserToServer.mockResolvedValueOnce({});
    const response = await request(app)
    .patch('/api/group-servers/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({ 
      inviteCode: '123456789', 
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerByInvite.mock.calls.length).toBe(1);
    expect(Invites.findInviteByCode.mock.calls.length).toBe(1);
    expect(InviteUtils.checkInviteExpiration.mock.calls.length).toBe(1);
    expect(GroupServers.addUserToServer.mock.calls.length).toBe(1);
  });

  test('Leave GroupServer: Successfully leave', async () => {
    GroupServers.removeUserFromServer.mockResolvedValueOnce(testGroupServer);
    const response = await request(app)
    .patch('/api/group-servers/61e39d1995404235acc624e1/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.removeUserFromServer.mock.calls.length).toBe(1);
  });

  test('Leave GroupServer: Fail validation', async () => {
    const response = await request(app)
    .patch('/api/group-servers/invalid-server-id/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Leave GroupServer: No server found', async () => {
    GroupServers.removeUserFromServer.mockResolvedValueOnce(null);
    const response = await request(app)
    .patch('/api/group-servers/61e39d1995404235acc624e1/users')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.removeUserFromServer.mock.calls.length).toBe(1);
  });

  test('Create Invite: Successfully create', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    Invites.createInvite.mockResolvedValueOnce(testInvite);
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624e1/invite')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      limit: -1,
      expiration: -1,
    });
    expect(response.statusCode).toBe(201);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
    expect(Invites.createInvite.mock.calls.length).toBe(1);
  });

  test('Create Invite: Fail parameter validation', async () => {
    const response = await request(app)
    .post('/api/group-servers/invalid-server-id/invite')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      limit: -1,
      expiration: -1,
    });
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Create Invite: Fail body validation', async () => {
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624e1/invite')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    expect(response.statusCode).toBe(400);
    expect(Users.findUserById.mock.calls.length).toBe(1);
  });

  test('Create Invite: Fail to create', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(testGroupServer);
    Invites.createInvite.mockResolvedValueOnce(null);
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624e1/invite')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      limit: -1,
      expiration: -1,
    });
    expect(response.statusCode).toBe(500);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
    expect(Invites.createInvite.mock.calls.length).toBe(1);
  });

  test('Create Invite: No server found', async () => {
    GroupServers.findServerById.mockResolvedValueOnce(null);
    const response = await request(app)
    .post('/api/group-servers/61e39d1995404235acc624e1/invite')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      limit: -1,
      expiration: -1,
    });
    expect(response.statusCode).toBe(404);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(GroupServers.findServerById.mock.calls.length).toBe(1);
  });
});
