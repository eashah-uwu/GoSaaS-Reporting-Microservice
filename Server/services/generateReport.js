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

    // Step 2: Get report details (connection, destination, etc.)
    const reportDetails = await getReportDetails(reportName, userid);
    statusId = await insertStatusRecord(reportDetails.reportid, userid);

    // Step 3: Get the connection details using sourceconnectionid
    const connectionDetails = await getConnectionDetails(
      reportDetails.sourceconnectionid
    );

    // Check connection
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

    // Step 4: Get the destination details using destinationid
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

    // Step 5: Download the XSL file from the destination
    const file = await downloadFile(
      destinationDetails.cloudprovider,
      destinationDetails.url,
      destinationDetails.apikey,
      destinationDetails.bucketname,
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

    // Step 6: Generate SQL query using stored procedure and parameters
    const storedProcedure = reportDetails.storedprocedure;
    const parametersDefs = reportDetails.parameters;
    const query = generateQueryText(
      storedProcedure,
      parametersDefs,
      parameters
    );

    // Step 7: Execute the generated query
    const schemaName = connectionDetails.schema || "public";
    const result = await getProcedureRows(testKnex, query, schemaName);
    
    console.log(result);

    // Step 8: Convert result to XML
    const xmlData = js2xmlparser.parse("ReportData", {
      message: "Report generated successfully",
      data: result,
    });
    const htmlContent = await performXsltTransformation(xmlData, xslContent);
      
    console.log(htmlContent);
    // Step 9: Generate the PDF
 
    const pdfBuffer = await generatePDF(htmlContent);
    const pdfKey = `reports/${reportName}-${Date.now()}.pdf`;

    // Step 10: Upload the PDF to the destination
    const uploadResult = await uploadFile(
      destinationDetails.cloudprovider,
      destinationDetails.url,
      destinationDetails.apikey,
      { key: pdfKey, buffer: pdfBuffer },
      destinationDetails.bucketname
    );
    if (!uploadResult.success) {
      await updateStatusRecord(
        statusId,
        "Failed",
        "Failed",
        `Failed to upload PDF: ${uploadResult.message}`
      );
      throw new Error(`Failed to upload PDF: ${uploadResult.message}`);
    }

    // Update status record to successful
    await updateStatusRecord(statusId, pdfKey, "Generated", "Generated");
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
