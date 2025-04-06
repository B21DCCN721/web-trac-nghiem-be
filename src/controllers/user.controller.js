const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Đăng ký người dùng mới
const register = async (req, res) => {
  try {
    const { username, password, email, classUser } = req.body;

    // Kiểm tra username hoặc email đã tồn tại
    const userExists = await User.findOne({ where: { username } });
    const emailExists = await User.findOne({ where: { email } });

    if (userExists || emailExists) {
      return res
        .status(400)
        .json({ message: "Username hoặc Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      class: classUser,
    });

    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Đăng nhập và tạo JWT Token
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "class", "description"],
    });
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    res.json({ message: "Thành công", data: user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email, classUser, description } = req.body;

    // Kiểm tra người dùng có tồn tại không
    const user = await User.findByPk(userId);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại" });

    // Kiểm tra username/email đểđể đảm bảo unique
    if (username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Username đã được sử dụng" });
      }
    }

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }
    }

    // Cập nhật thông tin
    if (username) user.username = username;
    if (email) user.email = email;
    if (classUser) user.class = classUser;
    if (description) user.description = description;
    await user.save();

    res.json({ message: "Cập nhật thông tin thành công", data: user });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
