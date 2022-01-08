const request = require('supertest');
const app = require('../../servers/express');

let cookie;

beforeAll(async () => {
  const loginResponse = await request(app)
    .post('/api/user/register')
    .set({ 'Content-Type': 'application/json' })
    .send({
      name: 'testName',
      email: 'testEmail@testEmail.com',
      password: 'testPassword123',
    });
  expect(loginResponse.statusCode).toBe(201);
  cookie = loginResponse.headers['set-cookie'];
});

afterAll(async () => {
  const logoutResponse = await request(app)
    .delete('/api/user')
    .set({
      'Cookie': cookie,
      'Content-Type': 'application/json',
    })
    .send({
      password: 'newPassword123',
    });
  expect(logoutResponse.statusCode).toBe(200);
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
    expect(verifyResponse.body.user.name).toBe('testName');
    expect(verifyResponse.body.user.email).toBe('testEmail@testEmail.com');
    expect(verifyResponse.body.user.friends).toEqual([]);
  });

  test('Login: should return a cookie', async() =>{
    let loginResponse = await request(app)
      .post('/api/user/login')
      .set({ 'Content-Type': 'application/json' })
      .send({
        email: 'testEmail@testEmail.com',
        password: 'testPassword123'
      });
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.headers['set-cookie']).toBeDefined()
  });

  describe('Testing user changes', () =>{

    test('Change Name: should return true', async() => {
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
    });

    test('Verify: should show name change', async () => {
      const verifyResponse = await request(app)
        .get('/api/user')
        .set({
          'Cookie': cookie,
          'Content-Type': 'application/json',
        });
      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.user.name).toBe('newName');
      expect(verifyResponse.body.user.email).toBe('testEmail@testEmail.com');
      expect(verifyResponse.body.user.friends).toEqual([]);
    });

    test('Change Password: should return true', async() => {
      let nameResponse = await request(app)
        .put('/api/user/password')
        .set({ 
          'Cookie': cookie,
          'Content-Type': 'application/json' 
        })
        .send({
          email: 'testEmail@testEmail.com',
          oldPassword: 'testPassword123',
          password: 'newPassword123'
        });
        expect(nameResponse.body.success).toBe(true);
    });

    test('Login: should return true with new password', async() =>{
      let loginResponse = await request(app)
        .post('/api/user/login')
        .set({ 'Content-Type': 'application/json' })
        .send({
          email: 'testEmail@testEmail.com',
          password: 'newPassword123'
        });
      expect(loginResponse.body.success).toBe(true);
    });
  });
});