const { body } = require('express-validator');
exports.vehicleTypesValidator = [
  body('name').notEmpty()
];