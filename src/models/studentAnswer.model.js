const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const StudentAnswer = sequelize.define('StudentAnswer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  submission_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  answer_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'student_answers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = StudentAnswer;
