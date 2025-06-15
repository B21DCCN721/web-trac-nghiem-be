const express = require("express");
const router = express.Router();
const { createComment, getCommentsByTest } = require('../controllers/comment.controller');
const { authenticateToken } = require('../middlewares/authenticate.middleware');

router.use(authenticateToken); // Apply authentication middleware to all routes in this file

router.post('/create-comment', createComment);
router.get('/get-comments/:testId', getCommentsByTest);

module.exports = router;
