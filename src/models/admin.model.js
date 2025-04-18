const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");

const Admin = sequelize.define(
  "Admin",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    role: { type: DataTypes.STRING, defaultValue: "admin" },
    username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "admins",
    timestamps: false,
  }
);

module.exports = Admin;
