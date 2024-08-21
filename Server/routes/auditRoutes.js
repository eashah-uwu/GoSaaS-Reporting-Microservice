const express = require("express");
const router = express.Router();
const AuditController = require("../controllers/auditController");

// Route to create a new audit trail
router.post("/", AuditController.createAuditTrail);

// Route to get all audit trails
router.get("/", AuditController.getAuditTrails);

module.exports = router;
