const request = require('supertest');
const app = require('../../app.js');

// Modules
const { Event } = require('../utils/modules.js');

// Mock authentication middleware
jest.mock('../../middleware/userAuth', () => (req, res, next) => next());

// Base endpoint
const endpoint = '/api/event/update';

// Event data for testing
const { 
    eventData,
    updateEventData,
} = require('../data/testEvents.js');

const {
    testApiError,
    testSuccessfulUpdate,
    testUpdateDuplicate,
    testFullUpdateDuplicate,
} = require('../utils/requestHelpers.js');

describe('Update Event', () => {
    // Test for Successful Update
    it('should update event successfully', async() => {
        await testSuccessfulUpdate({
            app,
            endpoint: endpoint,
            updateData: updateEventData,
            Model: Event,
            successMessage: 'Succsfully updated !!',

           // Fields to exclude from update check
           excludeFields: ['isApproved', 'organizationId', 'userId']
        });
    });

    // Test for Server/DB Errors
    it('should return 500 with error message if DB fails', async() => {
        await testApiError({
            app,
            method: 'put',
            endpoint,
            Model: Event,
            methodToMock: 'updateOne',
            body: updateEventData,
            errorMessage: 'Database failure',
            status: 400
        });
    });

    // Test for Duplicate Update
});