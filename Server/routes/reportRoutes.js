const express = require("express");
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  searchReports,
} = require("../controllers/reportController");
const validateQuery = require("../middlewares/validateQuery");

router.post("/", createReport);
router.get("/", validateQuery, searchReports); // Validate query parameters using querySchema
router.get("/:id", getReportById);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

module.exports = router;
