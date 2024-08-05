const Application = require("../models/applicationModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const applicationSchema = require("../schemas/applicationSchemas");
const config = require("config");
require("dotenv").config();

const createApplication = async (req, res) => {
  // Validate and parse request body using applicationSchema
  const data = applicationSchema.parse(req.body);

  // Check if the name already exists
  const existingApplication = await Application.findByName(data.name);
  if (existingApplication) {
    logger.warn("Application name must be unique", { name: data.name });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Application name must be unique",
    });
  }

  // Create application in the database
  const application = await Application.create(data);

  logger.info("Application created successfully", { application });
  res.status(StatusCodes.CREATED).json({
    message: "Application created successfully!",
    application:{applicationid:application.applicationid,createdat:application.createdat,isactive:application.isactive,isdeleted:application.isdeleted,name:application.name,status:"active"}
});
};

// Get applications
const getApplications = async (req, res) => {
  const { query = config.get("query"), page = config.get("page"), pageSize = config.get("pageSize"), filters = config.get("filters") } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const [applications, total] = await Promise.all([
    Application.find({
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Application.countSearchResults(query, filters),
  ]);

  logger.info("Searched applications retrieved", { applications });
  res.status(StatusCodes.OK).json({
    data: applications,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

// Get application by ID
const getApplicationById = async (req, res) => {
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
};

// Update an application
const updateApplication = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
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
};

// Delete an application (soft delete)
const deleteApplication = async (req, res) => {
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
};



module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
