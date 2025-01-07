const { body, validationResult } = require('express-validator');

exports.liveClassValidation = {
  createLiveClass: [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    // Add other validation rules as needed
  ],
  updateLiveClass: [
    body('title').optional().notEmpty().withMessage('Title is required'),
    body('description').optional().notEmpty().withMessage('Description is required'),
    // Add other validation rules as needed
  ],
};

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };
};
