const testRoute = require('./test.route');
const userRoute = require('./user.route');
const adminRoute = require('./admin.route');

function route(app) {
    app.use('/test', testRoute);
    app.use('/admin', adminRoute);
    app.use('/', userRoute);
}

module.exports = route;