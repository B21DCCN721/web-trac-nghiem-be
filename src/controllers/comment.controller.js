const { Comment, User } = require("../models"); // Để join lấy avatar, name
const { Op } = require("sequelize");

// Tạo mới comment hoặc reply
const createComment = async (req, res) => {
  try {
    const { content, test_id, parent_id = null } = req.body;
    const user_id = req.user.id;

    if (!content || !test_id) {
      return res
        .status(400)
        .json({ code: 0, message: "Thiếu nội dung hoặc test_id" });
    }

    // Nếu có parent_id thì kiểm tra parent đó có tồn tại không
    if (parent_id) {
      const parentComment = await Comment.findByPk(parent_id);
      if (!parentComment || parentComment.parent_id) {
        return res
          .status(400)
          .json({
            code: 0,
            message:
              "Không thể trả lời comment cấp con hoặc comment không tồn tại",
          });
      }
    }

    const newComment = await Comment.create({
      content,
      test_id,
      user_id,
      parent_id,
    });

    res.status(201).json({
      code: 1,
      message: "Tạo bình luận thành công",
      data: newComment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 0, message: "Lỗi server" });
  }
};

// Lấy danh sách comment của một test
const getCommentsByTest = async (req, res) => {
  try {
    const { testId } = req.params;

    // Lấy tất cả comment kèm user
    const allComments = await Comment.findAll({
      where: { test_id: testId },
      include: {
        model: User,
        attributes: ["id", "name", "avatar"],
      },
      order: [["created_at", "ASC"]],
    });

    // Tách comment cha và con
    const parents = allComments.filter((c) => !c.parent_id);
    const children = allComments.filter((c) => c.parent_id);

    // Gắn replies vào comment cha
    const commentTree = parents.map((parent) => {
      const replies = children.filter((c) => c.parent_id === parent.id);
      return {
        ...parent.toJSON(),
        replies: replies.map((r) => r.toJSON()),
      };
    });

    res.json({
      code: 1,
      message: "Lấy danh sách bình luận thành công",
      data: commentTree,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 0, message: "Lỗi server" });
  }
};

module.exports = {
  createComment,
  getCommentsByTest,
};
