const { v4: uuidv4 } = require("uuid");
const { Test, Question, Answer, User } = require("../models");
const { sequelize } = require("../configs/connectDB");

const createTest = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { title, description, subject, questions } = req.body;
    const createdBy = req.user.id; // Từ authenticateToken
    const user = await User.findByPk(createdBy);
    const author = user.name; // Hoặc lấy từ token nếu có

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
          test_id: test.id,
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
    if (!title || !subject || !Array.isArray(questions) || questions.length === 0) {
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

    await Answer.destroy({ where: { question_id: oldQuestionIds }, transaction: t });
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
    return res.status(200).json({ code: 1, message: "Cập nhật bài thi thành công." });
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

    await Answer.destroy({ where: { question_id: questionIds }, transaction: t });
    await Question.destroy({ where: { test_id: testId }, transaction: t });

    // Xóa bài thi
    await test.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ code: 1, message: "Xóa bài thi thành công." });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi xóa bài thi:", error);
    return res.status(500).json({ code: 0, message: "Lỗi server." });
  }
}

module.exports = { createTest, updateTest, deleteTest };
