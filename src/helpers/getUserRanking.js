const {Student} = require('../models'); // Giả sử bạn đã định nghĩa mô hình Student trong models/index.js
const { Op } = require('sequelize');

const getUserRanking = async (userId) => {
  // Lấy điểm của user hiện tại
  const currentStudent = await Student.findOne({ where: { user_id: userId } });
  if (!currentStudent) return null;

  const userScore = currentStudent.score;

  // Đếm số lượng học sinh có điểm cao hơn
  const higherScoreCount = await Student.count({
    where: {
      score: { [Op.gt]: userScore }
    }
  });

  // Thứ hạng = số người cao hơn + 1
  return higherScoreCount + 1;
};
module.exports = getUserRanking;