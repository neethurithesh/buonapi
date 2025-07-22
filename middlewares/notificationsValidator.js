const { body } = require('express-validator');
exports.notificationsValidator = [
  body('message').notEmpty()
];