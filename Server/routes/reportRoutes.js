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
  reportGeneration,
  
} = require("../controllers/reportController");
const validateQuery = require("../middlewares/validateQuery");
const verifyToken = require("../middlewares/auth");

router.post("/", verifyToken, upload.single("file"), createReport);
router.get("/", validateQuery, searchReports); // Validate query parameters using querySchema
router.get("/download/:reportid",verifyToken,downloadXsl)
router.get("/history",verifyToken, getReports);
router.get("/:applicationid",verifyToken, getReportsByApplicationId);
router.put("/:applicationid",verifyToken, updateReport);
router.delete("/:reportid",verifyToken, deleteReport);
router.post("/generateReport", reportGeneration);



module.exports = router;