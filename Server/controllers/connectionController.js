const Connection = require("../models/connectionModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const connectionSchema = require("../schemas/connectionSchemas");
const config = require("config");

// Create a new connection
const createConnection = async (req, res) => {
  const data = connectionSchema.parse(req.body);
  const connection = await Connection.create(data);
  logger.info("Connection created successfully", {
    context: { traceid: req.traceId, connection },
  });
  res.status(StatusCodes.CREATED).json({
    message: "Connection created successfully!",
    connection,
  });
};

// Get connections
const getConnections = async (req, res) => {
  const {
    query = config.get("query"),
    page = config.get("page"),
    pageSize = config.get("pageSize"),
    filters = {},
  } = req.query;

  // Include sortField and sortOrder in filters if they are present in the query
  if (req.query.sortField) filters.sortField = req.query.sortField;
  if (req.query.sortOrder) filters.sortOrder = req.query.sortOrder;

  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

  const [connections, total] = await Promise.all([
    Connection.find({
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Connection.countSearchResults(query, filters),
  ]);

  logger.info("Searched connections retrieved", {
    context: { traceid: req.traceId, connections },
  });
  res.status(StatusCodes.OK).json({
    data: connections,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

// Get connection by ID
const getConnectionById = async (req, res) => {
  const { id } = req.params;
  const connection = await Connection.findById(id);
  if (!connection) {
    logger.warn("Connection not found", {
      context: { traceid: req.traceId, id },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Connection not found" });
  }
  logger.info("Retrieved connection by ID", {
    context: { traceid: req.traceId, id, connection },
  });
  res.status(StatusCodes.OK).json(connection);
};

// Update a connection
const updateConnection = async (req, res) => {
  const { id } = req.params;
  const data = connectionSchema.partial().parse(req.body);
  const connection = await Connection.update(id, data);
  if (!connection) {
    logger.warn("Connection not found for update", {
      context: { traceid: req.traceId, id },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Connection not found" });
  }
  logger.info("Connection updated successfully", {
    context: { traceid: req.traceId, id, connection },
  });
  res.status(StatusCodes.OK).json({
    message: "Connection updated successfully!",
    connection,
  });
};

// Delete a connection (soft delete)
const deleteConnection = async (req, res) => {
  const { id } = req.params;
  const connection = await Connection.delete(id);
  if (!connection) {
    logger.warn("Connection not found for deletion", {
      context: { traceid: req.traceId, id },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Connection not found" });
  }
  logger.info("Connection deleted successfully", {
    context: { traceid: req.traceId, id },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Connection deleted successfully!" });
};
const getConnectionsByApplicationId = async (req, res) => {
  const { id: applicationId } = req.params;
  const connections = await Connection.findByApplicationId(applicationId);
  if (!connections || connections.length === 0) {
    logger.warn("Connections not found", {
      context: { traceid: req.traceId, applicationId },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Connections not found" });
  }
  logger.info("Retrieved connections by application ID", {
    context: { traceid: req.traceId, applicationId, connections },
  });
  res.status(StatusCodes.OK).json(connections);
};

module.exports = {
  createConnection,
  getConnectionById,
  updateConnection,
  deleteConnection,
  getConnections,
  getConnectionsByApplicationId,
};
