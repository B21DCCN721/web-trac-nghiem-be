const express = require('express');
const router = express.Router();
const { authenticateToken, isStudent } = require('../middlewares/authenticate.middleware');
const { getRanking } = require('../controllers/student.controller');

router.use(authenticateToken, isStudent);
router.get('/get-ranking', getRanking);

module.exports = router;