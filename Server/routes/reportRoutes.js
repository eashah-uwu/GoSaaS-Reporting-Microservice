const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  searchReports,
  getReportsByApplicationId,
  downloadXsl,
} = require("../controllers/reportController");
const { generateReport } = require("../config/generateReport");
const validateQuery = require("../middlewares/validateQuery");

router.post("/", upload.single("file"), createReport);
router.get("/", validateQuery, searchReports); // Validate query parameters using querySchema
router.get("/download/:id", downloadXsl);
router.get("/:id", getReportsByApplicationId);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);
router.post("/generateReport", generateReport);

module.exports = router;
