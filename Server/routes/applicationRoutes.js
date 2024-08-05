const express = require("express");
const router = express.Router();
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getFilteredApplications
} = require("../controllers/applicationController");

router.post("/", createApplication);
router.get("/", getApplications); //get applications
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);


module.exports = router;
