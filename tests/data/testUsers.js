// A plain object to build User document
const newUser = {
  "name": "Saranga Samarakoon",
  "password": "User@789",
  "confirmPassword": "User@789",
  "regiNumber": "FC115625",
  "contactNum": "0712345678",
  "faculty": "Computing",
  "department": "SE",
  "email": "sarangasama@gmail.com"
};

// Payload sent in a request body
const userInput = {
  "name": "Saranga Samarakoon",
  "password": "User@789",
  "confirmPassword": "User@789",
  "regiNumber": "FC115625",
  "contactNum": "0712345678",
  "faculty": "Computing",
  "department": "SE",
  "email": "sarangasama@gmail.com"
};

// Arrays to loop for testing field-validation failures
const invalidEmails = [
  'plainaddress',
  '@domain.com',
  'john@.com',
  'john@domain',
  'john@domain..com'
];

const invalidContactNums = [
  '1234567890',
  '0812345678',
  '071234567',
  '07123456789',
  '+94123456789',
  '+9471234567',
  '07123abcd8',
  '07 123 45678',
  '+94-712345678'
];

const weakPasswords = [
  'password',
  'Password',
  'Password123',
  'pass123!',
  'PASSWORD123!',
  'Pa1!',
  '12345678!'
];

module.exports =  { newUser, 
                    invalidEmails, 
                    invalidContactNums, 
                    weakPasswords,
                    userInput 
                  };
                  
