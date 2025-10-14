const express = require('express');
const router = express.Router();
const cabController = require('../controllers/cabController');

router.post('/', cabController.getCabOptions);

module.exports = router;
