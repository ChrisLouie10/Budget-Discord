const request = require('supertest');
const app = require('../servers/app');

let token;

beforeEach(async () => {
  const loginResponse = await request(app)
    .post('/api/user/register')
    .set({ 'Content-Type': 'application/json' })
    .send({
      name: 'sdafgasdf',
      email: 'fgdhdfgh@sgfdgsdfg.com',
      password: 'sdfgsdfgsdfg',
    });
  expect(loginResponse.statusCode).toBe(201);
  expect(loginResponse.body.Authentication).toBeDefined();
  token = loginResponse.body.Authentication;
});

afterEach(async () => {
  const logoutResponse = await request(app)
    .delete('/api/user/delete-account')
    .set({
      Authorization: token,
      'Content-Type': 'application/json',
    })
    .send({
      password: 'sdfgsdfgsdfg',
    });
  expect(logoutResponse.statusCode).toBe(200);
});

describe('Testing Auth', () => {
  test('Verify: should verify out token', async () => {
    const verifyResponse = await request(app)
      .get('/api/user/verify')
      .set({
        Authorization: token,
        'Content-Type': 'application/json',
      });
    expect(verifyResponse.body.success).toBe(true);
  });

  // let token;
  // test("Login: should return a token", async() =>{
  //   let loginResponse = await request(app)
  //     .post("/api/user/login")
  //     .set({ 'Content-Type': 'application/json' })
  //     .send({
  //       email: 'christopher@christopher.com',
  //       password: 'christopher'
  //     });
  //   expect(loginResponse.body.success).toBe(true);
  //   token = loginResponse.body.Authentication;
  // });
});
