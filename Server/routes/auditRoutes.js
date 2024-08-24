const express = require("express");
const router = express.Router();
const AuditController = require("../controllers/auditController");

// Route to create a new audit trail
router.post("/", AuditController.createAuditTrail);

// Route to get all audit trails
router.get("/", AuditController.getAuditTrails);

// Route to get unique modules
router.get("/modules", AuditController.getUniqueModules);

// Route to get unique events
router.get("/events", AuditController.getUniqueEvents);

// Route to get unique users
router.get("/users", AuditController.getUniqueUsers);

module.exports = router;
