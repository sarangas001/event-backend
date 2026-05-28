const express = require('express');
const facultyController = require('../controller/facultyController.js');
const userAuth = require('../middleware/userAuth.js');

const router = express.Router();

router.get('/get-all', userAuth, facultyController.getAllFaculty)

module.exports = router