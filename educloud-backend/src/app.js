const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs'); // Added fs module

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const liveClassRoutes = require('./routes/liveClassRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be served cross-origin
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "blob:", "*"], // Allow images from any source
        },
    },
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(xss()); // Sanitize data
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Serve static files
const uploadsDir = path.join(__dirname, '../uploads');
const coursesUploadsDir = path.join(uploadsDir, 'courses');

// Create uploads directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(coursesUploadsDir)) {
    fs.mkdirSync(coursesUploadsDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is healthy',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses/:courseId/live-classes', liveClassRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to EduCloud API',
        version: '1.0.0',
        docs: '/api-docs'
    });
});

// Error handling
app.all('*', (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server!`));
});
app.use(errorHandler);

module.exports = app;
