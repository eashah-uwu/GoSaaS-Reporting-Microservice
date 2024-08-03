const Application = require("../models/applicationModel");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const applicationSchema = require("../schemas/applicationSchemas");

// Create a new application
const createApplication = asyncHandler(async (req, res) => {
  try {
    // Validate and parse the request body
    if (typeof applicationSchema.parse !== 'function') {
      throw new Error("applicationSchema.parse is not a function");
    }
    const data = applicationSchema.parse(req.body);
    
    // Create the application in the database
    const application = await Application.create(data);
    
    // Log success and send response
    logger.info("Application created successfully", { application });
    res.status(StatusCodes.CREATED).json({
      message: "Application created successfully!",
      application,
    });
  } catch (error) {
    // Log error and send bad request response
    logger.error("Error creating application", { error });
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Error creating application",
      error: error.errors || error.message,
    });
  }
});

// Get all applications
const getAllApplications = asyncHandler(async (req, res) => {
  try {
    const applications = await Application.findAll();
    logger.info("Retrieved all applications", { applications });
    res.status(StatusCodes.OK).json(applications);
  } catch (error) {
    logger.error("Error retrieving applications", { error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!" });
  }
});

// Get application by ID
const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const application = await Application.findById(id);
    if (!application) {
      logger.warn("Application not found", { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Application not found" });
    }
    logger.info("Retrieved application by ID", { id, application });
    res.status(StatusCodes.OK).json(application);
  } catch (error) {
    logger.error("Error retrieving application by ID", { error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!" });
  }
});

// Update an application
const updateApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    // Validate and parse the request body
    if (typeof applicationSchema.partial().parse !== 'function') {
      throw new Error("applicationSchema.partial().parse is not a function");
    }
    const data = applicationSchema.partial().parse(req.body);
    
    // Update the application in the database
    const application = await Application.update(id, data);
    if (!application) {
      logger.warn("Application not found for update", { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Application not found" });
    }
    logger.info("Application updated successfully", { id, application });
    res.status(StatusCodes.OK).json({
      message: "Application updated successfully!",
      application,
    });
  } catch (error) {
    logger.error("Error updating application", { error });
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Error updating application",
      error: error.errors || error.message,
    });
  }
});

// Delete an application (soft delete)
const deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const application = await Application.delete(id);
    if (!application) {
      logger.warn("Application not found for deletion", { id });
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Application not found" });
    }
    logger.info("Application deleted successfully", { id });
    res.status(StatusCodes.OK).json({ message: "Application deleted successfully!" });
  } catch (error) {
    logger.error("Error deleting application", { error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!" });
  }
});

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};