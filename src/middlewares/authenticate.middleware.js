const jwt = require("jsonwebtoken");
require("dotenv").config();
const otpStore = require("../helpers/otpStore");

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token, truy cập bị từ chối" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log(verified)
    req.user = verified; // Lưu thông tin user vào request
    next();
  } catch (error) {
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      code: 0,
      message: "Chỉ admin mới có quyền truy cập",
    });
  }
  next();
};

// Middleware to check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res.status(403).json({
      code: 0,
      message: "Chỉ học sinh mới có quyền truy cập",
    });
  }
  next();
};
const verifyOTP = (req, res, next) => {
  const { email, otp } = req.body;

  const otpData = otpStore.get(email);
  if (!otpData) {
    return res.status(400).json({ code: 0, message: "OTP không tồn tại." });
  }

  if (Date.now() - otpData.timestamp > 5 * 60 * 1000) {
    otpStore.delete(email);
    return res.status(400).json({ code: 0, message: "OTP đã hết hạn" });
  }

  if (otpData.attempts >= 3) {
    otpStore.delete(email);
    return res.status(400).json({
      code: 0,
      message: "Đã vượt quá số lần thử. Vui lòng yêu cầu OTP mới",
    });
  }

  if (otpData.otp !== otp) {
    otpData.attempts++;
    return res.status(400).json({ code: 0, message: "OTP không chính xác" });
  }

  // OTP hợp lệ, tiếp tục đi
  next();
};
module.exports = { authenticateToken, isAdmin, isStudent, verifyOTP };
