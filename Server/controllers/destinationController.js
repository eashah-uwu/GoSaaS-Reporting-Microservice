const Destination = require("../models/destinationModel");
const { StatusCodes } = require("http-status-codes");
const { connectToDestination, uploadFile } = require('../storage/cloudStorageService.js');
const config = require("config");
const logger = require("../logger");
const Application = require("../models/applicationModel");
const {
  createDestinationSchema,
  updateDestinationSchema,
} = require("../schemas/destinationSchemas");

const createDestination = async (req, res) => {
  const userid = req.user.userid;
  const { destination, alias, url, apiKey, applicationId } = req.body;
  const application = await Application.findById(applicationId);

  if (!application || application.userid != userid) {
    logger.warn("Application not found", { context: { traceid: req.traceId } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }

  const existingDestination = await Destination.findByName(alias);
  if (existingDestination) {
    logger.warn("Alias name must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Alias name must be unique",
    });
  }

  await connectToDestination(destination, url, apiKey);
  const newDestination = await Destination.create(alias, url, apiKey, applicationId, userid);
  logger.info("Destination created successfully", {
    context: { traceid: req.traceId, destination },
  });
  res.status(StatusCodes.OK).json({
    message: "Destination created successfully!",
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
    const application = await Application.findById(existingDestination.applicationid);
    if (!application || application.userid != userid) {
      logger.warn("Application not found for Destination", { context: { traceid: req.traceId } });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
  }

  const otherDestination = await Destination.findByName(req.body.alias);
  if (otherDestination && otherDestination.destinationid != destinationid) {
    logger.warn("Destination alias must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Destination alias must be unique",
    });
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
    const application = await Application.findById(existingDestination.applicationid);
    if (!application || application.userid != userid) {
      logger.warn("Application not found for Destination", { context: { traceid: req.traceId } });
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
// Get destinations by application ID
const getDestinationsByApplicationId = async (req, res) => {
  const {
    query = "",
    page = 1,
    pageSize = 10,
    filters = {},
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
  const { destination, url, apiKey, alias } = req.body;
  const result = await connectToDestination(destination, url, apiKey);
  logger.info("Destination connected successfully", {
    context: { traceid: req.traceId, result },
  });
  res.status(200).json({ message: result.message });
}

const addFileToDestination = async (req, res) => {
  const { destination, url, apiKey, alias, bucketName } = req.body;
  const file = req.file;

  const result = await uploadFile(destination, url, apiKey, file, bucketName);
  if (result.success) {
    res.status(200).json({ message: result.message, url: result.url });
  } else {
    res.status(500).json({ error: result.message });
  }
}

module.exports = {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
  getDestinationsByApplicationId,
  connectStorageDestination,
  addFileToDestination
};
