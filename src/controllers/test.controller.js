const { Op } = require("sequelize");
const { sequelize } = require("../configs/connectDB");
const {
  Test,
  Question,
  Answer,
  TestHistory,
  UserAnswer,
  User
} = require("../models");

// lay danh sach bai thi
const getListTests = async (req, res) => {
  const { page = 1, limit = 5 } = req.query; 
  const offset = (page - 1) * limit; 
  
  try {
    const queryOptions = {
      ...req.searchQuery, // Nếu có tìm kiếm thì áp dụng
      limit: Number(limit),
      offset: Number(offset),
      order: [["created_at", "DESC"]],
    };
    
    // Lấy danh sách tests từ database với điều kiện tìm kiếm và phân trang
    const tests = await Test.findAll(queryOptions);

    // Tính tổng số lượng bản ghi
    const totalTests = await Test.count({
      where: req.searchQuery ? req.searchQuery.where : {}, // Nếu có search thì lọc theo search
    });

    const totalPages = Math.ceil(totalTests / limit); // Tính tổng số trang

    res.status(200).json({
      message: "Thành công",
      data: tests,
      pagination: {
        totalTests,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
//lay thong tin 1 bai thi
const getInfoTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Thiếu id bài test" });
    }

    const infoTest = await Test.findOne({
      where: { id },
    });

    if (!infoTest) {
      return res.status(404).json({ message: "Không tìm thấy bài test" });
    }

    res.status(200).json({ message: "Thành công", data: infoTest });
  } catch (error) {
    console.error("Lỗi lấy chi tiết bài test:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
//lay chi tiet bai thi gom cau hoi va dap an
const getDetailTest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Thiếu id bài thi" });
    }

    // Tìm bài thi theo id
    const test = await Test.findOne({
      where: { id },
      include: [
        {
          model: Question,
          include: [
            {
              model: Answer, // Bao gồm câu trả lời liên quan đến câu hỏi
            },
          ],
        },
      ],
    });

    if (!test) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    // Trả về thông tin bài thi với câu hỏi và câu trả lời
    res.status(200).json({ message: "Thành công", data: test });
  } catch (error) {
    console.error("Lỗi lấy chi tiết bài thi:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// xử lý nộp bài thi
const submitTest = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { test_id, answers } = req.body; // Nhận user_id, test_id và danh sách câu trả lời từ request body

    // Tạo bản ghi lịch sử thi (TestHistory)
    const test = await Test.findOne({ where: { id: test_id } });
    if (!test) {
      return res.status(404).json({ message: "Bài thi không tồn tại" });
    }

    // Tạo bản ghi TestHistory
    const history = await TestHistory.create({
      user_id,
      test_id,
      score: 0, // Chưa tính điểm
      completed_at: new Date(),
    });

    // Lưu các câu trả lời của người dùng vào UserAnswer
    let score = 0;
    for (const answer of answers) {
      const { question_id, answer_id } = answer;

      // Kiểm tra xem câu trả lời có hợp lệ không
      const correctAnswer = await Answer.findOne({
        where: { id: answer_id, is_correct: true },
      });
      if (correctAnswer) {
        score += 1; // Tăng điểm khi câu trả lời đúng
      }

      // Lưu câu trả lời vào bảng UserAnswer
      await UserAnswer.create({
        history_id: history.id,
        question_id,
        answer_id,
      });
    }

    // Cập nhật điểm số vào TestHistory
    await history.update({ score });

     // Cập nhật số lần làm bài vào bảng Test
     await test.update({
      attempts: test.attempts + 1, // Tăng số lần làm bài lên 1
    });

    res.status(200).json({
      message: "Nộp bài thành công",
      score: score,
    });
  } catch (error) {
    console.error("Lỗi khi nộp bài test:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// lấy ra lịch sử làm bài
const getHistoryTest = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 5 } = req.query; 
    const offset = (page - 1) * limit; 
    const queryOptions = {
      limit: Number(limit),
      offset: Number(offset),
    };

    // Lấy lịch sử làm bài của người dùng, bao gồm thông tin bài thi và điểm số
    const history = await TestHistory.findAll({
      where: { user_id }, // Lọc theo user_id
      include: [
        {
          model: Test, // Lấy thông tin bài thi 
          attributes: ["title", "description"], // Chỉ lấy các trường cần thiết từ Test
        },
      ],
      ...queryOptions,
      order: [["completed_at", "DESC"]],
    });
    // Đếm tổng số bản ghi
    const total = await TestHistory.count({
      where: { user_id },
    });
    const totalPages = Math.ceil(total/ limit);
    res.status(200).json({
      message: `Lịch sử làm bài của ${req.user.username}`,
      data: history,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử làm bài:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// lấy ra lịch sử lựa chọn ứng vơí lịch sử bài làm
const getUserAnswers = async (req, res) => {
  try {
    const { history_id } = req.params;

    // Tìm lịch sử làm bài
    const history = await TestHistory.findByPk(history_id, {
      include: [
        {
          model: Test,
          attributes: ["id", "title", "description"],
        },
      ],
    });

    // if (!history) {
    //   return res
    //     .status(404)
    //     .json({ message: "Không tìm thấy lịch sử làm bài" });
    // }

    // Lấy danh sách đáp án người dùng đã chọn
    const userAnswers = await UserAnswer.findAll({
      where: { history_id },
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
    const user = await User.findByPk(req.user.id, {
          attributes: ["id", "username", "email", "class", "description"],
        });

    // if (userAnswers.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "Không tìm thấy câu trả lời cho bài thi này" });
    // }

    // Chuẩn hóa dữ liệu trả về
    const formattedAnswers = userAnswers.map((ua) => ({
      question: ua.Question,
      selected_answer: ua.Answer,
    }));

    // Trả về dữ liệu đã tách rõ ràng
    res.status(200).json({
      message: `Lịch sử lựa chọn đáp án của ${req.user.username}`,
      user,
      historyTest: {
        id: history.id,
        score: history.score,
        completed_at: history.completed_at,
        test: history.Test,
      },
      data: formattedAnswers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đáp án:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// tạo mới bài thi
const createTest = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { title, description, author,  questions } = req.body;

    // Lấy ID người tạo từ token
    const created_by = req.user?.id;
    const quantity = questions.length;
    // Kiểm tra dữ liệu
    if (!title || !author || !quantity || !created_by || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    // Tạo bài thi
    const newTest = await Test.create(
      { title, description, author, quantity, created_by },
      { transaction: t }
    );

    // Duyệt từng câu hỏi
    for (const q of questions) {
      if (!q.question_text || !Array.isArray(q.answers) || q.answers.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: "Mỗi câu hỏi cần có nội dung và ít nhất 1 đáp án" });
      }

      // Kiểm tra có ít nhất 1 đáp án đúng
      const hasCorrectAnswer = q.answers.some(a => a.is_correct === true);
      if (!hasCorrectAnswer) {
        await t.rollback();
        return res.status(400).json({ message: `Câu hỏi "${q.question_text}" cần ít nhất 1 đáp án đúng` });
      }

      const question = await Question.create(
        {
          test_id: newTest.id,
          question_text: q.question_text,
        },
        { transaction: t }
      );

      // Tạo các đáp án cho câu hỏi
      for (const a of q.answers) {
        await Answer.create(
          {
            question_id: question.id,
            answer_text: a.answer_text,
            is_correct: a.is_correct || false,
          },
          { transaction: t }
        );
      }
    }

    // Commit khi mọi thứ thành công
    await t.commit();
    res.status(201).json({ message: "Tạo bài thi thành công", test_id: newTest.id });

  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi tạo bài thi:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// xóa bài thi
const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Test.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy bài thi" });
    }

    res.json({ message: "Xóa bài thi thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa bài thi:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// chỉnh sửa bài thi
const updateTest = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { title, description, author, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Bài thi cần có ít nhất 1 câu hỏi" });
    }

    const test = await Test.findByPk(id);
    if (!test) return res.status(404).json({ message: "Không tìm thấy bài thi" });

    // Cập nhật bài thi
    await test.update(
      { title, description, author, quantity: questions.length },
      { transaction: t }
    );

    // Lấy danh sách câu hỏi cũ
    const oldQuestions = await Question.findAll({ where: { test_id: id }, transaction: t });

    // Cập nhật hoặc tạo mới câu hỏi và đáp án
    const updatedQuestionIds = [];
    for (const q of questions) {
      if (!q.question_text || !Array.isArray(q.answers) || q.answers.length !== 4) {
        await t.rollback();
        return res.status(400).json({ message: "Mỗi câu hỏi cần có nội dung và đúng 4 đáp án" });
      }

      const hasCorrect = q.answers.some(a => a.is_correct === true);
      if (!hasCorrect) {
        await t.rollback();
        return res.status(400).json({ message: `Câu hỏi "${q.question_text}" cần ít nhất 1 đáp án đúng` });
      }

      let question;
      if (q.id) {
        // Cập nhật câu hỏi cũ
        question = await Question.findByPk(q.id, { transaction: t });
        if (question) {
          await question.update({ question_text: q.question_text }, { transaction: t });
        }
      } 
      if (!question) {
        // Tạo mới nếu không tồn tại
        question = await Question.create(
          { test_id: id, question_text: q.question_text },
          { transaction: t }
        );
      }

      updatedQuestionIds.push(question.id);

      const oldAnswers = await Answer.findAll({
        where: { question_id: question.id },
        transaction: t,
      });

      const updatedAnswerIds = [];
      for (const a of q.answers) {
        let answer;
        if (a.id) {
          answer = await Answer.findByPk(a.id, { transaction: t });
          if (answer) {
            await answer.update(
              { answer_text: a.answer_text, is_correct: a.is_correct },
              { transaction: t }
            );
          }
        }

        if (!answer) {
          answer = await Answer.create(
            {
              question_id: question.id,
              answer_text: a.answer_text,
              is_correct: a.is_correct,
            },
            { transaction: t }
          );
        }

        updatedAnswerIds.push(answer.id);
      }

      // Xóa các đáp án không còn trong danh sách
      const oldAnswerIds = oldAnswers.map(a => a.id);
      const answersToDelete = oldAnswerIds.filter(id => !updatedAnswerIds.includes(id));
      await Answer.destroy({ where: { id: answersToDelete }, transaction: t });
    }

    // Xóa các câu hỏi không còn tồn tại
    const oldQuestionIds = oldQuestions.map(q => q.id);
    const questionsToDelete = oldQuestionIds.filter(id => !updatedQuestionIds.includes(id));
    await Question.destroy({ where: { id: questionsToDelete }, transaction: t });

    await t.commit();
    res.json({ message: "Cập nhật bài thi thành công" });

  } catch (error) {
    await t.rollback();
    console.error("Lỗi khi cập nhật bài thi:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  getListTests,
  getInfoTest,
  getDetailTest,
  submitTest,
  getHistoryTest,
  getUserAnswers,
  createTest, 
  deleteTest,
  updateTest,
};
