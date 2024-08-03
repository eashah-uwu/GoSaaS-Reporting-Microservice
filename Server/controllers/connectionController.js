const Connection = require("../models/connectionModel");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const connectionSchema = require("../schemas/connectionSchemas");

// Create a new connection
const createConnection = asyncHandler(async (req, res) => {
  try {
    const data = connectionSchema.parse(req.body);
    const connection = await Connection.create(data);
    logger.info("Connection created successfully", { connection });
    res.status(StatusCodes.CREATED).json({
      message: "Connection created successfully!",
      connection,
    });
  } catch (error) {
    logger.error("Error creating connection", { error });
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Error creating connection",
      error: error.errors || error.message,
    });
  }
});

// Get all connections
const getAllConnections = asyncHandler(async (req, res) => {
  try {
    const connections = await Connection.findAll();
    logger.info("Retrieved all connections", { connections });
    res.status(StatusCodes.OK).json(connections);
  } catch (error) {
    logger.error("Error retrieving connections", { error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!" });
  }
});

// Get connection by ID
const getConnectionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await Connection.findById(id);
    if (!connection) {
      logger.warn("Connection not found", { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Connection not found" });
    }
    logger.info("Retrieved connection by ID", { id, connection });
    res.status(StatusCodes.OK).json(connection);
  } catch (error) {
    logger.error("Error retrieving connection by ID", { error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!" });
  }
});

// Update a connection
const updateConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const data = connectionSchema.partial().parse(req.body);
    const connection = await Connection.update(id, data);
    if (!connection) {
      logger.warn("Connection not found for update", { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Connection not found" });
    }
    logger.info("Connection updated successfully", { id, connection });
    res.status(StatusCodes.OK).json({
      message: "Connection updated successfully!",
      connection,
    });
  } catch (error) {
    logger.error("Error updating connection", { error });
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Error updating connection",
      error: error.errors || error.message,
    });
  }
});

// Delete a connection (soft delete)
const deleteConnection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await Connection.delete(id);
    if (!connection) {
      logger.warn("Connection not found for deletion", { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Connection not found" });
    }
    logger.info("Connection deleted successfully", { id });
    res.status(StatusCodes.OK).json({ message: "Connection deleted successfully!" });
  } catch (error) {
    logger.error("Error deleting connection", { error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!" });
  }
});

module.exports = {
  createConnection,
  getAllConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
};
