const express = require('express');
const userController = require('../controller/userController.js');
const userAuth = require('../middleware/userAuth.js');


const router = express.Router();

router.get('/profile', userAuth ,userController.getUserProfile)

module.exports = router