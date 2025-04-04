const jwt = require("jsonwebtoken");
require("dotenv").config();

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

module.exports = { authenticateToken };
