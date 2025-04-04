const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const TestHistory = require("./testHistory.model");
const Question = require("./question.model");
const Answer = require("./answer.model");

const UserAnswer = sequelize.define("UserAnswer", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  history_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: TestHistory, key: "id" } },
  question_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Question, key: "id" } },
  answer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Answer, key: "id" } },
}, {
  tableName: "user_answers",
  timestamps: false,
});

module.exports = UserAnswer;
