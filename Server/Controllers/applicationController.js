const Application = require("../models/applicationModel");
const { StatusCodes } = require("http-status-codes");
const debug = require("debug")("app:application"); // Create a debug instance

async function createApplication(req, res, next) {
  try {
    const { name, description, isActive, userID, createdBy, updatedBy } =
      req.body;
    const application = await Application.create({
      name,
      description,
      isActive,
      userID,
      createdBy,
      updatedBy,
    });
    res.status(StatusCodes.CREATED).json({
      message: "Application created successfully!",
      application,
    });
  } catch (err) {
    debug("Error creating application:", err); // Use debug for error logging
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while creating the application.",
    });
  }
}

async function getAllApplications(req, res, next) {
  try {
    const applications = await Application.findAll();
    res.status(StatusCodes.OK).json(applications);
  } catch (err) {
    debug("Error retrieving applications:", err); // Use debug for error logging
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while retrieving applications.",
    });
  }
}

async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
    res.status(StatusCodes.OK).json(application);
  } catch (err) {
    debug("Error retrieving application by ID:", err); // Use debug for error logging
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while retrieving the application.",
    });
  }
}

async function updateApplication(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;
    const application = await Application.update(id, data);
    if (!application) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
    res.status(StatusCodes.OK).json({
      message: "Application updated successfully!",
      application,
    });
  } catch (err) {
    debug("Error updating application:", err); // Use debug for error logging
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while updating the application.",
    });
  }
}

async function deleteApplication(req, res, next) {
  try {
    const { id } = req.params;
    const application = await Application.delete(id);
    if (!application) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Application not found" });
    }
    res.status(StatusCodes.OK).json({
      message: "Application deleted successfully!",
    });
  } catch (err) {
    debug("Error deleting application:", err); // Use debug for error logging
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while deleting the application.",
    });
  }
}

module.exports = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
