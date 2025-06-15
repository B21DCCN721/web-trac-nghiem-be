const express = require('express')
const router = express.Router()
const { authenticateToken, isAdmin } = require('../middlewares/authenticate.middleware');
const { createTest, updateTest, deleteTest } = require('../controllers/admin.controller');
// All routes in this file require authentication and admin role
router.use(authenticateToken, isAdmin);

router.post('/create-test', createTest);
router.put('/update-test/:testId', updateTest);
router.delete('/delete-test/:id', deleteTest);

module.exports = router;