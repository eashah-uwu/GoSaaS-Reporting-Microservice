const Destination = require("../models/destinationModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const {
  createDestinationSchema,
  updateDestinationSchema,
} = require("../schemas/destinationSchemas");

// Create a new destination
const createDestination = async (req, res) => {
  const data = createDestinationSchema.parse(req.body);
  const destination = await Destination.create(data);
  logger.info("Destination created successfully", {
    context: { traceid: req.traceId, destination },
  });
  res.status(StatusCodes.CREATED).json({
    message: "Destination created successfully!",
    destination,
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
  const { id } = req.params;
  const data = updateDestinationSchema.parse(req.body);
  const destination = await Destination.update(id, data);
  if (!destination) {
    logger.warn("Destination not found for update", {
      context: { traceid: req.traceId, id },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  }
  logger.info("Destination updated successfully", {
    context: { traceid: req.traceId, id, destination },
  });
  res.status(StatusCodes.OK).json({
    message: "Destination updated successfully!",
    destination,
  });
};

// Delete a destination (soft delete)
const deleteDestination = async (req, res) => {
  const { id } = req.params;
  const destination = await Destination.delete(id);
  if (!destination) {
    logger.warn("Destination not found for deletion", {
      context: { traceid: req.traceId, id },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  }
  logger.info("Destination deleted successfully", {
    context: { traceid: req.traceId, id },
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
  const { id: applicationId } = req.params;

  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

    const [destinations, total] = await Promise.all([
      Destination.findByApplicationId({
        applicationId,
        query,
        offset,
        limit: parseInt(pageSize, 10),
        filters,
      }),
      Destination.countSearchResults(applicationId, query, filters),
    ]);
    logger.info("Retrieved Destinations by application ID", {
      context: { traceid: req.traceId, applicationId, destinations },
    });

    res.status(StatusCodes.OK).json({
      data: destinations,
      total,
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
};



module.exports = {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
  getDestinationsByApplicationId,
};
