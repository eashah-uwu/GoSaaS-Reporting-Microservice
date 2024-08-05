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
  console.log(req.body)
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


const getFilteredApplications = asyncHandler(async (req, res) => {
  const { query = "", page = 1, pageSize = 10, filters = {} } = req.query;
  console.log("query",query,"page",page,"pageSize",pageSize,"filters",filters)
  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const [applications, total] = await Promise.all([
    Application.filter({ query, offset, limit: parseInt(pageSize, 10), filters }),
    Application.countSearchResults(query, filters),
  ]);

  logger.info("Searched applications retrieved", { applications });
  res.status(StatusCodes.OK).json({
    data: applications,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });

});

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  getFilteredApplications
};
