// routes/cab.js
const express = require('express');
const router = express.Router();
const cabController = require('../controllers/cabController');

router.post('/cab-options', cabController.getCabOptions);

module.exports = router;
