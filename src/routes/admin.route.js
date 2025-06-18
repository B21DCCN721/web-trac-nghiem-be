const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  isAdmin,
} = require("../middlewares/authenticate.middleware");
const {
  createTest,
  updateTest,
  deleteTest,
  getAverageScoreTest,
  getStudentSubmission,
  getAdminTestStats,
  getTestStatsLast10Days,
} = require("../controllers/admin.controller");
// All routes in this file require authentication and admin role
router.use(authenticateToken, isAdmin);

router.post("/create-test", createTest);
router.put("/update-test/:id", updateTest);
router.delete("/delete-test/:id", deleteTest);
router.get("/average-score-test/:id", getAverageScoreTest);
router.get("/student-submissions/:id", getStudentSubmission);
router.get("/test-stats-last-10-days", getTestStatsLast10Days);
router.get("/stats", getAdminTestStats);

module.exports = router;
