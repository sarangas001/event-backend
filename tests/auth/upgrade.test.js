const request = require('supertest');
const app = require('../../app.js');

// Import data for testing
const {
    userInput, 
    invalidEmails, 
    invalidContactNums, 
    weakPasswords
} = require('../data/testUsers.js');

// Modules for assertions
const { User, bcrypt, jwt, transporter } = require('../utils/modules.js');

// Mock external modules
jest.mock('../../models/User.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/nodemailer.js');

// Import reusable request helpers
const { 
  testSuccessfulRegistration,
  testDuplicateErrorResponse,
  testFieldWithValues
} = require('../utils/requestHelpers.js');

// Validation Error Tests
describe.skip('Validation Errors', () => {
    const weakPasswords = ['123456', 'password', 'qwerty'];
    testFieldWithValues(app, '/api/auth/register', userInput, 'password', weakPasswords, 'Please create Strong password');
});

// Successful User Registration Test
describe('Successful Registration', () => {
  it('should register user successfully', async () => {
    await testSuccessfulRegistration({
      app,
      endpoint: '/api/auth/register',
      baseData: userInput,
      Model: User,
      successMessage: `Succsfully Registered`
    });
  });
});

// Duplicate User Test
describe('Duplicate User', () => {
  it('should return 400 if user already exists', async () => {
    await testDuplicateErrorResponse({
      app,
      endpoint: '/api/auth/register',
      payload: userInput,
      Model: User,
      existingRecord: userInput,
      expectedMessage: 'User already exists',
    });
  });
});