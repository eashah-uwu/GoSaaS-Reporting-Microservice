const Report = require("../models/reportModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const reportSchema = require("../schemas/reportSchemas");
const config = require("config");
require("dotenv").config();
const path = require('path');
const Destination = require("../models/destinationModel");
const { uploadFile } = require('../storage/cloudStorageService.js');


const createReport = async (req, res) => {
  const {buffer,originalname} = req.file; 
  const { alias, description, source, destination, storedProcedure, parameter, userid,applicationid } = req.body;
  const fileName = `${userid}-${originalname}`;
  const folderName = `user_${userid}`;
  const key = `${folderName}/${fileName}`;
  const destination_db = await Destination.findById(destination);
  await uploadFile("aws", destination_db.url, destination_db.apikey,{key,buffer}, "reportsdestination0")

  const newReport = await Report.create(
      alias,
      description,
      parameter,
      source,
      destination,
      applicationid,
      storedProcedure,
      userid,
      key, 
  );
  logger.info("Report created successfully", {
    context: { traceid: req.traceId, newReport },
  });
  res.status(StatusCodes.CREATED).json({
    message: "Report created successfully!",
    report:newReport,
  });
};


const downloadReport = async (req, res) => {
  const { reportId } = req.params;
  try {
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: report.fileName,
    };

    const fileStream = s3.getObject(params).createReadStream();
    res.attachment(path.basename(report.fileName));
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading report:', error);
    return res.status(500).json({ success: false, message: 'Error downloading report' });
  }
};
const getReports = async (req, res) => {
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
    logger.warn("Report not found", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report not found" });
  }
  logger.info("Retrieved report by ID", {
    context: { traceid: req.traceId, report },
  });
  res.status(StatusCodes.OK).json(report);
};

const updateReport = async (req, res) => {
  const { id } = req.params;
  const data = reportSchema.partial().parse(req.body);
  const report = await Report.update(id, data);
  if (!report) {
    logger.warn("Report not found for update", {
      context: { traceid: req.traceId },
    });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report not found" });
  }
  logger.info("Report updated successfully", {
    context: { traceid: req.traceId, report },
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
  const {
    query = config.get("query"),
    page = config.get("page"),
    pageSize = config.get("pageSize"),
    filters = config.get("filters"),
  } = req.query;
  const { id: applicationId } = req.params;
  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const [reports, total] = await Promise.all([
    Report.findByApplicationId({
      applicationId,
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Report.countSearchResults(applicationId, query, filters),
  ]);
  logger.info("Reports retrieved by application ID", {
    context: { traceid: req.traceId, applicationId, reports },
  });
  res.status(StatusCodes.OK).json({
    data: reports,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  searchReports,
  getReportsByApplicationId,
  downloadReport
};
