const Report = require("../models/reportModel");
const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const reportSchema = require("../schemas/reportSchemas");
const config = require("config");
require("dotenv").config();
const Destination = require("../models/destinationModel");
const Application = require("../models/applicationModel");
const {
  uploadFile,
  downloadFile,
  deleteFile
} = require("../storage/cloudStorageService.js");
const { generateReport } = require("../services/generateReport");
const { v4: uuidv4 } = require("uuid");
const ReportStatusHistory = require("../models/reportStatusHistory.js");
const reportQueue = require("../queues/reportQueue");
const { Store } = require("express-session");

const createReport = async (req, res) => {
  const { buffer, originalname } = req.file;
  const {
    alias,
    description,
    source,
    destination,
    storedProcedure,
    parameter,
    applicationid,
  } = req.body;

  const userid = req.user.userid;
  const application = await Application.findById(applicationid);

  if (!application || application.userid != userid) {
    logger.warn("Application not found", { context: { traceid: req.traceId } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }

  const existingReport = await Report.findByName(alias, applicationid);
  if (existingReport) {
    logger.warn("Title of report must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Title of report must be unique",
    });
  }

  const uid = uuidv4(); // Generate a unique identifier
  const fileName = `${uid}-${originalname}`; // Combine userid, uid, and originalname for uniqueness
  const folderName = `user_${userid}`;
  const key = `${folderName}/${fileName}`;

  const destination_db = await Destination.findById(destination);
  await uploadFile(
    destination_db.cloudprovider,
    destination_db.url,
    destination_db.apikey,
    { key, buffer },
    destination_db.bucketname
  );

  console.log(source);

  const newReport = await Report.create(
    alias,
    description,
    parameter,
    source,
    destination,
    applicationid,
    storedProcedure,
    userid,
    key
  );

  logger.info("Report created successfully", {
    context: { traceid: req.traceId, newReport },
  });

  res.status(StatusCodes.CREATED).json({
    message: "Report created successfully!",
    report: newReport,
  });
};
const downloadXsl = async (req, res) => {
  const userid = req.user.userid;
  const { reportid } = req.params;
  const reportId = parseInt(reportid, 10);

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", { context: { traceid: req.traceId, id } });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }
  const report = await Report.findById(reportId);
  if (!report && report.userid != userid) {
    logger.warn("Report not found", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report not found" });
  }
  const destination_db = await Destination.findById(report.destinationid);
  const file = await downloadFile(
    destination_db.cloudprovider,
    destination_db.url,
    destination_db.apikey,
    destination_db.bucketname,
    report.filekey
  );
  const fileName = report.filekey.split("/").pop()?.split("-").pop();
  const fileType = fileName.split(".").pop();
  res.setHeader("Content-Type", file.ContentType || `application/${fileType}`);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(file.Body);
};
const downloadReport = async (req, res) => {
  const userid = req.user.userid;
  const { reporthistoryid } = req.params;

  const reportHistory = await ReportStatusHistory.findById(reporthistoryid);
  if (!reportHistory) {
    logger.warn("Report History not found", { id });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report History not found" });
  }
  const report = await Report.findById(reportHistory.reportid);
  const destination_db = await Destination.findById(report.destinationid);
  const file = await downloadFile(
    destination_db.cloudprovider,
    destination_db.url,
    destination_db.apikey,
    destination_db.bucketname,
    reportHistory.filekey
  );
  const fileName = report.filekey.split("/").pop()?.split("-").pop();
  const fileType = fileName.split(".").pop();
  res.setHeader("Content-Type", file.ContentType || `application/${fileType}`);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(file.Body);
};

const getReports = async (req, res) => {
  const {
    query = config.get("query"),
    page = config.get("page"),
    pageSize = config.get("pageSize"),
    filters = config.get("filters"),
  } = req.query;
  const userid = req.user.userid;

  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const [reports, total] = await Promise.all([
    Report.findAll({
      userid,
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Report.countSearchReportsHistory(userid, query, filters),
  ]);
  logger.info("Reports retrieved by user ID", {
    context: { traceid: req.traceId, userid, reports },
  });
  res.status(StatusCodes.OK).json({
    data: reports,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
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
  const {
    alias,
    description,
    source,
    destination,
    storedProcedure,
    parameter,
    applicationid,
  } = req.body;

  const { reportid } = req.params;
  const reportId = parseInt(reportid, 10);
  const userid = req.user.userid;

  const sourceId = parseInt(source, 10);
  const destinationId = parseInt(destination, 10);
  const applicationId = parseInt(applicationid, 10);


  const existingReport = await Report.findById(reportId);
  if (!existingReport || existingReport.userid != userid) {
    logger.warn("Report not found or unauthorized", { id: reportId });
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Report not found or unauthorized" });
  }
  const otherReport = await Report.findByName(alias, existingReport.applicationid);
  if (otherReport && otherReport.reportid != reportId) {
    logger.warn("Title of report must be unique", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.CONFLICT).json({
      message: "Title of report must be unique",
    });
  }
  let data = {
    title: alias,
    description,
    generationdate: existingReport.generationdate,
    parameters: parameter,
    sourceconnectionid: sourceId,
    destinationid: destinationId,
    applicationid: applicationId,
    storedProcedure: storedProcedure,
    userid: userid,
  };
  if (req.file) {
    const { buffer, originalname } = req.file;
    const destination_db = await Destination.findById(existingReport.destinationid);
    await deleteFile(
      destination_db.cloudprovider,
      destination_db.url,
      destination_db.apikey,
      destination_db.bucketname,
      existingReport.filekey
    );

    const uid = uuidv4(); // Generate a unique identifier
    const fileName = `${uid}-${originalname}`; // Combine userid, uid, and originalname for uniqueness
    const folderName = `user_${userid}`;
    const key = `${folderName}/${fileName}`;

    const newDestination = await Destination.findById(destinationId);
    await uploadFile(
      newDestination.cloudprovider,
      newDestination.url,
      newDestination.apikey,
      { key, buffer },
      newDestination.bucketname
    );
    data={
      ...data,
      filekey:key
    }
  }

  const report = await Report.update(reportId, data);
  logger.info("Report updated successfully", {
    context: { traceid: req.traceId, report },
  });
  res.status(StatusCodes.OK).json({
    message: "Report updated successfully!",
    report,
  });

  logger.error("Error updating report", {
    context: { traceid: req.traceId, error },
  });
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "An error occurred while updating the report",
  });

};


const deleteReport = async (req, res) => {
  const { reportid } = req.params;
  const reportId = parseInt(reportid, 10);
  const userid = req.user.userid;

  if (isNaN(reportId)) {
    logger.warn("Invalid report ID", {
      context: { traceid: req.traceId, reportid },
    });
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid report ID" });
  }
  const report = await Report.findById(reportId);
  if (!report && report.userid != userid) {
    logger.warn("Report not found", { reportid });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Report not found" });
  }
  const destination_db = await Destination.findById(report.destinationid);

  await deleteFile(
    destination_db.cloudprovider,
    destination_db.url,
    destination_db.apikey,
    destination_db.bucketname,
    report.filekey
  );


  await Report.delete(reportId);
  logger.info("Report deleted successfully", {
    context: { traceid: req.traceId, reportid },
  });
  res.status(StatusCodes.OK).json({ message: "Report deleted successfully!" });
};

const deleteMultipleReports = async (req, res) => {
  const userid = req.user.userid;
  const { ids } = req.body;
  const existingReports = await Report.findByIds(ids);
  if (existingReports.length !== ids.length) {
    logger.warn("Some Reports not found for deletion", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Some Applications not found for deletion!",
    });
  }

  if (existingReports.some(report => report.userid !== userid)) {
    logger.warn("Some Reports found unauthorized for deletion", {
      context: { traceid: req.traceId },
    });
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Some Reports found unauthorized for deletion!"
    });
  }
  console.log("existingReports", existingReports)
  for (const report of existingReports) {
    const destination_db = await Destination.findById(report.destinationid);
    await deleteFile(
      destination_db.cloudprovider,
      destination_db.url,
      destination_db.apikey,
      destination_db.bucketname,
      report.filekey
    );
    console.log("deell11")
  }

  await Report.deleteMultiple(ids);
  logger.info("Reports deleted successfully", {
    context: { traceid: req.traceId },
  });
  res.status(StatusCodes.OK).json({ message: "Reports deleted successfully!" });
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
  const { applicationid } = req.params;
  const userid = req.user.userid;
  const application = await Application.findById(applicationid);
  if (!application || application.userid != userid) {
    logger.warn("Application not found", { context: { traceid: req.traceId } });
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Application not found" });
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const [reports, total] = await Promise.all([
    Report.findByApplicationId({
      applicationid,
      query,
      offset,
      limit: parseInt(pageSize, 10),
      filters,
    }),
    Report.countSearchResults(applicationid, query, filters),
  ]);
  logger.info("Reports retrieved by application ID", {
    context: { traceid: req.traceId, applicationid, reports },
  });
  res.status(StatusCodes.OK).json({
    data: reports,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  });
};

const reportGeneration = async (req, res, next) => {
  const { reportName, userid, parameters } = req.body;

  try {
    // Add job to the queue
    const job = await reportQueue.add("generateReport", {
      reportName,
      userid,
      parameters,
    });

    if (!job) {
      logger.error("Failed to add job to the queue");
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Error adding job to the queue",
      });
    }

    // Respond with job information
    res.status(StatusCodes.ACCEPTED).json({
      message: "Report generation job added to the queue",
      jobId: job.id,
    });
  } catch (err) {
    logger.error(`Error in reportGeneration: ${err.message}`);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error processing report generation",
      error: err.message,
    });
  }
};
module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  searchReports,
  getReportsByApplicationId,
  downloadXsl,
  reportGeneration,
  downloadReport,
  deleteMultipleReports
};
