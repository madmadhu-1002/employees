const { findEmployeeManager } = require('../controllers/organizationController');

const express = require('express');
const router = express.Router();

router.route('/manager/:id').get(findEmployeeManager);

module.exports = router;