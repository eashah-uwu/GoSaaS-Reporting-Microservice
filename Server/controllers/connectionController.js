const Connection = require("../models/connectionModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const connectionSchema = require("../schemas/connectionSchemas");
const config = require("config");
const ConnectionFactory = require("../config/db/connectionFactory");
const Application = require("../models/applicationModel");
const Report = require("../models/reportModel")

// Create a new connection
const createConnection = async (req, res) => {
  // Destructure and transform the request body
  const { applicationId, ...restData } = req.body;
  const userid = req.user.userid;
  const application = await Application.findById(applicationId);

  if (!application || application.userid != userid) {
    logger.warn("Application not found", { context: { traceid: req.traceId } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }
  // Convert port and IDs to integers
  const data = {
    ...restData,
    port: parseInt(restData.port, 10),
    applicationid: parseInt(applicationId, 10),
    createdby: parseInt(userid, 10),
    updatedby: parseInt(userid, 10),
  };

  // Validate and parse the transformed data with connectionSchema
  const validatedData = connectionSchema.parse(data);

  const {
    username,
    alias,
    host,
    port,
    database,
    type,
    password,
    applicationid,
    createdby,
    updatedby,
    schema,
  } = data;


  const existingConnection = await Connection.findByName(alias, applicationid);
  if (existingConnection) {
    logger.warn("Alias name must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Alias name must be unique",
    });
  }
  // Check if a connection with the same details already exists for the same application and userid
  const duplicateConnection = await Connection.findDuplicate({
    username,
    host,
    port,
    database,
    schema,
    password,
    applicationid,
    userid,
  });

  if (duplicateConnection) {
    logger.warn("A connection with the same details already exists", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "A connection with the same details already exists",
    });
  }
  const { type: type_t, ...config } = req.body;
  const testconnection = ConnectionFactory.createConnection(type_t, config);
  const result = await testconnection.testConnection();

  // Call the model method to create a new connection
  const connection = await Connection.create(
    username,
    alias,
    host,
    port,
    database,
    schema,
    type,
    password,
    applicationid,
    createdby,
    updatedby
  );

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
  const connection = ConnectionFactory.createConnection(type, config);
  const result = await connection.testConnection();
  logger.info("Connection test successful", {
    context: { traceid: req.traceId, type, config, result },
  });
  res.status(StatusCodes.OK).json(result);
};

const getStoredProcedures = async (req, res) => {
  const { id } = req.body;
  const connection_db = await Connection.findById(id);

  const connectedConnection = ConnectionFactory.createConnection(
    connection_db.type,
    { ...connection_db }
  );
  const storedProcedures = await connectedConnection.getStoredProceduresData();
  logger.info("Stored Procedures Retreived", {
    context: { traceid: req.traceId, storedProcedures },
  });
  res.status(StatusCodes.OK).json({
    success: true,
    data: storedProcedures,
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
  const { connectionid } = req.params;
  const userid = req.user.userid;
  const connection = await Connection.findById(connectionid);
  const application = await Application.findById(connection.applicationid);
  if (!connection && application.userid != userid) {
    logger.warn("Connection not found", {
      context: { traceid: req.traceId, connectionid },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Connection not found" });
  }
  logger.info("Retrieved connection by ID", {
    context: { traceid: req.traceId, connectionid, connection },
  });
  res.status(StatusCodes.OK).json(connection);
};

// Update a connection
const updateConnection = async (req, res) => {
  const { connectionid } = req.params;
  const userid = req.user.userid;
  // Parse the ID to an integer
  const parsedId = parseInt(connectionid, 10);

  const data = req.body;
  const { alias = "" } = req.body;
  const existingConnection = await Connection.findById(parsedId);

  if (!existingConnection) {
    logger.warn("Connection not found to update", {
      context: { traceid: req.traceId },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Connection not found" });
  } else {
    const application = await Application.findById(
      existingConnection.applicationid
    );
    if (!application || application.userid != userid) {
      logger.warn("Application not found for connection", {
        context: { traceid: req.traceId },
      });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
  }

  if (alias !== "") {
    const otherConnection = await Connection.findByName(alias, existingConnection.applicationid);
    if (otherConnection && otherConnection.connectionid !== parsedId) {
      logger.warn("Connection alias must be unique", {
        context: { traceid: req.traceId },
      });
      return res.status(StatusCodes.CONFLICT).json({
        message: "Connection alias must be unique",
      });
    }
    const { type: type_t, ...config } = req.body;
    const testconnection = ConnectionFactory.createConnection(type_t, config);
    const result = await testconnection.testConnection();
  }

  // Check for duplicate connection details
  const duplicateConnection = await Connection.findDuplicateUpdate({
    username: data.username || existingConnection.username,
    host: data.host || existingConnection.host,
    port: data.port || existingConnection.port,
    database: data.database || existingConnection.database,
    schema: data.schema || existingConnection.schema,
    password: data.password || existingConnection.password, // Assuming it's encrypted
    applicationid: existingConnection.applicationid,
    userid,
    excludeId: parsedId, // Exclude the current connection from the duplicate check
  });

  if (duplicateConnection) {
    logger.warn("Duplicate connection details found", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Duplicate connection details found",
    });
  }



  if (data.isactive === false) {
    await Report.connnectionsReportStatusDisable(data.connectionid)
  }

  const updatedConnection = await Connection.update(parsedId, data);
  logger.info("Connection updated successfully", {
    context: { traceid: req.traceId, connection: updatedConnection },
  });
  return res.status(StatusCodes.OK).json({
    message: "Connection updated successfully",
    connection: updatedConnection,
  });
};

// Delete a connection (soft delete)
const deleteConnection = async (req, res) => {
  const { connectionid } = req.params;
  const userid = req.user.userid;

  const existingConnection = await Connection.findById(connectionid);
  if (!existingConnection) {
    logger.warn("Connection not found for deletion", {
      context: { traceid: req.traceId, connectionid },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Connection not found" });
  } else {
    const application = await Application.findById(
      existingConnection.applicationid
    );
    if (!application || application.userid != userid) {
      logger.warn("Application not found for connection", {
        context: { traceid: req.traceId },
      });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
  }
  const connection = await Connection.delete(connectionid);
  logger.info("Connection deleted successfully", {
    context: { traceid: req.traceId, connectionid },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Connection deleted successfully!" });
};

const updateMultipleStatus = async (req, res) => {
  const userid = req.user.userid;
  const { ids, status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid status!" });
  }

  const existingConnections = await Connection.findByIds(ids);
  if (existingConnections.length !== ids.length) {
    logger.warn("Some Connections not found for Status Update", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Some Connections not found for Status Update!",
    });
  }

  const applicationIds = existingConnections.map((conn) => conn.applicationid);
  const applications = await Application.findByIds(applicationIds);
  const unauthorized = applications.some((app) => app.userid !== userid);

  if (unauthorized) {
    logger.warn("Unauthorized Update attempt", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Unauthorized Update attempt!",
    });
  }

  if (status === "inactive") {
    await Report.connnectionsReportBatchStatusDisable(ids)
  }
  await Connection.batchChangeStatus(ids, status);
  logger.info("Connections status changed successfully", {
    context: { traceid: req.traceId },
  });
  res.status(StatusCodes.OK).json({ message: "Connections status changed successfully!" });
}


const getConnectionsByApplicationId = async (req, res) => {
  const {
    query = config.get("query"),
    page = config.get("page"),
    pageSize = config.get("pageSize"),
    filters = config.get("filters"),
  } = req.query;
  const { applicationid } = req.params;
  const userid = req.user.userid;
  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

  const application = await Application.findById(applicationid);
  if (!application || application.userid != userid) {
    logger.warn("Application not found", { context: { traceid: req.traceId } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }

  const [connections, total] = await Promise.all([
    Connection.findByApplicationId({
      applicationid,
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Connection.countSearchResults(applicationid, query, filters),
  ]);
  logger.info("Retrieved connections by application ID", {
    context: { traceid: req.traceId, applicationid, connections },
  });

  res.status(StatusCodes.OK).json({
    data: connections,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

const deleteMultipleConnections = async (req, res) => {
  const userid = req.user.userid;
  const { ids } = req.body;

  const existingConnections = await Connection.findByIds(ids);
  if (existingConnections.length !== ids.length) {
    logger.warn("Some Connections not found for deletion", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Some Connections not found for deletion!",
    });
  }

  const applicationIds = existingConnections.map((conn) => conn.applicationid);
  const applications = await Application.findByIds(applicationIds);
  const unauthorized = applications.some((app) => app.userid !== userid);

  if (unauthorized) {
    logger.warn("Unauthorized deletion attempt", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Unauthorized deletion attempt!",
    });
  }

  await Connection.deleteMultiple(ids);
  logger.info("Connections deleted successfully", {
    context: { traceid: req.traceId },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Connections deleted successfully!" });
};

module.exports = {
  createConnection,
  getConnectionById,
  updateConnection,
  deleteConnection,
  getConnections,
  getConnectionsByApplicationId,
  testConnection,
  getStoredProcedures,
  deleteMultipleConnections,
  updateMultipleStatus
};
