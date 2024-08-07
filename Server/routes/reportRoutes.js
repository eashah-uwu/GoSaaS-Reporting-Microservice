const express = require("express");
const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  paginateReports,
  getReportsByApplicationId,
  searchReports,
} = require("../controllers/reportController");

const router = express.Router();

router.post("/", createReport);
router.get("/", getAllReports);
router.get("/:id", getReportsByApplicationId);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);
router.get("/paginate", paginateReports);
router.get("/search", searchReports);

module.exports = router;
