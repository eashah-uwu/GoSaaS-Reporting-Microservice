const Application = require("../models/applicationModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const applicationSchema = require("../schemas/applicationSchemas");
const config = require("config");
require("dotenv").config();

const createApplication = async (req, res) => {
  const userid=req.user.userid;
  const data = applicationSchema.parse(req.body);

  const existingApplication = await Application.findByName(data.name,userid);
  if (existingApplication) {
    logger.warn("Application name must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Application name must be unique",
    });
  }

  const application = await Application.create(data,userid);

  logger.info("Application created successfully", {
    context: { traceid: req.traceId },
  });
  res.status(StatusCodes.CREATED).json({
    message: "Application created successfully!",
    application: {
      applicationid: application.applicationid,
      createdat: application.createdat,
      isactive: application.isactive,
      isdeleted: application.isdeleted,
      name: application.name,
      status: "active",
    },
  });
};

const getApplications = async (req, res) => {
  const userid=req.user.userid;
  const {
    query = config.get("query"),
    page = config.get("page"),
    pageSize = config.get("pageSize"),
    filters = config.get("filters"),
    sortField,
    sortOrder,
  } = req.query;

  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const [applications, total] = await Promise.all([
    Application.find({
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
      sortField,
      sortOrder,
      userid
    }),
    Application.countSearchResults(query, filters,userid),
  ]);

  logger.info("Searched applications retrieved", {
    context: { traceid: req.traceId },
  });
  res.status(StatusCodes.OK).json({
    data: applications,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

const getApplicationById = async (req, res) => {
  const { applicationid } = req.params;
  const userid=req.user.userid;
  const application = await Application.findById(applicationid);
  if (!application || application.userid!=userid) {
    logger.warn("Application not found", { context: { traceid: req.traceId } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }
  logger.info("Retrieved application by ID", {
    context: { traceid: req.traceId, application },
  });
  res.status(StatusCodes.OK).json(application);
};
const updateApplication = async (req, res) => {
  const userid=req.user.userid;
  const { applicationid } = req.params;
  const data = applicationSchema.partial().parse(req.body);
  const existingApplication=await Application.findById(applicationid);
  if (!existingApplication || (existingApplication && existingApplication.userid!=userid)){
    logger.warn("Application not found for update", {
      context: { traceid: req.traceId },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }
  const otherApplication = await Application.findByName(data.name,userid);
  if (otherApplication && otherApplication.applicationid != applicationid) {
    logger.warn("Application name must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Application name must be unique",
    });
  }

  const application = await Application.update(applicationid, data);
  logger.info("Application updated successfully", {
    context: { traceid: req.traceId, application },
  });
  res.status(StatusCodes.OK).json({
    message: "Application updated successfully!",
    application,
  });
};

const deleteApplication = async (req, res) => {
  const userid=req.user.userid;
  const { applicationid } = req.params;
  const existingApplication = await Application.findById(applicationid);
  if (!existingApplication || (existingApplication && existingApplication.userid!=userid)){
    logger.warn("Application not found for deletion", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Application not Found!"
    });
  }
  const application = await Application.delete(applicationid);
  logger.info("Application deleted successfully", {
    context: { traceid: req.traceId },
  });
  res
    .status(StatusCodes.OK)
    .json({ message: "Application deleted successfully!" });
};
const deleteMultipleApplications = async (req, res) => {
  const userid=req.user.userid;
  const { ids } = req.body;
  const existingApplications = await Application.findByIds(ids);
  if (existingApplications.length !== ids.length) {
    logger.warn("Some Applications not found for deletion", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Some Applications not found for deletion!",
    });
  }

  if (existingApplications.some(app => app.userid !== userid)) {
    logger.warn("Some applications found unauthorized for deletion", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Some applications found unauthorized for deletion!"
    });
  }
  await Application.deleteMultiple(ids);
  logger.info("Applications deleted successfully", {
    context: { traceid: req.traceId },
  });
  res.status(StatusCodes.OK).json({ message: "Applications deleted successfully!" });
};


module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  deleteMultipleApplications
};

