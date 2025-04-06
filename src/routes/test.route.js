const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authenticate.middleware");
const {
  getListTests,
  getInfoTest,
  getDetailTest,
  submitTest,
  getHistoryTest,
  getUserAnswers
} = require("../controllers/test.controller");

router.get("/detail/:id", authenticateToken, getDetailTest);
router.get("/history/:history_id", authenticateToken, getUserAnswers);
router.get("/info/:id", authenticateToken, getInfoTest);
router.post("/submit", authenticateToken, submitTest);
router.get("/history", authenticateToken, getHistoryTest);
router.get("/", authenticateToken, getListTests);

module.exports = router;
