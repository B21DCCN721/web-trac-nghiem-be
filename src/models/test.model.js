const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");

const Test = sequelize.define(
  "Test",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    subject: { type: DataTypes.STRING, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "tests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Test;
