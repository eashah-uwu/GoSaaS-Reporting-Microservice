const express = require("express");
const router = express.Router();
const {
  createConnection,
  getConnectionById,
  updateConnection,
  deleteConnection,
  getConnections,
} = require("../controllers/connectionController");
const validateQuery = require("../middlewares/validateQuery");

// Define routes
router.post("/", createConnection);
router.get("/", validateQuery, getConnections); // Validate query parameters
router.get("/:id", getConnectionById);
router.put("/:id", updateConnection);
router.delete("/:id", deleteConnection);

module.exports = router;
