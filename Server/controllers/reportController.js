const Report = require("../models/reportModel");
const { StatusCodes } = require("http-status-codes");
const asyncHandler = require("express-async-handler");
const logger = require("../logger");
const { reportSchema } = require("../schemas/reportSchemas");

const createReport = asyncHandler(async (req, res) => {
  try {
    // Validate and parse request body using reportSchema
    const data = reportSchema.parse(req.body);

    // Create report in the database
    const report = await Report.create(data);

    logger.info("Report created successfully", { report });
    res.status(StatusCodes.CREATED).json({
      message: "Report created successfully!",
      report,
    });
  } catch (error) {
    logger.error("Error creating report", { error });
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid data", error: error.message });
  }
});

const getAllReports = asyncHandler(async (req, res) => {
  const reports = await Report.findAll();
  logger.info("Retrieved all reports", { reports });
  res.status(StatusCodes.OK).json(reports);
});

const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reportId = parseInt(id, 10);

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", { id });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }

  const report = await Report.findById(reportId);
  if (!report) {
    logger.warn("Report not found", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report not found" });
  }
  logger.info("Retrieved report by ID", { id, report });
  res.status(StatusCodes.OK).json(report);
});

const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reportId = parseInt(id, 10);

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", { id });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }

  try {
    const data = reportSchema.partial().parse(req.body);

    const report = await Report.update(reportId, data);
    if (!report) {
      logger.warn("Report not found for update", { id });
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Report not found" });
    }
    logger.info("Report updated successfully", { id, report });
    res.status(StatusCodes.OK).json({
      message: "Report updated successfully!",
      report,
    });
  } catch (error) {
    logger.error("Error updating report", { error });
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid data", error: error.message });
  }
});

const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reportId = parseInt(id, 10);

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", { id });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }

  await Report.delete(reportId);
  logger.info("Report deleted successfully", { id });
  res.status(StatusCodes.OK).json({ message: "Report deleted successfully!" });
});

const paginateReports = asyncHandler(async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  try {
    const [reports, total] = await Promise.all([
      Report.paginate({ offset, limit: parseInt(pageSize) }),
      Report.countAll(),
    ]);

    logger.info("Paginated reports retrieved", { reports });
    res.status(StatusCodes.OK).json({
      data: reports,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    logger.error("Error retrieving paginated reports", { error });
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong!", error });
  }
});

const searchReports = asyncHandler(async (req, res) => {
  const {
    query = "",
    page = 1,
    pageSize = 10,
    filters = {},
    sortField = "None",
    sortOrder = "asc",
  } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(pageSize);
  try {
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

    logger.info("Search results retrieved", { results });
    res.status(StatusCodes.OK).json({
      data: results,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    logger.error("Error retrieving search results", { error });
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Something went wrong!", error });
  }
});

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  paginateReports,
  searchReports,
};
