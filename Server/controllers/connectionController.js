const Connection = require("../models/connectionModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const connectionSchema = require("../schemas/connectionSchemas");
const config = require("config");
const ConnectionFactory = require("../config/db/connectionFactory");

// Create a new connection
const createConnection = async (req, res) => {
  // Destructure and transform the request body
  const { applicationId, userId, ...restData } = req.body;

  // Convert port and IDs to integers
  const data = {
    ...restData,
    port: parseInt(restData.port, 10),
    applicationid: parseInt(applicationId, 10),
    createdby: parseInt(userId, 10),
    updatedby: parseInt(userId, 10),
  };

  // Validate and parse the transformed data with connectionSchema
  const validatedData = connectionSchema.parse(data);

  // Call the model method to create a new connection
  const connection = await Connection.create(validatedData);

  // Log the successful creation
  logger.info("Connection created successfully", {
    context: { traceid: req.traceId, connection },
  });

  // Send a response with the created connection
  res.status(StatusCodes.CREATED).json({
    message: "Connection created successfully!",
    connection,
  });
};

//test connection
const testConnection = async (req, res) => {
  const { type, ...config } = req.body;
  try {
    const connection = ConnectionFactory.createConnection(type, config);
    const result = await connection.testConnection();
    logger.info("Connection test successful", {
      context: { traceid: req.traceId, type, config, result },
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error("Error testing connection", {
      context: { traceid: req.traceId, type, config, error: error.message },
    });

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while testing the connection",
      error: error.message,
    });
  }
};

const getStoredProcedures = async (req, res) => {
  const { id } = req.body;
  //const connection = await Connection.findById(id);
  const connection = {
    username: "root",
    password: "12345678",
    database: "rms_db",
    type: "PostgreSQL",
    host: "localhost",
    port: "5432",
    alias: "testt",
  }
  const { port } = connection;
  const connectedConnection = ConnectionFactory.createConnection(connection.type, {...connection});
  const storedProcedures = await connectedConnection.getStoredProceduresData();
  console.log("storedproc",storedProcedures)
  logger.info("Stored Procedures Retreived", {
    context: { traceid: req.traceId, storedProcedures },
  });
  res.status(StatusCodes.OK).json({
    success: true,
    data: storedProcedures
  });

}



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
    // Connection.countSearchResults(query, filters),
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
  const {
    query = config.get("query"),
    page = config.get("page"),
    pageSize = config.get("pageSize"),
    filters = config.get("filters"),
  } = req.query;
  const { id: applicationId } = req.params;

  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

  const [connections, total] = await Promise.all([
    Connection.findByApplicationId({
      applicationId,
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Connection.countSearchResults(applicationId, query, filters),
  ]);
  logger.info("Retrieved connections by application ID", {
    context: { traceid: req.traceId, applicationId, connections },
  });

  res.status(StatusCodes.OK).json({
    data: connections,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

module.exports = {
  createConnection,
  getConnectionById,
  updateConnection,
  deleteConnection,
  getConnections,
  getConnectionsByApplicationId,
  testConnection,
  getStoredProcedures
};
