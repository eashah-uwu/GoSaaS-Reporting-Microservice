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
const verifyToken=require("../middlewares/auth")


router.post("/",verifyToken, createApplication);
router.get("/",verifyToken, validateQuery, getApplications); 
router.get("/:applicationid",verifyToken, getApplicationById);
router.put("/:applicationid",verifyToken, updateApplication);
router.delete("/:applicationid",verifyToken, deleteApplication);

module.exports = router;
