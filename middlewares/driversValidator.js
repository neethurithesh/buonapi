const { body } = require('express-validator');
exports.driversValidator = [
  body('name').notEmpty(),
  body('username').isEmail(),
  body('password').notEmpty(),
];
