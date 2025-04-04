const sequelize = require("../configs/connectDB").sequelize;
const Admin = require("./admin.model");
const User = require("./user.model");
const Test = require("./test.model");
const Question = require("./question.model");
const Answer = require("./answer.model");
const TestHistory = require("./testHistory.model");
const UserAnswer = require("./userAnswer.model");

// Thiết lập quan hệ giữa các bảng
Admin.hasMany(Test, { foreignKey: "created_by" });
Test.belongsTo(Admin, { foreignKey: "created_by" });

Test.hasMany(Question, { foreignKey: "test_id" });
Question.belongsTo(Test, { foreignKey: "test_id" });

Question.hasMany(Answer, { foreignKey: "question_id" });
Answer.belongsTo(Question, { foreignKey: "question_id" });

User.hasMany(TestHistory, { foreignKey: "user_id" });
TestHistory.belongsTo(User, { foreignKey: "user_id" });

Test.hasMany(TestHistory, { foreignKey: "test_id" });
TestHistory.belongsTo(Test, { foreignKey: "test_id" });

TestHistory.hasMany(UserAnswer, { foreignKey: "history_id" });
UserAnswer.belongsTo(TestHistory, { foreignKey: "history_id" });

Question.hasMany(UserAnswer, { foreignKey: "question_id" });
UserAnswer.belongsTo(Question, { foreignKey: "question_id" });

Answer.hasMany(UserAnswer, { foreignKey: "answer_id" });
UserAnswer.belongsTo(Answer, { foreignKey: "answer_id" });

module.exports = { sequelize, Admin, User, Test, Question, Answer, TestHistory, UserAnswer };
