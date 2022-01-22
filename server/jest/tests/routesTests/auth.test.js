const request = require('supertest');
const app = require('../../../servers/express');
const Users = require('../../../db/dao/userDao');

jest.mock('../../../db/dao/userDao');

const testName = 'testName';
const testEmail = 'testEmail@testEmail.com';
const testPassword = 'testPassword123';
const testId = 'testId';

let cookie;

beforeAll(async () => {
  Users.createUser.mockResolvedValue({_id: testId, name: testName, email: testEmail, password: testPassword});
  Users.findUserById.mockResolvedValue({_id: testId, name: testName, email: testEmail, friends: []});
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

  test('Verify: should verify cookie', async () => {
    const verifyResponse = await request(app)
      .get('/api/user')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(verifyResponse.body.success).toBe(true);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(verifyResponse.body.user.name).toBe('testName');
    expect(verifyResponse.body.user.email).toBe('testEmail@testEmail.com');
    expect(verifyResponse.body.user.friends).toEqual([]);
  });

  test('Login: should return a cookie', async() => {
    Users.findUserByEmail.mockResolvedValueOnce({ _id: testId, name: testName, email: testEmail, friends: []});
    let loginResponse = await request(app)
      .post('/api/user/login')
      .set({ 'Content-Type': 'application/json' })
      .send({
        email: 'testEmail@testEmail.com',
        password: 'testPassword123'
      });
    expect(loginResponse.body.success).toBe(true);
    expect(Users.findUserByEmail.mock.calls.length).toBe(1);
    expect(loginResponse.headers['set-cookie']).toBeDefined()
  });

  test('Logout: should have no cookie', async() => {
    let logoutResponse = await request(app)
      .delete('/api/user/logout')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      });
    expect(logoutResponse.body.success).toBe(true);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(logoutResponse.headers['cookie']).toBeUndefined()
  });

  test('Change Name: should return true', async() => {
    Users.updateUserName.mockResolvedValue();
    let nameResponse = await request(app)
      .put('/api/user/name')
      .set({ 
        'Cookie': cookie,
        'Content-Type': 'application/json' 
      })
      .send({
        name: 'newName',
        password: 'testPassword123'
      });
      expect(nameResponse.body.success).toBe(true);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(Users.updateUserName.mock.calls.length).toBe(1);
  });

  test('Change Password: should return true', async() => {
    Users.updateUserPassword.mockResolvedValue();
    let nameResponse = await request(app)
      .put('/api/user/password')
      .set({ 
        'Cookie': cookie,
        'Content-Type': 'application/json' 
      })
      .send({
        oldPassword: 'testPassword123',
        password: 'newPassword123'
      });
      expect(nameResponse.body.success).toBe(true);
      expect(Users.findUserById.mock.calls.length).toBe(1);
      expect(Users.updateUserPassword.mock.calls.length).toBe(1);
  });

  test('Delete User: should return 200', async() => {
    Users.deleteUser.mockResolvedValue();
    const deleteResponse = await request(app)
      .delete('/api/user')
      .set({
        'Cookie': cookie,
        'Content-Type': 'application/json',
      })
      .send({
        password: 'newPassword123',
      });
    expect(deleteResponse.statusCode).toBe(200);
    expect(Users.findUserById.mock.calls.length).toBe(1);
    expect(Users.deleteUser.mock.calls.length).toBe(1);
  });

});