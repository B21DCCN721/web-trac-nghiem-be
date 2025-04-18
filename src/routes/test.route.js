const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authenticate.middleware");
const { isAdmin } = require("../middlewares/isAdmin.middleware");
const {
  getListTests,
  getInfoTest,
  getDetailTest,
  submitTest,
  getHistoryTest,
  getUserAnswers,
  createTest,
  deleteTest,
} = require("../controllers/test.controller");

router.delete("/delete/:id", authenticateToken, isAdmin, deleteTest);
router.get("/detail/:id", authenticateToken, getDetailTest);
router.get("/history/:history_id", authenticateToken, getUserAnswers);
router.get("/info/:id", authenticateToken, getInfoTest);
router.post("/submit", authenticateToken, submitTest);
router.get("/history", authenticateToken, getHistoryTest);
router.get("/", authenticateToken, getListTests);
// chỉ admin được truy cập
router.post("/create-test", authenticateToken, isAdmin, createTest);

module.exports = router;
