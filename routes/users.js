const express = require('express');
const router = express.Router();
const controller = require('../controllers/usersController');
const { usersValidator } = require('../middlewares/usersValidator');
const { userLoginValidator } = require('../middlewares/usersValidator');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/', controller.getAll);
router.post('/', usersValidator, validate, controller.create);
router.put('/:id', usersValidator, validate, controller.update);
router.delete('/:id', controller.remove);
router.get('/:id/profile-image', controller.getProfileImage);
router.post('/change-password', controller.changePassword);
router.post('/login', userLoginValidator, validate, controller.login);

module.exports = router;