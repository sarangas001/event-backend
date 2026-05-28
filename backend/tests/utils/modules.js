// Centralized Repository to import modules for testing
// This file exports only the real modules (not mocks) so tests can import them if needed.
const User = require('../../models/User.js'); // Like this we could add future collections
const Event = require('../../models/Event.js'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../../config/nodemailer.js');

module.exports = {
  User,
  Event,
  bcrypt,
  jwt,
  transporter,
};
