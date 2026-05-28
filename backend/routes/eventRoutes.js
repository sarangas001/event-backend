const express = require('express');

const eventController = require('../controller/eventController.js');
const userAuth = require('../middleware/userAuth.js');

const router = express.Router();

router.post('/create', userAuth, eventController.createEvent);
router.post('/resubmit', userAuth, eventController.updateReturnedEvent);
router.get('/mine', userAuth, eventController.getMyEvents);
router.get('/organization-events', userAuth, eventController.getMyEvents);
router.get('/events', eventController.getApprovedEvents);
router.get('/events/:eventId', eventController.getEvent);
router.get('/event', eventController.getEvent);
router.get('/event/:eventId', eventController.getEvent);
router.get('/public', eventController.getApprovedEvents);
router.get('/:eventId', eventController.getEvent);

module.exports = router;
