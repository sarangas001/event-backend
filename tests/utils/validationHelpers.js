const request = require('supertest');
const app = require('../../app.js');

// Utility function to test missing or invalid fields
const testMissingOrInvalidField = (endpoint, baseData, tests) => {
  tests.forEach(({ field, value, expectedMessage }) => {
    it(`should return 400 when ${field} is "${value}"`, async () => {
      const payload = { ...baseData, [field]: value };
      const response = await request(app).post(endpoint).send(payload);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', expectedMessage);
    });
  });
};

module.exports = { testMissingOrInvalidField };

