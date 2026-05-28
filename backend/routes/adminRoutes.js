const express = require('express');

const adminController = require('../controller/adminController.js');
const userAuth = require('../middleware/userAuth.js');

const router = express.Router();

router.get('/catalog', userAuth, adminController.getAdminCatalog);
router.get('/venues', userAuth, adminController.getVenues);
router.post('/faculty', userAuth, adminController.createFaculty);
router.post('/dean', userAuth, adminController.createDean);
router.post('/venue', userAuth, adminController.createVenue);
router.post('/advisor', userAuth, adminController.createAdvisor);
router.post('/organization', userAuth, adminController.createOrganization);
router.post('/university-role', userAuth, adminController.createUniversityRole);

module.exports = router;
