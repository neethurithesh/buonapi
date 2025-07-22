const { body } = require('express-validator');
exports.pricingOptionsValidator = [
  body('base_fare').isDecimal(),
  body('per_km_rate').isDecimal()
];