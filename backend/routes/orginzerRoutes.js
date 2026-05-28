const express = require('express');
const orginzerController = require('../controller/orginzerController.js');
const userAuth = require('../middleware/userAuth.js');

const router = express.Router();

router.post('/profile', userAuth ,orginzerController.createOrinizerProfile)
router.get('/profile', userAuth ,orginzerController.getAllOrginzers)

module.exports = router