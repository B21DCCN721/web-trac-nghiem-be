const testRoute = require('./test.route');
const authRoute = require('./auth.route');

function route(app) {
    app.use('/', authRoute);
    app.use('/test', testRoute);
}

module.exports = route;