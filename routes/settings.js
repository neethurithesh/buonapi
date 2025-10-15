// routes/settings.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingsController');
const { createValidator, updateValidator } = require('../middlewares/settingsValidator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

router.get('/', controller.getAll);
router.post('/', createValidator, validate, controller.create);
router.put('/:id', updateValidator, validate, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
