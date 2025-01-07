const { body, validationResult } = require('express-validator');
const { validate } = require('../validations');

exports.validate = (validations) => {
    return async (req, res, next) => {
        // Execute all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array() 
            });
        }
        next();
    };
};

// Common validation rules
exports.userValidationRules = {
    register: [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Must be a valid email address'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
    ],
    login: [
        body('email').isEmail().withMessage('Must be a valid email address'),
        body('password').notEmpty().withMessage('Password is required')
    ]
};

exports.courseValidationRules = {
    create: [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('description').trim().notEmpty().withMessage('Description is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('duration').isNumeric().withMessage('Duration must be a number')
    ]
};

exports.lessonValidationRules = {
    create: [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
        body('duration').isNumeric().withMessage('Duration must be a number'),
        body('order').isNumeric().withMessage('Order must be a number')
    ]
};

module.exports = validate
