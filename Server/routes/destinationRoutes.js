const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {
  createDestination,
  getAllDestinations,
  getDestinationsByApplicationId,
  getDestinationById,
  updateDestination,
  deleteDestination,
  connectStorageDestination,
  addFileToDestination,
  deleteMultipleDestinations
} = require("../controllers/destinationController");
const verifyToken=require("../middlewares/auth")

router.post("/",verifyToken, createDestination);
router.get("/", getAllDestinations);
router.post("/connect",verifyToken, connectStorageDestination);
router.post("/upload",verifyToken,upload.single('file'), addFileToDestination);
router.get("/get-dest/:id",verifyToken, getDestinationById);
router.get("/:applicationid",verifyToken, getDestinationsByApplicationId);
router.put("/:destinationid",verifyToken, updateDestination);
router.delete("/delete",verifyToken, deleteMultipleDestinations); 
router.delete("/:destinationid",verifyToken, deleteDestination);

module.exports = router;
