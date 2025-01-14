const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const userRoutes = require('./userRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const contentRoutes = require('./contentRoutes');
const dashboardRoutes = require('./dashboardRoutes');

module.exports = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
    app.use('/api/content', contentRoutes);
    app.use('/api/dashboard', dashboardRoutes);
};
