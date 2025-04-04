const {
  Test,
  Question,
  Answer,
  TestHistory,
  UserAnswer,
} = require("../models");

// lay danh sach bai thi
const getListTests = async (req, res) => {
  try {
    const tests = await Test.findAll();
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
//lay thong tin 1 bai thi
const getInfoTest = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Thiếu id bài test" });
    }

    const infoTest = await Test.findOne({
      where: { id },
    });

    if (!infoTest) {
      return res.status(404).json({ message: "Không tìm thấy bài test" });
    }

    res.status(200).json(infoTest);
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
    res.status(200).json(test);
  } catch (error) {
    console.error("Lỗi lấy chi tiết bài thi:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// xử lý nộp bài thi
const submitTest = async (req, res) => {
  try {
    const { user_id, test_id, answers } = req.body; // Nhận user_id, test_id và danh sách câu trả lời từ request body

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

    res.status(200).json({
      message: "Nộp bài thành công",
      score: score,
    });
  } catch (error) {
    console.error("Lỗi khi nộp bài test:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// lấy ra lịch sử làm bàibài
const getHistoryTest = async (req, res) => {
  try {
    const user_id = req.user.id; // Lấy user_id từ URL params

    // Lấy lịch sử làm bài của người dùng, bao gồm thông tin bài thi và điểm số
    const history = await TestHistory.findAll({
      where: { user_id }, // Lọc theo user_id
      include: [
        {
          model: Test, // Lấy thông tin bài thi 
          attributes: ["title", "description"], // Chỉ lấy các trường cần thiết từ Test
        },
      ],
    });

    // Kiểm tra nếu không có lịch sử nào
    if (history.length === 0) {
      return res
        .status(404)
        .json({ message: "Không có lịch sử làm bài cho người dùng này" });
    }

    res.status(200).json({
      message: "Lịch sử làm bài thành công",
      data: history,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử làm bài:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// lấy ra lịch sử lựa chọn ứng vơí lịch sử bài làmlàm
const getUserAnswers = async (req, res) => {
  try {
    const { history_id } = req.params; // Lấy history_id từ URL params

    // Tìm lịch sử làm bài tương ứng với history_id
    const history = await TestHistory.findByPk(history_id);

    // Kiểm tra nếu không tìm thấy lịch sử làm bài
    if (!history) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy lịch sử làm bài" });
    }

    // Lấy lịch sử lựa chọn đáp án của người dùng từ bảng UserAnswer
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

    if (userAnswers.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy câu trả lời cho bài thi này" });
    }

    // Trả về danh sách câu hỏi và câu trả lời đã chọn
    res.status(200).json({
      message: "Lịch sử lựa chọn đáp án thành công",
      data: userAnswers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đáp án:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getListTests,
  getInfoTest,
  getDetailTest,
  submitTest,
  getHistoryTest,
  getUserAnswers,
};
