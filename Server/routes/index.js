const express = require('express');
const router = express.Router();
const indexController = require('../Controllers/indexController');

// Define route
router.get('/', indexController.getIndex);

module.exports = router;
