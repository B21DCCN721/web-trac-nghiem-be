const { Student, User } = require('../models');

const getRanking = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: {
        model: User,
        attributes: ['id', 'name', 'email', 'avatar'],
        where: { role: 'student' }
      },
      order: [['score', 'DESC']]
    });

    return res.status(200).json({
      code: 1,
      message: 'Lấy danh sách học sinh thành công',
      data: students
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách học sinh:", error);
    return res.status(500).json({
      code: 0,
      message: 'Lỗi server khi lấy danh sách học sinh'
    });
  }
};

module.exports = { getRanking };
