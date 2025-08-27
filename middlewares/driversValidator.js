const { body } = require('express-validator');
exports.driversValidator = [
  body('name').notEmpty(), 
  body('email').isEmail(), 
  body('phone').isEmail(), 
];

exports.driversLoginValidator = [ 
  body('username').notEmpty(), 
  body('password').notEmpty(),
];
