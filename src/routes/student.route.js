const express = require('express');
const router = express.Router();
const { authenticateToken, isStudent } = require('../middlewares/authenticate.middleware');
// All routes in this file require authentication and teacher role
router.use(authenticateToken, isStudent);
// Protected route - requires student authentication


module.exports = router;