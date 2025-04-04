const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const Question = require("./question.model");

const Answer = sequelize.define("Answer", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  question_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Question, key: "id" } },
  answer_text: { type: DataTypes.TEXT, allowNull: false },
  is_correct: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: "answers",
  timestamps: false,
});

module.exports = Answer;
