const { Admin} = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// khởi tạo admin
const registerAdmin = async (req, res) => {
    try {
      const { username, password, email } = req.body;
  
      // Kiểm tra username hoặc email đã tồn tại
      const userExists = await Admin.findOne({ where: { username } });
      const emailExists = await Admin.findOne({ where: { email } });
  
      if (userExists || emailExists) {
        return res.status(400).json({ message: "Username hoặc Email đã tồn tại" });
      }
  
      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Tạo user mới
      const newUser = await Admin.create({ username, password: hashedPassword, email });
  
      res.status(201).json({ message: "Tạo admin thành công", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
  module.exports = { registerAdmin };