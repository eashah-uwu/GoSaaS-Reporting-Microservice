const express = require("express");
const router = express.Router();
const {
  createConnection,
  getConnectionById,
  testConnection,
  updateConnection,
  deleteConnection,
  getConnections,
  getConnectionsByApplicationId,
  getStoredProcedures
} = require("../controllers/connectionController");
const validateQuery = require("../middlewares/validateQuery");
const verifyToken=require("../middlewares/auth")
// Define routes
router.post("/",verifyToken, createConnection);
router.get("/", validateQuery, getConnections);
router.post("/test-connection",verifyToken, testConnection);
router.post("/get-stored-procedures",verifyToken,getStoredProcedures);
router.get("/get-con/:connectionid",verifyToken, getConnectionById);
router.put("/:connectionid",verifyToken, updateConnection);
router.delete("/:connectionid",verifyToken, deleteConnection);
router.get("/:applicationid",verifyToken,validateQuery, getConnectionsByApplicationId);

module.exports = router;
