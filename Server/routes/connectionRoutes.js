const express = require("express");
const router = express.Router();
const {
  createConnection,
  getAllConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
} = require("../controllers/connectionController");

router.post("/", createConnection);
router.get("/", getAllConnections);
router.get("/:id", getConnectionById);
router.put("/:id", updateConnection);
router.delete("/:id", deleteConnection);

module.exports = router;
