const { body, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }
    next();
};

// User validation rules
const userValidationRules = {
    register: [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long')
            .matches(/\d/)
            .withMessage('Password must contain a number'),
        body('name').notEmpty().withMessage('Name is required'),
        body('role').isIn(['student', 'instructor']).withMessage('Invalid role')
    ],
    login: [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ]
};

// Course validation rules
const courseValidationRules = {
    create: [
        body('title').notEmpty().withMessage('Course title is required'),
        body('description').notEmpty().withMessage('Course description is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('level')
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('Invalid course level'),
        body('category').notEmpty().withMessage('Category is required')
    ],
    update: [
        body('title').optional().notEmpty().withMessage('Course title cannot be empty'),
        body('description').optional().notEmpty().withMessage('Course description cannot be empty'),
        body('price').optional().isNumeric().withMessage('Price must be a number'),
        body('level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('Invalid course level')
    ]
};

// Enrollment validation rules
const enrollmentValidationRules = {
    create: [
        body('courseId').notEmpty().withMessage('Course ID is required')
    ]
};

module.exports = {
    validate,
    userValidationRules,
    courseValidationRules,
    enrollmentValidationRules
};
