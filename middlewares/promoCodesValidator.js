const { body } = require('express-validator');
exports.promoCodesValidator = [
  body('code').notEmpty(),
  body('discount_percentage').isInt()
];