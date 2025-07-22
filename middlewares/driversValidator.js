const { body } = require('express-validator');
exports.driversValidator = [
  body('name').notEmpty(),
  body('email').isEmail()
];