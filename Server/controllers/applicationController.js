const Application = require("../models/applicationModel");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const applicationSchema = require("../schemas/applicationSchema");

// Create an application
const createApplication = asyncHandler(async (req, res) => {
  try {
    const data = applicationSchema.parse(req.body);
    const application = await Application.create(data);
    logger.info("Application created successfully", { application });
    res.status(StatusCodes.CREATED).json({
      message: "Application created successfully!",
      application,
    });
  } catch (error) {
    logger.error("Error creating application", { error });
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.errors });
  }
});

// Get all applications
const getAllApplications = asyncHandler(async (req, res) => {
  const applications = await Application.findAll();
  logger.info("Retrieved all applications", { applications });
  res.status(StatusCodes.OK).json(applications);
});

// Get application by ID
const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    logger.warn("Application not found", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }
  logger.info("Retrieved application by ID", { id, application });
  res.status(StatusCodes.OK).json(application);
});

// Update an application
const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const data = applicationSchema.partial().parse(req.body);
    const application = await Application.update(id, data);
    if (!application) {
      logger.warn("Application not found for update", { id });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
    logger.info("Application updated successfully", { id, application });
    res.status(StatusCodes.OK).json({
      message: "Application updated successfully!",
      application,
    });
  } catch (error) {
    logger.error("Error updating application", { error });
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.errors });
  }
});

// Delete an application
const deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Application.delete(id);
  if (!application) {
    logger.warn("Application not found for deletion", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }
  logger.info("Application deleted successfully", { id });
  res.status(StatusCodes.OK).json({
    message: "Application deleted successfully!",
  });
});

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
