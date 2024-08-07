const Report = require("../models/reportModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const { reportSchema } = require("../schemas/reportSchemas");

const createReport = async (req, res) => {
  // Validate and parse request body using reportSchema
  const data = reportSchema.parse(req.body);

  // Create report in the database
  const report = await Report.create(data);

  logger.info("Report created successfully", {
    context: { traceid: req.traceId, report },
  });
  res.status(StatusCodes.CREATED).json({
    message: "Report created successfully!",
    report,
  });
};

const getAllReports = async (req, res) => {
  const reports = await Report.findAll();
  logger.info("Retrieved all reports", {
    context: { traceid: req.traceId, reports },
  });
  res.status(StatusCodes.OK).json(reports);
};

const getReportById = async (req, res) => {
  const { id } = req.params;
  const reportId = parseInt(id, 10);

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", { context: { traceid: req.traceId, id } });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }

  const report = await Report.findById(reportId);
  if (!report) {
    logger.warn("Report not found", { context: { traceid: req.traceId, id } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report not found" });
  }
  logger.info("Retrieved report by ID", {
    context: { traceid: req.traceId, id, report },
  });
  res.status(StatusCodes.OK).json(report);
};

const updateReport = async (req, res) => {
  const { id } = req.params;
  const reportId = parseInt(id, 10);

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", { context: { traceid: req.traceId, id } });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }

  const data = reportSchema.partial().parse(req.body);

  const report = await Report.update(reportId, data);
  if (!report) {
    logger.warn("Report not found for update", {
      context: { traceid: req.traceId, id },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report not found" });
  }
  logger.info("Report updated successfully", {
    context: { traceid: req.traceId, id, report },
  });
  res.status(StatusCodes.OK).json({
    message: "Report updated successfully!",
    report,
  });
};

const deleteReport = async (req, res) => {
  const { id } = req.params;
  const reportId = parseInt(id, 10);

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", { context: { traceid: req.traceId, id } });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }

  await Report.delete(reportId);
  logger.info("Report deleted successfully", {
    context: { traceid: req.traceId, id },
  });
  res.status(StatusCodes.OK).json({ message: "Report deleted successfully!" });
};

const paginateReports = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  const [reports, total] = await Promise.all([
    Report.paginate({ offset, limit: parseInt(pageSize) }),
    Report.countAll(),
  ]);

  logger.info("Paginated reports retrieved", {
    context: { traceid: req.traceId, reports },
  });
  res.status(StatusCodes.OK).json({
    data: reports,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  });
};

const searchReports = async (req, res) => {
  const {
    query = "",
    page = 1,
    pageSize = 10,
    filters = {},
    sortField = "None",
    sortOrder = "asc",
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);

  const [results, total] = await Promise.all([
    Report.search({
      query,
      offset,
      limit: parseInt(pageSize),
      filters,
      sortField,
      sortOrder,
    }),
    Report.countSearchResults(query, filters),
  ]);

  logger.info("Search results retrieved", {
    context: { traceid: req.traceId, results },
  });
  res.status(StatusCodes.OK).json({
    data: results,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  });
};
const getReportsByApplicationId = async (req, res) => {
  const { id: applicationid } = req.params;
  const reports = await Report.findByApplicationId(applicationid);
  if (!reports || reports.length === 0) {
    logger.warn("Reports not found", {
      context: { traceid: req.traceId, applicationid },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Reports not found" });
  }
  logger.info("Retrieved reports by application ID", {
    context: { traceid: req.traceId, applicationid, reports },
  });
  res.status(StatusCodes.OK).json(reports);
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  paginateReports,
  searchReports,
  getReportsByApplicationId,
};
