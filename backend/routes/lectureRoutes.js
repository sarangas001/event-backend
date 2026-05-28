const express = require('express');
const lectureController = require('../controller/lectureController.js');
const userAuth = require('../middleware/userAuth.js');

const router = express.Router();

router.post('/profile', userAuth ,lectureController.createLectureProfile)
router.get('/profile', userAuth ,lectureController.getLectureProfile)

module.exports = router