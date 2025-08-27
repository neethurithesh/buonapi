const { body } = require('express-validator');
exports.driversValidator = [
  body('name').notEmpty(), 
  body('email').isEmail(), 
  body('phone').notEmpty(), 
];

exports.driversLoginValidator = [ 
  body('username').notEmpty(), 
  body('password').notEmpty(),
];
