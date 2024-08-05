const express = require("express");
const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  paginateReports,
  searchReports
} = require("../controllers/reportController");

const router = express.Router();

router.post("/reports", createReport);
router.get("/reports", getAllReports);
router.get("/reports/:id", getReportById);
router.put("/reports/:id", updateReport);
router.delete("/reports/:id", deleteReport);
router.get("/reports/paginate", paginateReports);
router.get("/reports/search", searchReports);

module.exports = router;
