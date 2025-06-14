const User = require('./user.model');
const Student = require('./student.model');
const Test = require('./test.model');
const Question = require('./question.model');
const Answer = require('./answer.model');
const Submission = require('./submission.model');
const StudentAnswer = require('./studentAnswer.model');
const Comment = require('./comment.model');

// Thiết lập quan hệ
User.hasOne(Student, { foreignKey: 'user_id' });
Student.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Test, { foreignKey: 'created_by' });
Test.belongsTo(User, { foreignKey: 'created_by' });

Test.hasMany(Question, { foreignKey: 'test_id' });
Question.belongsTo(Test, { foreignKey: 'test_id' });

Question.hasMany(Answer, { foreignKey: 'question_id' });
Answer.belongsTo(Question, { foreignKey: 'question_id' });

User.hasMany(Submission, { foreignKey: 'user_id' });
Submission.belongsTo(User, { foreignKey: 'user_id' });

Test.hasMany(Submission, { foreignKey: 'test_id' });
Submission.belongsTo(Test, { foreignKey: 'test_id' });

Submission.hasMany(StudentAnswer, { foreignKey: 'submission_id' });
StudentAnswer.belongsTo(Submission, { foreignKey: 'submission_id' });

Question.hasMany(StudentAnswer, { foreignKey: 'question_id' });
StudentAnswer.belongsTo(Question, { foreignKey: 'question_id' });

Answer.hasMany(StudentAnswer, { foreignKey: 'answer_id' });
StudentAnswer.belongsTo(Answer, { foreignKey: 'answer_id' });

User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

Test.hasMany(Comment, { foreignKey: 'test_id' });
Comment.belongsTo(Test, { foreignKey: 'test_id' });

Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'Replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'Parent' });

module.exports = {
  User,
  Student,
  Test,
  Question,
  Answer,
  Submission,
  StudentAnswer,
  Comment
};
