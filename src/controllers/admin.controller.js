const { v4: uuidv4 } = require("uuid");
const { Test, Question, Answer, User, Submission } = require("../models");
const { sequelize } = require("../configs/connectDB");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment"); // Dùng moment để xử lý thời gian

const createTest = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, subject, questions } = req.body;
    const createdBy = req.user.id;
    const user = await User.findByPk(createdBy);
    const author = user.name;

    if (
      !title ||
      !subject ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    // Sinh mã bài thi 6 ký tự ngẫu nhiên từ uuid
    const code = uuidv4().split("-").join("").slice(0, 6);

    // Tạo bài thi
    const test = await Test.create(
      {
        code,
        title,
        description,
        subject,
        author,
        quantity: questions.length,
        created_by: createdBy,
      },
      { transaction: t }
    );

    // Lưu từng câu hỏi và đáp án
    for (const q of questions) {
      const { question, options, correctAnswer } = q;

      if (!question || !Array.isArray(options) || correctAnswer == null) {
        await t.rollback();
        return res.status(400).json({ message: "Câu hỏi không hợp lệ." });
      }

      // Tạo câu hỏi
      const createdQuestion = await Question.create(
        {
          id: test.id,
          question_text: question,
        },
        { transaction: t }
      );

      // Tạo đáp án
      for (let i = 0; i < options.length; i++) {
        await Answer.create(
          {
            question_id: createdQuestion.id,
            answer_text: options[i],
            is_correct: i === correctAnswer,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return res
      .status(201)
      .json({ code: 1, message: "Tạo bài thi thành công", data: test });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi tạo bài thi:", error);
    return res
      .status(500)
      .json({ code: 0, message: "Lỗi server khi tạo bài thi." });
  }
};
const updateTest = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const testId = req.params.id;
    const { title, description, subject, questions } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !title ||
      !subject ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ." });
    }

    // Kiểm tra bài thi tồn tại
    const test = await Test.findByPk(testId);
    if (!test) {
      return res.status(404).json({ message: "Không tìm thấy bài thi." });
    }

    // Cập nhật thông tin bài thi
    await test.update(
      {
        title,
        description,
        subject,
        quantity: questions.length,
      },
      { transaction: t }
    );

    // Xóa câu hỏi và đáp án cũ
    const oldQuestions = await Question.findAll({ where: { test_id: testId } });
    const oldQuestionIds = oldQuestions.map((q) => q.id);

    await Answer.destroy({
      where: { question_id: oldQuestionIds },
      transaction: t,
    });
    await Question.destroy({ where: { test_id: testId }, transaction: t });

    // Tạo lại câu hỏi và đáp án
    for (const q of questions) {
      const { question, options, correctAnswer } = q;

      if (!question || !Array.isArray(options) || correctAnswer == null) {
        await t.rollback();
        return res.status(400).json({ message: "Câu hỏi không hợp lệ." });
      }

      const createdQuestion = await Question.create(
        {
          test_id: testId,
          question_text: question,
        },
        { transaction: t }
      );

      for (let i = 0; i < options.length; i++) {
        await Answer.create(
          {
            question_id: createdQuestion.id,
            answer_text: options[i],
            is_correct: i === correctAnswer,
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return res
      .status(200)
      .json({ code: 1, message: "Cập nhật bài thi thành công." });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi cập nhật bài thi:", error);
    return res.status(500).json({ code: 0, message: "Lỗi server." });
  }
};
const deleteTest = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const testId = req.params.id;

    // Kiểm tra bài thi tồn tại
    const test = await Test.findByPk(testId);
    if (!test) {
      return res.status(404).json({ message: "Không tìm thấy bài thi." });
    }

    // Xóa câu hỏi và đáp án liên quan
    const questions = await Question.findAll({ where: { test_id: testId } });
    const questionIds = questions.map((q) => q.id);

    await Answer.destroy({
      where: { question_id: questionIds },
      transaction: t,
    });
    await Question.destroy({ where: { test_id: testId }, transaction: t });

    // Xóa bài thi
    await test.destroy({ transaction: t });

    await t.commit();
    return res
      .status(200)
      .json({ code: 1, message: "Xóa bài thi thành công." });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi xóa bài thi:", error);
    return res.status(500).json({ code: 0, message: "Lỗi server." });
  }
};
const getAverageScoreTest = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Submission.findAll({
      where: { test_id: id },
      include: [
        {
          model: User,
          attributes: [],
          where: { role: "student" },
        },
      ],
      attributes: [
        [
          Submission.sequelize.fn("AVG", Submission.sequelize.col("score")),
          "average_score",
        ],
      ],
      raw: true,
    });

    const avgScore = result[0].average_score;

    res.status(200).json({
      code: 1,
      data: {
        test_id: id,
        average_score: avgScore ? parseFloat(avgScore).toFixed(2) : null,
      },
    });
  } catch (error) {
    console.error("Error calculating average score:", error);
    res.status(500).json({ code: 0, message: "Lỗi server" });
  }
};
const getStudentSubmission = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const submissions = await Submission.findAndCountAll({
      where: { test_id: id },
      include: [
        {
          model: User,
          where: { role: "student" },
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["submitted_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      code: 1,
      data: {
        submissions: submissions.rows,
        pagination: {
          total: submissions.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
          totalPages: Math.ceil(submissions.count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res.status(500).json({ code: 0, message: "Lỗi server" });
  }
};
const getAdminTestStats = async (req, res) => {
  try {
    const adminId = req.user.id;

    // 1. Tổng số bài thi được admin tạo
    const totalTests = await Test.count({
      where: { created_by: adminId },
    });

    // 2. Tìm các bài test ID được admin tạo
    const testIds = await Test.findAll({
      where: { created_by: adminId },
      attributes: ['id'],
      raw: true,
    });
    const testIdList = testIds.map(t => t.id);

    if (testIdList.length === 0) {
      return res.status(200).json({
        code: 1,
        message: "Thống kê bài thi của admin thành công.",
        data: {
          totalTests: 0,
          averageScore: 0,
          studentCount: 0,
        },
      });
    }

    // 3. Điểm trung bình tất cả submissions của các bài test này
    const submissionStats = await Submission.findAll({
      where: {
        test_id: { [Op.in]: testIdList },
      },
      attributes: [
        [fn("AVG", col("score")), "averageScore"],
      ],
      raw: true,
    });

    const averageScore = parseFloat(submissionStats[0].averageScore || 0);

    // 4. Đếm số lượng user duy nhất (students) đã nộp bài
    const students = await Submission.findAll({
      where: {
        test_id: { [Op.in]: testIdList },
      },
      attributes: [[fn("DISTINCT", col("user_id")), "user_id"]],
      raw: true,
    });

    const studentCount = students.length;

    return res.status(200).json({
      code: 1,
      message: "Thống kê bài thi của admin thành công.",
      data: {
        totalTests,
        averageScore: +averageScore.toFixed(2),
        studentCount,
      },
    });

  } catch (error) {
    console.error("Error getting admin stats:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi khi lấy thống kê.",
    });
  }
};
const getTestStatsLast10Days = async (req, res) => {
  try {
    const adminId = req.user.id;
    // Tính ngày hôm nay và ngày 10 ngày trước
    const today = moment().endOf("day").toDate();
    const tenDaysAgo = moment().subtract(9, "days").startOf("day").toDate();

    const stats = await Test.findAll({
      where: {
        created_by: adminId,
        created_at: {
          [Op.between]: [tenDaysAgo, today],
        },
      },
      attributes: [
        [fn("DATE", col("created_at")), "date"],
        [fn("COUNT", col("id")), "test_count"],
      ],
      group: [fn("DATE", col("created_at"))],
      order: [[literal("date"), "ASC"]],
      raw: true,
    });

    // Đảm bảo trả về đủ 10 ngày, cả ngày không có bài thi
    const result = [];
    for (let i = 9; i >= 0; i--) {
      const day = moment().subtract(i, "days").format("YYYY-MM-DD");
      const found = stats.find((s) => moment(s.date).format("YYYY-MM-DD") === day);
      result.push({
        date: day,
        test_count: found ? parseInt(found.test_count) : 0,
      });
    }

    return res.status(200).json({
      code: 1,
      message: "Lấy thống kê bài thi trong 10 ngày thành công.",
      data: result,
    });
  } catch (error) {
    console.error("Error getting test stats:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi khi lấy thống kê bài thi.",
    });
  }
};

module.exports = {
  createTest,
  updateTest,
  deleteTest,
  getAverageScoreTest,
  getStudentSubmission,
  getAdminTestStats,
  getTestStatsLast10Days
};
