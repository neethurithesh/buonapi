// routes/settings.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingsController');
const { body } = require('express-validator');

// GET /api/settings
router.get('/', controller.getSettings);

// PUT /api/settings  (use express-validator to validate some fields)
const validate = [
  body('company_name').optional().isString().withMessage('company_name must be string'),
  body('email').optional().isEmail().withMessage('email must be valid'),
  body('phone').optional().isString(),
  body('timezone').optional().isString(),
  body('currency').optional().isString(),
  body('base_fare').optional().isNumeric().withMessage('base_fare must be numeric'),
  body('per_km_rate').optional().isNumeric().withMessage('per_km_rate must be numeric'),
  body('smtp_port').optional().isInt().withMessage('smtp_port must be integer'),
  body('email_notifications').optional().isBoolean().withMessage('email_notifications must be boolean'),
  body('sms_notifications').optional().isBoolean().withMessage('sms_notifications must be boolean'),
  // add more validators if desired
  (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
  }
];

router.put('/', validate, controller.upsertSettings);

module.exports = router;
