const { body } = require('express-validator');
exports.driversValidator = [
  body('name').notEmpty(),
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').notEmpty(),
];

exports.driversLoginValidator = [ 
  body('username').notEmpty(), 
  body('password').notEmpty(),
];
