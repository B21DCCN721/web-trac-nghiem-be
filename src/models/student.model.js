const { DataTypes } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const Student = sequelize.define('Student', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'students',
  timestamps: false
});

module.exports = Student;