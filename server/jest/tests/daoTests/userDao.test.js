const request = require('supertest');
const app = require('../../../servers/express');
const {
  createUser,
  findUserById,
  findUsersByIds,
  findUserByNameAndNumber,
  findUserByEmail,
  findUsersByName,
  updateUserName,
  updateUserPassword,
  deleteUser,
  generateRandomNumberId,
} = require('../../../db/dao/userDao');

const testName = 'testUniqueName';
const testEmail = 'testEmail@testEmail.com';
const testPassword = 'testPassword123';

let userId;
let numberId;

beforeAll(async () => {
  const user = await createUser(testName, testEmail, testPassword);
  expect(user._id).toBeDefined();
  userId = user._id;
  numberId = user.number_id;
});

afterAll(async () => {
  const isUserDeleted = await deleteUser(userId)
    .then(() => true)
    .catch(() => false);
  expect(isUserDeleted).toBe(true);
});

describe('Testing userDao methods', () => {

  test('findUserById: should return user', async () => {
    const user = await findUserById(userId);
    expect(user.name).toBe(testName);
  });

  test('findUsersByIds: should return user', async () => {
    const secondUser = await createUser(testName, testEmail, testPassword);
    const users = await findUsersByIds([userId, secondUser._id]);
    expect(users.length).toBe(2);
  });

  test('findUserByNameAndNumber: should return user', async () => {
    const user = await findUserByNameAndNumber(testName, numberId);
    expect(user._id).toMatchObject(userId);
  });

  test('findUserByEmail: should return user', async () => {
    const newUser = await createUser(testName, 'testUniqueEmail', testPassword);
    const user = await findUserByEmail('testUniqueEmail');
    expect(user._id).toMatchObject(newUser._id);
  });

  test('findUsersByName: should return user', async () => {
    const users = await findUsersByName(testName);
    expect(users.length).toBe(3);
  });

  test('updateUserName: should return user', async () => {
    await updateUserName(userId, 'newName');
    const user = await findUserById(userId);
    expect(user.name).toBe('newName');
  });

  test('updateUserPassword: should return user', async () => {
    await updateUserPassword(userId, 'newPassword');
    const user = await findUserById(userId);
    expect(user.password).toBe('newPassword');
  });
  
});