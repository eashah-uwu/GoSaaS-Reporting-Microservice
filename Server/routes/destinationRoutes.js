const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");

router.post("/", createDestination);
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);

module.exports = router;
