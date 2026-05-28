const request = require('supertest');
const app = require('../../app.js');

// Import data for testing
const {
    newUser,
    userInput, 
    invalidEmails, 
    invalidContactNums, 
    weakPasswords
} = require('../data/testUsers.js');

// Reusable mocks
const { 
  mockSave,
  mockFindOne,
  mockFind,
  mockBcryptHash,
  mockJWT,
  mockSendMail,
} = require('../utils/commonMocks.js');

// Modules for assertions
const { User, bcrypt, jwt, transporter } = require('../utils/modules.js');

// Mock external modules
jest.mock('../../models/User.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/nodemailer.js');

describe('User Registration', () => {
    /**************** Validation Errors ****************/
    describe('Validation Errors', () => {

        // Test Case 1: Missing Name
        describe('given that name is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          name: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing Name');
            });
        });

        // Test Case 2: Missing Email
        describe('given that email is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          email: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing Email');
            });
        });

        // Test Case 3: Invalid Email
        describe('given that email is invalid', () => {
            test.each(invalidEmails)('should return error 400 with validation message, given that email is "%s"', async(invalidEmail) => {
                const response = await request(app)
                                       .post('/api/auth/register')
                                       .send({
                                          ...userInput,
                                          email: invalidEmail,
                                       });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Invalid Email');
            });
        });

        // Test Case 4: Missing Registration Number
        describe('given that registration number is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          regiNumber: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing Registration Number');
            });
        });

        // Test Case 5: Missing faculty Name
        describe('given that faculty name is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          faculty: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing faculty Name');
            });
        });

        // Test Case 6: Missing Contact Number
        describe('given that contact number is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          contactNum: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing Contact Number');
            });
        });

        // Test Case 7: Invalid contact number
        describe('given that contact number is invalid', () => {
            test.each(invalidContactNums)('should return error 400 with validation message, given that contact number is "%s"', async(invalidContactNum) => {
                const response = await request(app)
                                       .post('/api/auth/register')
                                       .send({
                                          ...userInput,
                                          contactNum: invalidContactNum,
                                       });
                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Invalid contact number');
            });
        });

        // Test Case 8: Missing Department Name
        describe('given that department name is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          department: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing Department Name');
            });
        });

        // Test Case 9: Missing Password
        describe('given that password is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          password: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing Password');
            });
        });

        describe.skip('given that confirm password is missing', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                        .post('/api/auth/register')
                                        .send({
                                          ...userInput,
                                          confirmPassword: "",
                                        });

                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Missing Confirm Password');
            });
        });

        describe.skip('given that password and confirm password do not match', () => {
            it('should return error 400 with a validation message', async() => {
                const response = await request(app)
                                       .post('/api/auth/register')
                                       .send({
                                               ...userInput,
                                               confirmPassword: "Password1234!", // mismatch
                                        });

                    expect(response.statusCode).toBe(400);
                    expect(response.body).toHaveProperty('message', 'Passwords do not match');
            });
        });

        // Test Case: Please create Strong password
        describe('given that password is weak', () => {
            test.each(weakPasswords)('should return error 400 with validation message, given that password is "%s"', async(weakPassword) => {
                const response = await request(app)
                                       .post('/api/auth/register')
                                       .send({
                                          ...userInput,
                                          password: weakPassword,
                                       });
                expect(response.statusCode).toBe(400);
                expect(response.body).toHaveProperty('message', 'Please create Strong password');
            });
        });
    });
    
    /**************** Successful Registration ****************/
    describe('Successful Registration', () => {
        let response;

        // Prepare mocks before each test
        beforeEach(async() => {
            mockFindOne(User,null);     // user does not exist
            mockBcryptHash();           // hash password
            mockSave(User);                 // save user
            mockJWT();                  // generate token
            mockSendMail();             // send email

            // Make the request once and reuse the response
            response = await request(app)
                             .post('/api/auth/register')
                             .send(userInput); // userInput is what we send to the backend.
        });

        // Test Case 11: Successful Registration - Response Test
        it('should register a new user successfuly and return 201', () => {
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Succsfully Registered');
        });

        // Test Case 12: Successful Registration – Database/Behavior Test
        it('should save the new user', () => {
            expect(User.prototype.save).toHaveBeenCalled();
        });

        // Test Case 13: Hash the password before saving
        it('should hash the password', () => {
            expect(bcrypt.hash).toHaveBeenCalledWith(userInput.password, 10);
        });

        // Test Case 14: Generates JWT token
        it('should generate a JWT token', () => {
            expect(jwt.sign).toHaveBeenCalledWith(
               { id: '123' }, 
               process.env.JWT_SECRET, 
               { expiresIn: '7d' }
            );
        });

        // Test Case 15: Sends a welcome email
        it('should send a welcome email', () => {
            // userInput is what we sent to the backend
            // newUser is what we expect the backend to save and use in emails
            expect(transporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                   to: newUser.email,
                   subject: expect.stringContaining('Registration Successful'),
                   html: expect.stringContaining(newUser.name)
                })
            );
        });
    });

    /**************** Duplicate User ****************/
    describe('Duplicate User', () => {
        beforeEach(() => {
           mockFindOne(User, userInput); // User already exists
        });

        it('should return 400 if user already exists', async() => {
            const response = await request(app)
                                   .post('/api/auth/register')
                                   .send(userInput);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User already exists');
            expect(User.prototype.save).not.toHaveBeenCalled();
        });
    });

    /**************** Error Handling ****************/
    describe('Error Handling', () => {
        it('should return 400 with an error message if something goes wrong', async() => {
            // Make User.findOne throw an error
            User.findOne.mockImplementation(() => {
                throw new Error('Database failure');
            });

            const response = await request(app)
                                   .post('/api/auth/register')
                                   .send(userInput);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toMatch(/Database failure/);
        });
    });
});