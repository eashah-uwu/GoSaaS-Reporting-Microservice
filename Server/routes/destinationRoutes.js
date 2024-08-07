const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  getDestinationsByApplicationId,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");

router.post("/", createDestination);
router.get("/", getAllDestinations);
router.get("/:id", getDestinationsByApplicationId);
router.put("/:id", updateDestination);
router.delete("/:id", deleteDestination);

module.exports = router;
