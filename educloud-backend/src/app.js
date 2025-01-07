require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

// Import middleware
const { errorHandler } = require('./utils/errorHandler');
const { protect } = require('./middlewares/authMiddleware');

// Import routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const liveClassRoutes = require('./routes/liveClassRoutes');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't exit process, allow server to start even if DB connection fails
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Setup Swagger documentation
require('./config/swagger')(app);

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses/:courseId/live-classes', liveClassRoutes);
app.use('/api/live-classes', liveClassRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to EduCloud API',
        documentation: '/api-docs',
        version: '1.0.0'
    });
});

// Error handling
app.use(errorHandler);

module.exports = app;
