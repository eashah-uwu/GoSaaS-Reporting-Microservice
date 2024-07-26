const express = require('express');
const router = express.Router();
const checkDatabaseConnection = require('../Controllers/indexController');

router.get('/', checkDatabaseConnection);

module.exports = router;
