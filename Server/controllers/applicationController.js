const Application = require("../models/applicationModel");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const applicationSchema = require("../schemas/applicationSchemas");

const createApplication = asyncHandler(async (req, res) => {
  // Validate and parse the request body
  const data = applicationSchema.parse(req.body);

  // Create the application in the database
  const application = await Application.create(data);

  // Log success and send response
  logger.info("Application created successfully", { application });
  res.status(StatusCodes.CREATED).json({
    message: "Application created successfully!",
    application,
  });
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
  // Validate and parse the request body
  const data = applicationSchema.partial().parse(req.body);

  // Update the application in the database
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
});

// Delete an application (soft delete)
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
  res
    .status(StatusCodes.OK)
    .json({ message: "Application deleted successfully!" });
});

const paginateApplications = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  try {
    const [applications, total] = await Promise.all([
      Application.paginate({ offset, limit: parseInt(pageSize) }),
      Application.countAll()
    ]);

    logger.info("Paginated applications retrieved", { applications });
    res.status(StatusCodes.OK).json({
      data: applications,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    logger.error("Error retrieving paginated applications", { error });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!", error });
  }
});

const searchApplications = asyncHandler(async (req, res) => {
  const { query = "", page = 1, pageSize = 10, filters = {}, sortField = "", sortOrder = "asc" } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  try {
      const [applications, total] = await Promise.all([
          Application.search({ query, offset, limit: parseInt(pageSize), filters, sortField, sortOrder }),
          Application.countSearchResults(query, filters)
      ]);
      logger.info("Searched applications retrieved", { applications });
      res.status(StatusCodes.OK).json({
          data: applications,
          total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
      });
  } catch (error) {
      logger.error("Error retrieving searched applications", { error });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong!", error });
  }
});


module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  searchApplications,
  paginateApplications,
};
