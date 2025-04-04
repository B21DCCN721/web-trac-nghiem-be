const { DataTypes } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const Admin = require("./admin.model");

const Test = sequelize.define(
  "Test",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    author: { type: DataTypes.STRING(255), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Admin, key: "id" },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "tests",
    timestamps: false,
  }
);

module.exports = Test;
