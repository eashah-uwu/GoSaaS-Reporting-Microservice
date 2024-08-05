const Destination = require("../models/destinationModel");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const {
  createDestinationSchema,
  updateDestinationSchema,
} = require("../schemas/destinationSchemas");

// Create a new destination
const createDestination = asyncHandler(async (req, res) => {
  const data = createDestinationSchema.parse(req.body);
  const destination = await Destination.create(data);
  logger.info("Destination created successfully", { destination });
  res.status(StatusCodes.CREATED).json({
    message: "Destination created successfully!",
    destination,
  });
});

// Get all destinations
const getAllDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.findAll();
  logger.info("Retrieved all destinations", { destinations });
  res.status(StatusCodes.OK).json(destinations);
});

// Get destination by ID
const getDestinationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const destination = await Destination.findById(id);
  if (!destination) {
    logger.warn("Destination not found", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  }
  logger.info("Retrieved destination by ID", { id, destination });
  res.status(StatusCodes.OK).json(destination);
});

// Update an existing destination
const updateDestination = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = updateDestinationSchema.parse(req.body);

  const destination = await Destination.update(id, data);
  if (!destination) {
    logger.warn("Destination not found for update", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  }
  logger.info("Destination updated successfully", { id, destination });
  res.status(StatusCodes.OK).json({
    message: "Destination updated successfully!",
    destination,
  });
});

// Delete a destination (soft delete)
const deleteDestination = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const destination = await Destination.delete(id);
  if (!destination) {
    logger.warn("Destination not found for deletion", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Destination not found" });
  }
  logger.info("Destination deleted successfully", { id });
  res.status(StatusCodes.OK).json({
    message: "Destination deleted successfully!",
  });
});

module.exports = {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
};
