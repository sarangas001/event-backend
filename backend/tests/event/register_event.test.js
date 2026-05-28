const request = require('supertest');
const app = require('../../app.js');

// Import data for testing
const {
  eventData,
  invalidStartDates,
  invalidStartTimes,
  invalidEndDates,
  invalidEndTimes,
  missingFieldTests,
  invalidFieldTests,
} = require('../data/testEvents.js');

// Import reusable request helpers
const { 
  testSuccessfulRegistration,
  testDuplicateErrorResponse,
  testErrorResponse,
  testMissingId,
  missingFieldTest,
  testFieldWithValues,
} = require('../utils/requestHelpers.js');

// Modules for assertions
const { Event } = require('../utils/modules.js');

// Mock external modules
jest.mock('../../models/Event.js');

// Mock the authentication middleware for testing purposes.
jest.mock('../../middleware/userAuth', () => (req, res, next) => next());

// Base endpoint
const endpoint = '/api/event/register';

// Test Suite for Event Registration
describe('Event Registration - Missing Fields', () => {
  missingFieldTests.forEach(({ field, expectedMessage }) => {
    it(`should return 400 when "${field}" is missing`, missingFieldTest({
      app,
      method: 'post',
      endpoint: '/api/event/register',
      baseData: eventData,
      field,
      expectedMessage
    }));
  });
});

describe('Event Registration - Invalid Fields', () => {
  // Start Date
  testFieldWithValues(app, endpoint, eventData, 'startDate', invalidStartDates.map(v => v.value), 'Invlid Start Date');

  // Start Time
  testFieldWithValues(app, endpoint, eventData, 'startTime', invalidStartTimes.map(v => v.value), 'Invlid Start Time');

  // End Date
  testFieldWithValues(app, endpoint, eventData, 'endDate', invalidEndDates.map(v => v.value), 'Invlid End Date');

  // End Time
  testFieldWithValues(app, endpoint, eventData, 'endTime', invalidEndTimes.map(v => v.value), 'Invlid End Time');
});

// Successful Registration Test
describe('Successful Registration', () => {
  it('should register event successfully', async () => {
    await testSuccessfulRegistration({
      app,
      endpoint: '/api/event/register',
      baseData: eventData,
      Model: Event,
      successMessage: `Succsfully fill form`
    });
  });
});

// Duplicate Event Test
describe('Duplicate Event', () => {
  it('should return 400 if event already exists', async () => {
    await testDuplicateErrorResponse({
      app,
      endpoint: '/api/event/register',
      payload: eventData,
      Model: Event,
      existingRecord: eventData,
      expectedMessage: 'Event title exists',
    });
  });
});

// Error Handling Test
describe('Error Handling', () => {
  it('should return 500 with an error message if something goes wrong', async () => {
    await testErrorResponse({
      app,
      endpoint: '/api/event/register',
      payload: eventData,
      Model: Event,
      errorMessage: 'Database failure',
      status: 500
    });
  });
});