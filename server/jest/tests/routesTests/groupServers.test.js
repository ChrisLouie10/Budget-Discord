const request = require('supertest');
const app = require('../../../servers/express');
const Users = require('../../../db/dao/userDao');
const GroupServers = require('../../../db/dao/groupServerDao');

jest.mock('../../../db/dao/userDao');
jest.mock('../../../db/dao/groupServerDao');

const testName1 = 'testName1';
const testEmail1 = 'testEmail1@testEmail1.com';
const testPassword1 = 'testPassword1123';
const testId1 = 'testId1';
const testName2 = 'testName2';
const testEmail2 = 'testEmail2@testEmail2.com';
const testPassword2 = 'testPassword2123';
const testId2 = 'testId2';
const testGroupServers = [];
let cookie1;
let cookie2;

beforeAll(async () => {
  Users.createUser.mockResolvedValueOnce({_id: testId1, name: testName1, email: testEmail1, password: testPassword1});
  Users.findUserById.mockResolvedValueOnce({_id: testId1, name: testName1, email: testEmail1, friends: []});
  const createResponse1 = await request(app)
    .post('/api/user/register')
    .set({ 'Content-Type': 'application/json' })
    .send({
      name: testName1,
      email: testEmail1,
      password: testPassword1,
  });
  expect(createResponse1.statusCode).toBe(201);
  expect(Users.createUser.mock.calls.length).toBe(1);
  cookie1 = createResponse1.headers['set-cookie'];

  Users.createUser.mockResolvedValueOnce({_id: testId2, name: testName2, email: testEmail2, password: testPassword2});
  Users.findUserById.mockResolvedValueOnce({_id: testId2, name: testName2, email: testEmail2, friends: []});
  const createResponse2 = await request(app)
    .post('/api/user/register')
    .set({ 'Content-Type': 'application/json' })
    .send({
      name: testName2,
      email: testEmail2,
      password: testPassword2,
  });
  expect(createResponse2.statusCode).toBe(201);
  expect(Users.createUser.mock.calls.length).toBe(2);
  cookie2 = createResponse2.headers['set-cookie'];
});

describe('Testing groupServer endpoints', () => {

  test('Find group servers when user is not part of any group servers', async () => {
    GroupServers.findServersByUserId.mockResolvedValueOnce([]);
    const response = await request(app)
      .get('/api/group-servers/')
      .set({
        'Cookie': cookie1,
        'Content-Type': 'application/json',
      });
    expect(response.statusCode).toBe(404);
  });

  /*
  test('Create three group servers', async () => {
    const promises = [];
    for (let i = 0; i < 4; i += 1) {
      GroupServers.createGroupServer.mockResolvedValueOnce({

      })
      promises.push(
        request(app)
        .post('/api/group-servers/')
        .set({
          'Cookie': cookie1,
          'Content-Type': 'application/json',
        })
        .send({
          name: `server ${i+1}`,
        })
      );
    }
    const responses = await Promise.all(promises);
    responses.forEach((response) => expect(response.statusCode).toBe(201));
  });

  test('Find group servers again after creating a few', async () => {
    const response = await request(app)
      .get('/api/group-servers/')
      .set({
        'Cookie': cookie1,
        'Content-Type': 'application/json',
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.groupServers.length).toBe(3);
  });
  */
});
