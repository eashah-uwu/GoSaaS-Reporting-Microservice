const express = require("express");
const router = express.Router();
const checkDatabaseConnection = require("../controllers/indexController");

router.get("/", checkDatabaseConnection);

module.exports = router;
