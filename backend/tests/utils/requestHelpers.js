const request = require('supertest');
const { 
    mockSave, 
    mockFind,
    mockFindOne, 
    mockThrowError,
    mockDeleteOne, 
    mockFindById,
    mockReturn,
    mockFindOneExcludingId,
    mockUpdateOne,
} = require('./commonMocks.js'); // reuse existing mocks

// Change status code to 201 later
const testSuccessfulRegistration = async ({ app, endpoint, baseData, Model, successMessage }) => {
  // Setup mocks using commonMocks.js
  mockFindOne(Model, null);  // No existing record
  mockSave(Model);           // Save the record

  // Make POST request
  const response = await request(app).post(endpoint).send(baseData);

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  // Assertions
  expect(response.statusCode).toBe(201);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('message', successMessage);

  // Ensure save was called
  expect(Model.prototype.save).toHaveBeenCalled();
};

const testDuplicateErrorResponse = async ({
  app,
  endpoint,
  payload,
  Model,
  existingRecord,
  expectedMessage,
  status = 400
}) => {
  // Setup mock to simulate duplicate or existing record
  mockFindOne(Model, existingRecord);

  // Make POST request
  const response = await request(app).post(endpoint).send(payload);

  // Assertions
  expect(response.statusCode).toBe(status);
  expect(response.body).toHaveProperty('message', expectedMessage);

  // Ensure save() was NOT called
  expect(Model.prototype.save).not.toHaveBeenCalled();
};

// Utility function to test error responses from the model
const testErrorResponse = async ({
  app,
  endpoint,
  payload,
  Model,
  errorMessage,
  status = 400
}) => {
  // Make the model throw an error on findOne
  mockThrowError(Model, 'findOne', errorMessage);

  // Send POST request
  const response = await request(app).post(endpoint).send(payload);

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  // Assertions
  expect(response.statusCode).toBe(status);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message');
  expect(response.body.message).toBe(errorMessage);
};

// ---------- DELETE Helpers ----------
const testSuccessfulDeletion = async ({ app, endpoint, Model, eventId, successMessage }) => {
  mockDeleteOne(Model, { deletedCount: 1 });

  const response = await request(app).delete(endpoint).query({ eventId });

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  expect(response.statusCode).toBe(204); 
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('message', successMessage);
  expect(Model.deleteOne).toHaveBeenCalledWith({ _id: eventId });
};

const testDeleteNotFound = async ({ app, endpoint, Model, eventId, expectedMessage }) => {
  mockDeleteOne(Model, { deletedCount: 0 });

  const response = await request(app).delete(endpoint).query({ eventId });

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message', expectedMessage);
};

// ---------- Common Helpers ----------
// Utility function to test API errors for DELETE and GET requests
const testApiError = async ({
  app,
  method,
  endpoint,
  Model,
  methodToMock,
  errorMessage,
  query,
  body,
  status = 500,
}) => {
  // Mock model method to throw error
  mockThrowError(Model, methodToMock, errorMessage);

  // Start the request with the chosen HTTP method
  let httpRequest = request(app)[method](endpoint);

  if (query) {
    httpRequest = httpRequest.query(query);
  }
  
  if (body) {
    httpRequest = httpRequest.send(body);
  }

  const response = await httpRequest;

  // Save globally for afterEach logging if needed
  global.lastResponse = response;

  // Assertions
  expect(response.statusCode).toBe(status);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message');
  expect(response.body.message).toBe(errorMessage);
};

// Utility function to test missing ID in any request (DELETE, GET, etc.)
const testMissingId = async ({ app, method, endpoint, idField = 'eventId', sendInBody = false }) => {
  let httpRequest = request(app)[method](endpoint);

  if (sendInBody) {
    httpRequest = httpRequest.send({}); // empty body, missing ID
  } else {
    httpRequest = httpRequest.query({}); // empty query, missing ID
  }

  const response = await httpRequest;

  // Assertions
  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message');
  expect(response.body.message).toMatch(/Invalid/i); // matches "Invalid Event" or similar

  // Store globally for logging in afterEach if needed
  global.lastResponse = response;
};

// Utility to test missing field
const missingFieldTest = ({ app, method, endpoint, baseData, field, expectedMessage }) => {
  return async () => {
    const payload = { ...baseData };
    delete payload[field];
    const response = await request(app)[method](endpoint).send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', expectedMessage);
  };
};

// Utility to test a single invalid field value
const invalidFieldTest = ({ app, method, endpoint, baseData, field, value, expectedMessage }) => {
  return async () => {
    const payload = { ...baseData, [field]: value };
    const response = await request(app)[method](endpoint).send(payload);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message', expectedMessage);
  };
};

// Utility to test multiple invalid values for a specific field
const testFieldWithValues = (app, endpoint, baseData, field, values, expectedMessage) => {
  for (const value of values) {
    it(`should return 400 when ${field} is "${value}"`, async () => {
      const payload = { ...baseData, [field]: value };
      const response = await request(app).post(endpoint).send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', expectedMessage);
    });
  }
};

// ---------- GET Helpers ----------
const testGetEventNotFound = async ({ app, endpoint, Model, eventId, expectedMessage }) => {
  mockFindById(Model, null);

  const response = await request(app).get(endpoint).query({ eventId });

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message', expectedMessage);
};

const testSuccessfulFetch = async ({ app, endpoint, Model, eventId, mockReturn, expectedMessage }) => {
  // Mock findById to return the document
  mockFindById(Model, mockReturn);

  const response = await request(app).get(endpoint).query({ eventId });

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('message', expectedMessage);
};

const testSuccessfulFetchAll = async ({ app, endpoint, Model, mockReturn, expectedMessage, query }) => { 
  // Use commonMocks to mock Model.find
  mockFind(Model, mockReturn);

  const response = await request(app).get(endpoint);

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  // Validate that find was called with the correct query
  expect(Model.find).toHaveBeenCalledWith(query || {});

  // Validate response
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('message', expectedMessage);
};

// ---------- Update Helpers ----------

// Generic successful full update test
const testSuccessfulUpdate = async ({ 
  app, 
  endpoint, 
  updateData, 
  Model, 
  successMessage,
  existingData = null,
  httpMethod = 'put',
  // Optional: specify which fields to expect in the update (for strict validation)
  expectedUpdateFields = null,
  // Specify which fields to exclude from the update check
  excludeFields = ['isApproved', 'organizationId', 'userId', 'createdAt', 'updatedAt', '__v']
}) => {
  // Mock finding the existing document to ensure it exists
  const mockExistingData = existingData || { 
    _id: updateData._id,
    ...updateData 
  };

  mockFindById(Model, mockExistingData);
    
  // Mock duplicate check - return null (no duplicate found)
  mockFindOneExcludingId(Model, null);
    
  // Mock a successful update operation
  mockUpdateOne(Model, { acknowledged: true, modifiedCount: 1 });

  // Make request with specified HTTP method
  const response = await request(app)[httpMethod](endpoint).send(updateData);

  // Store globally for afterEach hook to log if needed
  global.lastResponse = response;

  // Assertions
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('success', true);
  expect(response.body).toHaveProperty('message', successMessage);

  // Check that updateOne was called correctly
  if (expectedUpdateFields) {
    // If specific fields are provided, check only those
    const expectedUpdate = {};
    expectedUpdateFields.forEach(field => {
      if (updateData[field] !== undefined) {
        expectedUpdate[field] = updateData[field];
      }
    });
    
    expect(Model.updateOne).toHaveBeenCalledWith(
      { _id: updateData._id },
      { $set: expectedUpdate }
    );
  } else {
    // Otherwise, exclude common fields that might not be updated
    const { _id, ...updateFields } = updateData;
    const filteredUpdateFields = { ...updateFields };
    
    // Remove excluded fields
    excludeFields.forEach(field => {
      delete filteredUpdateFields[field];
    });
    
    expect(Model.updateOne).toHaveBeenCalledWith(
      { _id },
      { $set: filteredUpdateFields }
    );
  }
};

// Generic duplicate check during update
const testUpdateDuplicate = async ({ 
  app, 
  endpoint, 
  updateData, 
  Model, 
  duplicateRecord,
  expectedMessage,
  duplicateField = 'title',
  httpMethod = 'put'
}) => {
  // Mock finding the existing document
  mockFindById(Model, { _id: updateData._id, [duplicateField]: 'Original Value' });
  
  // Mock duplicate check - return a different record with same field value
  mockFindOneExcludingId(Model, duplicateRecord);

  const response = await request(app)[httpMethod](endpoint).send(updateData);

  global.lastResponse = response;

  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message', expectedMessage);
  
  // Ensure update was NOT called
  expect(Model.updateOne).not.toHaveBeenCalled();
};

// Test for duplicate during full update
const testFullUpdateDuplicate = async ({ 
  app, 
  endpoint, 
  updateData, 
  Model, 
  duplicateRecord,
  expectedMessage,
  duplicateCheckField = 'title',
  existingData = null
}) => {
  // Mock finding the existing document
  const mockExistingData = existingData || { 
    _id: updateData._id, 
    [duplicateCheckField]: 'Original Value' // Different from update value
  };
  mockFindById(Model, mockExistingData);
  
  // Mock duplicate check - return a different record with same field value
  // This simulates the case where the new value conflicts with another record
  mockFindOneExcludingId(Model, duplicateRecord);

  const response = await request(app).put(endpoint).send(updateData);

  global.lastResponse = response;

  expect(response.statusCode).toBe(400);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('message', expectedMessage);
  
  // Ensure update was NOT called due to duplicate
  expect(Model.updateOne).not.toHaveBeenCalled();
};

module.exports = { 
    testSuccessfulRegistration,
    testDuplicateErrorResponse,
    testErrorResponse,
    testSuccessfulDeletion,
    testApiError,
    testFieldWithValues,
    testDeleteNotFound,
    testMissingId,
    missingFieldTest,
    invalidFieldTest,
    testGetEventNotFound,
    testSuccessfulFetch,
    testSuccessfulFetchAll,
    testSuccessfulUpdate,
    testUpdateDuplicate,
    testFullUpdateDuplicate,
};