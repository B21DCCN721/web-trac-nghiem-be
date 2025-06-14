const testRoute = require('./test.route');
const studentRoute = require('./student.route');
const adminRoute = require('./admin.route');
const authRoute = require('./auth.route');

function route(app) {
    // các api liên quan đến người dùng
    app.use('/api/auth', authRoute);
    // các api liên quan đến bài kiểm tra cả admin và student
    app.use('/api/test', testRoute);
    // các api liên quan đến admin
    app.use('/api/admin', adminRoute);
    // các api liên quan đến học sinh
    app.use('/api/student', studentRoute);
}

module.exports = route;