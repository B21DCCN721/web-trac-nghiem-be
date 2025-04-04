const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const User = require("./user.model");
const Test = require("./test.model");

const TestHistory = sequelize.define("TestHistory", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" } },
  test_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Test, key: "id" } },
  score: { type: DataTypes.FLOAT, defaultValue: 0 },
  completed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "test_history",
  timestamps: false,
});

module.exports = TestHistory;
