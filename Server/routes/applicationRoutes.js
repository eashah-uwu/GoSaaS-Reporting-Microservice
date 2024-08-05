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
router.get("/", getAllApplications); //get applications
router.get("/filter", getFilteredApplications); // /api/applications?pagenumber=1&pagesize=10&query=abc
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);


module.exports = router;
