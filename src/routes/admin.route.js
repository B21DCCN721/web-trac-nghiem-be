const express = require('express')
const router = express.Router()
const { authenticateToken, isAdmin } = require('../middlewares/authenticate.middleware');
const { registerAdmin, loginAdmin } = require('../controllers/admin.controller');
// All routes in this file require authentication and admin role
router.use(authenticateToken, isAdmin);


module.exports = router;