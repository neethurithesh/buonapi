const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationsController');
const { notificationsValidator } = require('../middlewares/notificationsValidator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', controller.getAll);
router.post('/', notificationsValidator, validate, controller.create);
router.put('/:id', notificationsValidator, validate, controller.update);
router.delete('/:id', controller.remove);

module.exports = router;