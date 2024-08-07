const express = require("express");
const router = express.Router();
const {
  createConnection,
  getConnectionById,
  updateConnection,
  deleteConnection,
  getConnections,
  getConnectionsByApplicationId,
} = require("../controllers/connectionController");
const validateQuery = require("../middlewares/validateQuery");

// Define routes
router.post("/", createConnection);
router.get("/", validateQuery, getConnections); // Validate query parameters
// router.get("/:id", getConnectionById);
router.put("/:id", updateConnection);
router.delete("/:id", deleteConnection);
router.get("/:id", getConnectionsByApplicationId);

module.exports = router;
