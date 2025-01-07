const rateLimit = require('express-rate-limit');

// Create a limiter for general API endpoints
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Create a stricter limiter for authentication endpoints
exports.authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 login requests per hour
    message: {
        message: 'Too many login attempts from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Create a limiter for file upload endpoints
exports.uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 upload requests per hour
    message: {
        message: 'Upload limit exceeded, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});
