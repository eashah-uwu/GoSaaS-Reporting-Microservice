const express = require("express");
const router = express.Router();
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getFilteredApplications
} = require("../controllers/applicationController");

router.post("/", createApplication);
router.get("/", getAllApplications);
router.get("/filter", getFilteredApplications);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);


module.exports = router;
