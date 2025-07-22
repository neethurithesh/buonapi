const { body } = require('express-validator');
exports.staffUsersValidator = [
  body('full_name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars long')
];
