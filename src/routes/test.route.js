const express = require("express");
const router = express.Router();
const { authenticateToken, isAdmin } = require("../middlewares/authenticate.middleware");
const {
  getAllTests,
  getInfoTestById,
  getDetailTestById,
  submitTest,
  getUserSubmissions,
  getSubmissionAnswers
} = require("../controllers/test.controller");

router.get("/get-info-test/:id", authenticateToken, getInfoTestById);
router.get("/get-detail-test/:id", authenticateToken, getDetailTestById);
router.get("/get-list-test", authenticateToken, getAllTests);
router.post("/submit-test", authenticateToken, submitTest);
router.get("/get-submissions", authenticateToken, getUserSubmissions);
router.get("/get-submission-answers/:id", authenticateToken, getSubmissionAnswers);

module.exports = router;
