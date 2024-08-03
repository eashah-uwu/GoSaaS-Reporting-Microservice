const express = require("express");
const router = express.Router();
const {
  createConnection,
  getAllConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
} = require("../controllers/connectionController");

router.post("/connections", createConnection);
router.get("/connections", getAllConnections);
router.get("/connections/:id", getConnectionById);
router.put("/connections/:id", updateConnection);
router.delete("/connections/:id", deleteConnection);

module.exports = router;
