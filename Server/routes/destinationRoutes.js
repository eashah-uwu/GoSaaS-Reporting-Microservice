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
  addFileToDestination
} = require("../controllers/destinationController");

router.post("/", createDestination);
router.get("/", getAllDestinations);
router.post("/connect", connectStorageDestination);
router.post("/upload",upload.single('file'), addFileToDestination);
router.get("/get-dest/:id", getDestinationById);
router.get("/:id", getDestinationsByApplicationId);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);

module.exports = router;
