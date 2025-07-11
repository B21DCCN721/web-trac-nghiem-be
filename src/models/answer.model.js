const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const Answer = sequelize.define('Answer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  answer_text: { type: DataTypes.TEXT, allowNull: false },
  is_correct: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'answers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Answer;
