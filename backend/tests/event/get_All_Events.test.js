const request = require('supertest');
const app = require('../../app.js');

// Modules
const { Event } = require('../utils/modules.js');

// Mock authentication middleware
jest.mock('../../middleware/userAuth', () => (req, res, next) => next());

// Base endpoint
const endpoint = '/api/event/events';

// Event data for testing
const { 
    eventData,
    multipleEventsData,
    noApprovedEvents,
 } = require('../data/testEvents.js');

const {
    testSuccessfulFetchAll,
    testApiError,
} = require('../utils/requestHelpers.js');

describe('Get All Events - Complete', () => {
    // Test for successful fetch of all approved events
    it('should fetch all approved events successfully', async() => {
        const approvedEvents = multipleEventsData.filter(e => e.isApproved);

        await testSuccessfulFetchAll({
            app,
            endpoint,
            Model: Event,
            mockReturn: approvedEvents,
            expectedMessage: approvedEvents,
            query: { isApproved: true },
        });
    });

    // Test for Server/DB Errors: 500 status code
    it('should return 500 with error message if DB fails', async() => {
        await testApiError({
            app,
            method: 'get',
            endpoint,
            Model: Event,
            methodToMock: 'find',
            errorMessage: 'Database failure',
            status: 500
        });
    });
    
    // Test for no approved events found
    it('should return 200 with empty array if no approved events exist', async () => {
        await testSuccessfulFetchAll({
           app,
           endpoint,
           Model: Event,
           mockReturn: [],
           expectedMessage: [],
           query: { isApproved: true },
           expectStatus: 200
        });
    });
});