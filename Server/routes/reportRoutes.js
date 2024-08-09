const express = require("express");
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
<<<<<<< Updated upstream
  paginateReports,
  searchReports,
=======
>>>>>>> Stashed changes
} = require("../controllers/reportController");
const validateQuery = require("../middlewares/validateQuery");

router.post("/", createReport);
<<<<<<< Updated upstream
router.get("/", getAllReports);
=======
router.get("/", validateQuery, getReports); // Validate query parameters using querySchema
>>>>>>> Stashed changes
router.get("/:id", getReportById);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

module.exports = router;
