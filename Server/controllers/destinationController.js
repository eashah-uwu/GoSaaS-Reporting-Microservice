const Destination = require("../models/destinationModel");
const { StatusCodes } = require("http-status-codes");
const {
  connectToDestination,
  uploadFile,
} = require("../storage/cloudStorageService.js");
const config = require("config");
const logger = require("../logger");
const Application = require("../models/applicationModel");
const Report = require("../models/reportModel.js");
const {
  createDestinationSchema,
  updateDestinationSchema,
} = require("../schemas/destinationSchemas");

const createDestination = async (req, res) => {
  const userid = req.user.userid;
  const data = createDestinationSchema.parse(req.body);

  const { destination, alias, url, apiKey, applicationId, bucketname } =
    req.body;
  const application = await Application.findById(applicationId);

  if (!application || application.userid != userid) {
    logger.warn("Application not found", { context: { traceid: req.traceId } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }

  const existingDestination = await Destination.findByName(
    alias,
    applicationId
  );
  if (existingDestination) {
    logger.warn("Alias name must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Alias name must be unique",
    });
  }
  const duplicateDestinations = await Destination.findDuplicate(
    url,
    apiKey,
    bucketname,
    applicationId,
    userid,
    destination
  );

  if (duplicateDestinations[0]) {
    logger.warn("A connection with the same details already exists", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "A connection with the same details already exists",
    });
  }

  await connectToDestination(destination, url, apiKey, bucketname);
  const newDestination = await Destination.create(
    alias,
    destination,
    url,
    apiKey,
    bucketname,
    applicationId,
    userid
  );
  logger.info("Destination created successfully", {
    context: { traceid: req.traceId, destination },
  });
  res.status(StatusCodes.OK).json({
    message: "Destination created successfully! ",
    destination: newDestination,
  });
};

// Get all destinations
const getAllDestinations = async (req, res) => {
  const destinations = await Destination.findAll();
  logger.info("Retrieved all destinations", {
    context: { traceid: req.traceId, destinations },
  });
  res.status(StatusCodes.OK).json(destinations);
};

// Get destination by ID
const getDestinationById = async (req, res) => {
  const { id } = req.params;
  const destination = await Destination.findById(id);
  if (!destination) {
    logger.warn("Destination not found", {
      context: { traceid: req.traceId, id },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  }
  logger.info("Retrieved destination by ID", {
    context: { traceid: req.traceId, id, destination },
  });
  res.status(StatusCodes.OK).json(destination);
};

// Update an existing destination
const updateDestination = async (req, res) => {
  const { destinationid } = req.params;
  const userid = req.user.userid;
  const data = updateDestinationSchema.parse(req.body);
  const existingDestination = await Destination.findById(destinationid);
  if (!existingDestination) {
    logger.warn("Destination not found to update", {
      context: { traceid: req.traceId },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  } else {
    const application = await Application.findById(
      existingDestination.applicationid
    );
    if (!application || application.userid != userid) {
      logger.warn("Application not found for Destination", {
        context: { traceid: req.traceId },
      });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
  }

  const otherDestination = await Destination.findByName(
    req.body.alias,
    existingDestination.applicationid
  );
  if (otherDestination && otherDestination.destinationid != destinationid) {
    logger.warn("Destination alias must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Destination alias must be unique",
    });
  }
  if (data.isactive === false) {
    await Report.destinationsReportStatusDisable(existingDestination.destinationid)
  }

  const destination = await Destination.update(destinationid, data);

  logger.info("Destination updated successfully", {
    context: { traceid: req.traceId, destinationid, destination },
  });
  res.status(StatusCodes.OK).json({
    message: "Destination updated successfully!",
    destination,
  });
};

// Delete a destination (soft delete)
const deleteDestination = async (req, res) => {
  const { destinationid } = req.params;
  const userid = req.user.userid;
  const existingDestination = await Destination.findById(destinationid);
  if (!existingDestination) {
    logger.warn("Destination not found for deletion", {
      context: { traceid: req.traceId, destinationid },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  } else {
    const application = await Application.findById(
      existingDestination.applicationid
    );
    if (!application || application.userid != userid) {
      logger.warn("Application not found for Destination", {
        context: { traceid: req.traceId },
      });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
  }
  const destination = await Destination.delete(destinationid);
  logger.info("Destination deleted successfully", {
    context: { traceid: req.traceId, destinationid },
  });
  res.status(StatusCodes.OK).json({
    message: "Destination deleted successfully!",
  });
};

const deleteMultipleDestinations = async (req, res) => {
  const userid = req.user.userid;
  const { ids } = req.body;

  const existingDestinations = await Destination.findByIds(ids);
  if (existingDestinations.length !== ids.length) {
    logger.warn("Some Destinations not found for deletion", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Some Destinations not found for deletion!",
    });
  }

  const applicationIds = existingDestinations.map((dest) => dest.applicationid);
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

  await Destination.deleteMultiple(ids);
  logger.info("Destinations deleted successfully", {
    context: { traceid: req.traceId },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Destinations deleted successfully!" });
};

const updateMultipleStatus = async (req, res) => {
  const userid = req.user.userid;
  const { ids, status } = req.body;
  if (!["active", "inactive"].includes(status)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid status!" });
  }

  const existingDestinations = await Destination.findByIds(ids);
  if (existingDestinations.length !== ids.length) {
    logger.warn("Some Destinations not found for Status Update", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Some Destinations not found for Status Update!",
    });
  }

  const applicationIds = existingDestinations.map((dest) => dest.applicationid);
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
    await Report.destinationsReportBatchStatusDisable(ids)
  }
  await Destination.batchChangeStatus(ids, status);
  logger.info("Destinations status changed successfully", {
    context: { traceid: req.traceId },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Destinations status changed successfully!" });
};

// Get destinations by application ID
const getDestinationsByApplicationId = async (req, res) => {
  const { query = "", page = 1, pageSize = 10, filters = {} } = req.query;
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

  const [destinations, total] = await Promise.all([
    Destination.findByApplicationId({
      applicationid,
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Destination.countSearchResults(applicationid, query, filters),
  ]);
  logger.info("Retrieved Destinations by application ID", {
    context: { traceid: req.traceId, applicationid, destinations },
  });

  res.status(StatusCodes.OK).json({
    data: destinations,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

const connectStorageDestination = async (req, res) => {
  const { destination, url, apiKey, alias, bucketname } = req.body;
  const result = await connectToDestination(
    destination,
    url,
    apiKey,
    bucketname
  );
  logger.info("Destination connected successfully", {
    context: { traceid: req.traceId, result },
  });
  res.status(200).json({ message: result.message });
};

const addFileToDestination = async (req, res) => {
  const { destination, url, apiKey, alias, bucketName } = req.body;
  const file = req.file;

  const result = await uploadFile(destination, url, apiKey, file, bucketName);
  if (result.success) {
    res.status(200).json({ message: result.message, url: result.url });
  } else {
    res.status(500).json({ error: result.message });
  }
};

module.exports = {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
  getDestinationsByApplicationId,
  connectStorageDestination,
  addFileToDestination,
  deleteMultipleDestinations,
  updateMultipleStatus,
};
