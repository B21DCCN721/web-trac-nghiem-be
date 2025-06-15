const { Op } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const {
  Test,
  Question,
  Answer,
  User,
  Submission,
  StudentAnswer,
  Student,
} = require("../models");

const getAllTests = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Lấy điều kiện lọc từ middleware
    const whereClause = req.filters?.where || {};

    const tests = await Test.findAndCountAll({
      where: whereClause,
      attributes: [
        "id",
        "code",
        "title",
        "subject",
        "author",
        "quantity",
        "attempts",
        "created_at",
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      code: 1,
      message: "Lấy danh sách bài thi thành công",
      data: {
        tests: tests.rows,
        pagination: {
          total: tests.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(tests.count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting tests:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getInfoTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findOne({
      where: { id },
      attributes: [
        "id",
        "title",
        "code",
        "description",
        "quantity",
        "subject",
        "author",
        "attempts",
        "created_at",
      ],
    });

    if (!test) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài thi",
      });
    }

    return res.status(200).json({
      code: 1,
      message: "Lấy chi tiết bài thi thành công",
      data: test,
    });
  } catch (error) {
    console.error("Error getting test details:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const getDetailTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findOne({
      where: { id },
      include: [
        {
          model: Question,
          attributes: ["id", "question_text", "created_at"],
          include: [
            {
              model: Answer,
              attributes: ["id", "answer_text", "is_correct"],
            },
          ],
        },
      ],
      attributes: ["id", "title", "quantity"],
    });

    if (!test) {
      return res.status(404).json({
        code: 0,
        message: "Không tìm thấy bài thi",
      });
    }

    // Hide correct answers for students
    if (req.user.role === "student") {
      test.Questions.forEach((question) => {
        question.Answers.forEach((answer) => {
          delete answer.dataValues.is_correct;
        });
      });
    }

    return res.status(200).json({
      code: 1,
      message: "Lấy chi tiết bài thi thành công",
      data: test,
    });
  } catch (error) {
    console.error("Error getting test details:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
const submitTest = async (req, res) => {
  const t = await sequelize.transaction(); // Bắt đầu transaction
  try {
    const userId = req.user.id;
    const { test_id, answers } = req.body;

    // 1. Lấy user & student
    const user = await User.findByPk(userId, { transaction: t });
    const student = await Student.findOne({
      where: { user_id: userId },
      transaction: t,
    });

    if (!user) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại." });
    }

    // 2. Tạo submission mới
    const submission = await Submission.create(
      {
        user_id: userId,
        test_id,
        score: 0,
      },
      { transaction: t }
    );

    // 3. Lấy đáp án đúng theo test
    const correctAnswers = await Answer.findAll({
      where: { is_correct: true },
      include: {
        model: Question,
        where: { test_id },
        attributes: ["id"],
      },
      transaction: t,
    });

    const correctMap = new Map();
    correctAnswers.forEach((ans) => {
      correctMap.set(ans.question_id, ans.id);
    });

    // 4. Lấy các câu đúng trước đó (nếu có)
    const previousCorrectAnswers = await StudentAnswer.findAll({
      where: {
        question_id: { [Op.in]: answers.map((a) => a.question_id) },
        answer_id: { [Op.in]: Array.from(correctMap.values()) },
        "$Submission.user_id$": userId,
        "$Submission.test_id$": test_id,
      },
      include: [
        {
          model: Submission,
          attributes: [],
        },
      ],
      transaction: t,
    });

    const previouslyCorrectQuestions = new Set(
      previousCorrectAnswers.map((a) => a.question_id)
    );

    // 5. Tính điểm và lưu câu trả lời
    let score = 0;
    let correctCount = 0;

    const answerData = answers.map(({ question_id, answer_id }) => {
      const isCorrect = correctMap.get(question_id) === answer_id;
      const alreadyCorrect = previouslyCorrectQuestions.has(question_id);

      if (isCorrect) {
        correctCount++;
        if (!alreadyCorrect) {
          score++;
        }
      }

      return {
        submission_id: submission.id,
        question_id,
        answer_id,
      };
    });

    await StudentAnswer.bulkCreate(answerData, { transaction: t });

    submission.score = correctCount * 10;
    await submission.save({ transaction: t });

    // 6. Nếu là student → cộng điểm tổng
    if (student && score > 0) {
      await Student.increment("score", {
        by: score * 10,
        where: { user_id: userId },
        transaction: t,
      });
    }
    // Cộng số lượt làm bài cho test
    await Test.increment("attempts", {
      by: 1,
      where: { id: test_id },
      transaction: t,
    });

    await t.commit(); // Hoàn tất transaction nếu không lỗi

    return res.status(201).json({
      code: 1,
      message: "Nộp bài thành công!",
      data: {
        submission_id: submission.id,
        added_score: score * 10,
        correct_count: correctCount,
      },
    });
  } catch (error) {
    await t.rollback(); // Rollback nếu lỗi
    console.error("Error submitting test:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi khi nộp bài thi.",
      error: error.message,
    });
  }
};
const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Test,
          attributes: ["id", "title", "subject", "code"],
        },
        // {
        //   model: User,
        //   attributes: ["id", "name", "email"],
        // },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["submitted_at", "DESC"]],
    });

    return res.status(200).json({
      code: 1,
      message: "Lấy lịch sử làm bài thành công",
      data: {
        submissions: submissions.rows,
        pagination: {
          total: submissions.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(submissions.count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi khi lấy lịch sử làm bài.",
      error: error.message,
    });
  }
};
const getSubmissionAnswers = async (req, res) => {
  try {
    const { id } = req.params;

    const answers = await StudentAnswer.findAll({
      where: { submission_id: id },
      include: [
        {
          model: Question,
          attributes: ["id", "question_text"],
        },
        {
          model: Answer,
          attributes: ["id", "answer_text", "is_correct"],
        },
      ],
    });
    const submission = await Submission.findByPk(id, {
      include: [
        {
          model: Test,
          attributes: ["id", "title", "subject", "code", "quantity"],
          include: [
            {
              model: Question,
              attributes: ["id", "question_text", "created_at"],
              include: [
                {
                  model: Answer,
                  attributes: ["id", "answer_text", "is_correct"],
                },
              ],
            },
          ],
        },
      ],
    });
    return res.status(200).json({
      code: 1,
      message: "Lấy lịch sử lựa chọn đáp án thành công",
      data: { answers, submission },
    });
  } catch (error) {
    console.error("Error getting submission answers:", error);
    return res.status(500).json({
      code: 0,
      message: "Lỗi khi lấy lịch sử lựa chọn đáp án.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTests,
  getInfoTestById,
  getDetailTestById,
  submitTest,
  getUserSubmissions,
  getSubmissionAnswers,
};
