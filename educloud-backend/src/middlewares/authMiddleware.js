const jwt = require('jsonwebtoken');
const { APIError } = require('../utils/errorHandler');
const User = require('../models/User');

// Protect routes - Authentication
exports.protect = async (req, res, next) => {
    try {
        // 1) Get token from header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new APIError('You are not logged in. Please log in to get access.', 401));
        }

        // 2) Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if user still exists
        const user = await User.findById(decoded.userId || decoded.userID).select('-password');
        if (!user) {
            return next(new APIError('The user belonging to this token no longer exists.', 401));
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        next(new APIError('Invalid token. Please log in again.', 401));
    }
};

// Authorize certain roles
exports.authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new APIError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
