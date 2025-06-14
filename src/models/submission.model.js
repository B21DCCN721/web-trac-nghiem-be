const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const Submission = sequelize.define('Submission', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  test_id: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.INTEGER }
}, {
  tableName: 'submissions',
  timestamps: true,
  createdAt: 'submitted_at',
  updatedAt: false
});

module.exports = Submission;
