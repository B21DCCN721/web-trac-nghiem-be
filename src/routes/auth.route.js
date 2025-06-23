const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
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
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/receive-otp", receiveOTP);
router.post("/reset-password", verifyOTP, resetPassword);
router.get("/check-auth", (req, res) => {
  const token = req.cookies?.refreshToken; // HttpOnly

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  // validate token...
  return res.status(200).json({ authenticated: true });
});
// admin
router.post("/register-admin", registerAdmin);

// Protected route
router.get("/profile", authenticateToken, getProfile);
router.patch("/change-password", authenticateToken, changePassword);
router.put("/change-profile", authenticateToken, updateProfile);


module.exports = router;