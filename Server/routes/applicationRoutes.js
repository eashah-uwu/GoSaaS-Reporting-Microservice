const express = require("express");
const router = express.Router();
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

router.post("/applications", createApplication);
router.get("/applications", getAllApplications);
router.get("/applications/:id", getApplicationById);
router.put("/applications/:id", updateApplication);
router.delete("/applications/:id", deleteApplication);


module.exports = router;