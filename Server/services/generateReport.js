// services/generateReport.js
const {
  checkReportExistence,
  getReportDetails,
  insertStatusRecord,
  checkConnection,
  getConnectionDetails,
  updateStatusRecord,
  downloadFile,
  getDestinationDetails,
  generateQueryText,
  getProcedureRows,
  performXsltTransformation,
  generatePDF,
  uploadFile,
} = require("../utils/reportUtils"); // Import utility functions
const js2xmlparser = require("js2xmlparser");

async function generateReport(reportName, userid, parameters) {
  let statusId;

  try {
    // Step 1: Check if the report name exists
    const reportExists = await checkReportExistence(reportName, userid);
    if (!reportExists) {
      throw new Error("Report not found");
    }

    // Step 3: Get report details (connection, destination, etc.)
    const reportDetails = await getReportDetails(reportName, userid);
    statusId = await insertStatusRecord(reportDetails.reportid, userid);

    // Step 4: Get the connection details using sourceconnectionid
    const connectionDetails = await getConnectionDetails(
      reportDetails.sourceconnectionid
    );

    // Check connection (Implement this as needed)
    const testKnex = await checkConnection(connectionDetails);
    if (!testKnex) {
      await updateStatusRecord(
        statusId,
        "Failed",
        "Failed",
        "Failed to connect to the data source"
      );
      throw new Error("Failed to connect to the data source");
    }

    // Step 6: Get the destination details using destinationid
    const destinationDetails = await getDestinationDetails(
      reportDetails.destinationid
    );

    if (!destinationDetails) {
      await updateStatusRecord(
        statusId,
        "Failed",
        "Failed",
        "Destination not found"
      );
      throw new Error("Destination not found");
    }

    // Step 7: Download the XSL file from the destination
    const file = await downloadFile(
      "aws",
      destinationDetails.url,
      destinationDetails.apikey,
      "reportsdestination0",
      reportDetails.filekey
    );
    if (!file) {
      await updateStatusRecord(
        statusId,
        "Failed",
        "Failed",
        "Failed to download the file"
      );
      throw new Error("Failed to download the file");
    }

    const xslContent = file.Body.toString("utf-8");

    // Step 9: Generate SQL query using stored procedure and parameters
    const storedProcedure = reportDetails.storedprocedure;
    const parametersDefs = reportDetails.parameters;
    const query = generateQueryText(
      storedProcedure,
      parametersDefs,
      parameters
    );

    // Step 10: Execute the generated query
    const schemaName = connectionDetails.schema || "public";
    const result = await getProcedureRows(testKnex, query, schemaName);

    // Step 11: Convert result to XML
    const xmlData = js2xmlparser.parse("ReportData", {
      message: "Report generated successfully",
      data: result,
    });
    const htmlContent = await performXsltTransformation(xmlData, xslContent);

    // Generate the PDF
    const pdfBuffer = await generatePDF(htmlContent);
    const pdfKey = `reports/${reportName}-${Date.now()}.pdf`;

    // Step 12: Upload the PDF to the destination
    const uploadResult = await uploadFile(
      "aws",
      destinationDetails.url,
      destinationDetails.apikey,
      { key: pdfKey, buffer: pdfBuffer },
      "reportsdestination0"
    );
    if (!uploadResult.success) {
      await updateStatusRecord(
        statusId,
        "Failed",
        "Failed",
        uploadResult.message
      );
      throw new Error(uploadResult.message);
    }

    // Update status record to successful
    await updateStatusRecord(statusId, pdfKey, "Generated");
    return { message: "PDF uploaded successfully", url: uploadResult.url };
  } catch (err) {
    if (statusId) {
      await updateStatusRecord(statusId, "Failed", "Failed", err.message);
    }
    throw err;
  }
}

module.exports = {
  generateReport,
};
