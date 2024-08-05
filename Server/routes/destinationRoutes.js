const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");

router.post("/destinations", createDestination);
router.get("/destinations", getAllDestinations);
router.get("/destinations/:id", getDestinationById);
router.put("/destinations/:id", updateDestination);
router.delete("/destinations/:id", deleteDestination);

module.exports = router;
