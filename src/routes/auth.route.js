const express = require("express");
const router = express.Router();
const {
  register,
  login,
  changePassword,
  updateProfile,
  getProfile,
  receiveOTP,
  resetPassword,
  registerAdmin
} = require("../controllers/auth.controller");
const { authenticateToken, verifyOTP } = require("../middlewares/authenticate.middleware");

// Public routes
// user
router.post("/register", register);
router.post("/login", login);
router.post("/receive-otp", receiveOTP);
router.post("/reset-password", verifyOTP, resetPassword);
// admin
router.post("/register-admin", registerAdmin);

// Protected route
router.get("/profile", authenticateToken, getProfile);
router.patch("/change-password", authenticateToken, changePassword);
router.put("/change-profile", authenticateToken, updateProfile);


module.exports = router;