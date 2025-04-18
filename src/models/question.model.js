const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const Test = require("./test.model");

const Question = sequelize.define(
  "Question",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Test, key: "id" },
      onDelete: "CASCADE",
    },
    question_text: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "questions",
    timestamps: false,
  }
);

module.exports = Question;
