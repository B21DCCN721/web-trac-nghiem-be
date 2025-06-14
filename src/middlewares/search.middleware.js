const { Op } = require('sequelize');
const { sequelize } = require('../configs/connectDB');

const exerciseFilterMiddleware = (req, res, next) => {
  const { search } = req.query;
  const whereClause = {};
  // Search in title or description
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { id: { [Op.like]: `%${search}%` } }
    ];
  }

  // Add filters to request object
  req.filters = { where: whereClause };
  next();
};

module.exports = { exerciseFilterMiddleware };