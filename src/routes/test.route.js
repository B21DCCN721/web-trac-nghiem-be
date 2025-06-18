const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authenticate.middleware");
const { exerciseFilterMiddleware } = require("../middlewares/search.middleware");
const {
  getAllTests,
  getInfoTestById,
  getDetailTestById,
  submitTest,
  getUserSubmissions,
  getSubmissionAnswers
} = require("../controllers/test.controller");
router.use(authenticateToken);

router.get("/get-info-test/:id", getInfoTestById);
router.get("/get-detail-test/:id", getDetailTestById);
router.get("/get-list-test",exerciseFilterMiddleware, getAllTests);
router.post("/submit-test", submitTest);
router.get("/get-submissions", getUserSubmissions);
router.get("/get-submission-answers/:id", getSubmissionAnswers);

module.exports = router;
