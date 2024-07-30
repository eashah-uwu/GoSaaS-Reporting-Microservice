const Application = require("../models/applicationModel");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");

async function createApplication(req, res) {
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
}

async function getAllApplications(req, res) {
  const applications = await Application.findAll();
  res.status(StatusCodes.OK).json(applications);
}

async function getApplicationById(req, res) {
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }
  res.status(StatusCodes.OK).json(application);
}

async function updateApplication(req, res) {
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
}

async function deleteApplication(req, res) {
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
}

module.exports = {
  createApplication: asyncHandler(createApplication),
  getAllApplications: asyncHandler(getAllApplications),
  getApplicationById: asyncHandler(getApplicationById),
  updateApplication: asyncHandler(updateApplication),
  deleteApplication: asyncHandler(deleteApplication),
};
