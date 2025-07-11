const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const Question = sequelize.define('Question', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  test_id: { type: DataTypes.INTEGER, allowNull: false },
  question_text: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Question;
