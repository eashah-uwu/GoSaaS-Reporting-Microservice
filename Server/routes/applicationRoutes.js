const express = require("express");
const router = express.Router();
const { createApplication } = require("../Controllers/applicationController");

router.post("/applications", createApplication);

module.exports = router;
