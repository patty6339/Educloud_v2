// Async handler to avoid try-catch blocks in controllers
exports.handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class for API errors
class APIError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Handle mongoose validation errors
const handleValidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new APIError(message, 400);
};

// Handle mongoose cast errors
const handleCastError = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new APIError(message, 400);
};

// Global error handler middleware
exports.errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Convert mongoose errors to our custom error format
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'CastError') err = handleCastError(err);

    // Development error response
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: {
                name: err.name,
                message: err.message,
                errors: err.errors,
                stack: err.stack
            }
        });
    } 
    // Production error response
    else {
        // Operational, trusted error: send message to client
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } 
        // Programming or other unknown error: don't leak error details
        else {
            console.error('ERROR ', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

// ...existing code...

// Global error handler middleware
exports.globalErrorHandler = (err, req, res, next) => {
    // Set default values for error
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle specific mongoose errors
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'CastError') err = handleCastError(err);

    // Send error response
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

exports.APIError = APIError;
