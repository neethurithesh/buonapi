const express = require('express');
const router = express.Router();
const controller = require('../controllers/promoCodesController');
const { promoCodesValidator } = require('../middlewares/promoCodesValidator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', controller.getAll);
router.post('/', promoCodesValidator, validate, controller.create);
router.put('/:id', promoCodesValidator, validate, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;