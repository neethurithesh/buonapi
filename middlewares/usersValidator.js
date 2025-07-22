const { body } = require('express-validator');
exports.usersValidator = [
  body('name').notEmpty(),
  body('email').isEmail()
];