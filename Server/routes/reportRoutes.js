const express = require("express");
const {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  paginateReports,
  searchReports,
} = require("../controllers/reportController");

const router = express.Router();

router.post("/", createReport);
router.get("/", getAllReports);
router.get("/:id", getReportById);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);
router.get("/paginate", paginateReports);
router.get("/search", searchReports);

module.exports = router;
