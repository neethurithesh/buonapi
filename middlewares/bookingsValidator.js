const { body } = require('express-validator');
exports.bookingsValidator = [
  body('user_id').isInt(),
  body('pickup_location').notEmpty(),
  body('dropoff_location').notEmpty()
];