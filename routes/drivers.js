const express = require('express');
const router = express.Router();
const controller = require('../controllers/driversController');
const { driversValidator } = require('../middlewares/driversValidator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', controller.getAll);
router.post('/', driversValidator, validate, controller.create);
router.put('/:id', driversValidator, validate, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;