const testRoute = require('./test.route');
const studentRoute = require('./student.route');
const adminRoute = require('./admin.route');
const authRoute = require('./auth.route');
const commentRoute = require('./comment.route');

function route(app) {
    // các api liên quan đến người dùng
    app.use('/api/auth', authRoute);
    // các api liên quan đến bài kiểm tra cả admin và student
    app.use('/api/test', testRoute);
    // các api liên quan đến admin
    app.use('/api/admin', adminRoute);
    // các api liên quan đến học sinh
    app.use('/api/student', studentRoute);
    // các api liên quan đến comment
    app.use('/api/comment', commentRoute);
}

module.exports = route;