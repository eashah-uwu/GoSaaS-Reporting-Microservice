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

// Route to bulk update audit trails
router.post("/bulk-update", AuditController.bulkUpdate);

// Route to bulk delete audit trails
router.post("/bulk-delete", AuditController.bulkDelete);

// Route to bulk update status of audit trails
router.post("/bulk-status-update", AuditController.bulkStatusUpdate);


module.exports = router;
