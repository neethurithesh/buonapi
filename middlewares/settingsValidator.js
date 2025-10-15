// middlewares/settingsValidator.js
const { body } = require('express-validator');

exports.createValidator = [
  body('setting_key')
    .exists().withMessage('setting_key is required')
    .isString().withMessage('setting_key must be a string')
    .isLength({ min: 1, max: 255 }).withMessage('setting_key length invalid'),
  body('value').optional().isString().withMessage('value must be a string'),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('is_public').optional().isBoolean().withMessage('is_public must be boolean'),
];

exports.updateValidator = [
  // all fields optional but if present should be validated
  body('setting_key').optional().isString().isLength({ min: 1, max: 255 }),
  body('value').optional().isString(),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('is_public').optional().isBoolean(),
];
