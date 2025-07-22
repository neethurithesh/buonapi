const { body } = require('express-validator');
exports.bannerImagesValidator = [
  body('image_url').isURL(),
  body('title').notEmpty()
];