const express = require("express");
const router = express.Router();
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");
const validateQuery = require("../middlewares/validateQuery");

router.post("/", createApplication);
router.get("/", validateQuery, getApplications); // Validate query parameters
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

module.exports = router;
