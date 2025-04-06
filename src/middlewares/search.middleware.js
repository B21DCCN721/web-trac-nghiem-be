const { Op } = require("sequelize");

const searchMiddleware = (req, res, next) => {
  const { search } = req.query;

  if (search) {
    req.searchQuery = {
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${search}%`, // Tìm kiếm theo trường `title`
            },
          },
          {
            author: {
              [Op.like]: `%${search}%`, // Tìm kiếm theo trường `author`
            },
          },
        ],
      },
    };
  }

  next();
};

module.exports = { searchMiddleware };
