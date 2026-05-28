const express = require('express');

const projectController = require('../controller/projectController.js');
const userAuth = require('../middleware/userAuth.js');

const router = express.Router();

router.post('/create', userAuth, projectController.createProject);
router.get('/list', userAuth, projectController.getProjects);
router.get('/organizations', userAuth, projectController.getOrganizationOptions);

module.exports = router;
