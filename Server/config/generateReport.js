const knex = require("../config/db/db");
const Knex = require("knex");
const { decrypt } = require("./encryption");
const { downloadFile } = require("../storage/cloudStorageService.js");
const logger = require("../logger");
const js2xmlparser = require("js2xmlparser");
const { Xslt, XmlParser } = require("xslt-processor");
const puppeteer = require("puppeteer");
const { uploadFile } = require("../storage/cloudStorageService.js");
const fs = require("fs");
const { timeStamp } = require("console");

// Function to insert a new status record
async function insertStatusRecord(reportid) {
  try {
    const [result] = await knex("reportstatushistory")
      .insert({
        reportid: reportid,
        status: "In Progress",
        timestamp: new Date(),
        createdat: new Date(),
      })
      .returning("reportstatushistoryid"); // Ensure correct column name is returned

    // Extract statusId from result object
    const statusId = result.reportstatushistoryid;

    // Ensure statusId is a number
    if (typeof statusId !== "number") {
      throw new Error(`Invalid statusId: ${statusId}. Expected a number.`);
    }

    return statusId;
  } catch (error) {
    console.error("Error inserting status record:", error);
    throw error;
  }
}

// Function to update status record
async function updateStatusRecord(statusId, status, message = "") {
  try {
    await knex("reportstatushistory")
      .where({ reportstatushistoryid: statusId })
      .update({
        status: status,
        message: message,
        updatedat: new Date(),
      });
  } catch (error) {
    console.error("Error updating status record:", error);
    throw error;
  }
}
// Function to check report existence
async function checkReportExistence(reportName) {
  const report = await knex("report").where({ title: reportName }).first();
  return !!report;
}

// Function to get report details
async function getReportDetails(reportName) {
  const report = await knex("report").where({ title: reportName }).first();
  return report;
}

// Function to get connection details
async function getConnectionDetails(connectionId) {
  const connection = await knex("connection")
    .where({ connectionid: connectionId })
    .first();
  return connection;
}

// Function to get destination details
async function getDestinationDetails(destinationId) {
  const destination = await knex("destination")
    .where({ destinationid: destinationId })
    .first();
  return destination;
}

// Function to check the connection and return the Knex instance
async function checkConnection(connectionDetails) {
  try {
    const decryptedPassword = decrypt(connectionDetails.password);

    // Configure Knex instance for connection checking
    const testKnex = Knex({
      client: connectionDetails.type === "PostgreSQL" ? "pg" : "oracledb",
      connection: {
        host: connectionDetails.host,
        port:
          connectionDetails.port ||
          (connectionDetails.type === "PostgreSQL" ? 5432 : 1521),
        user: connectionDetails.username,
        password: decryptedPassword,
        database: connectionDetails.database,
      },
    });

    // Perform a basic query to check the connection
    if (connectionDetails.type === "PostgreSQL") {
      await testKnex.raw("SELECT 1");
    } else if (connectionDetails.type === "Oracle") {
      await testKnex.raw("SELECT 1 FROM DUAL");
    } else {
      throw new Error("Unsupported connection type");
    }

    // Return the Knex instance if the connection is successful
    return testKnex;
  } catch (error) {
    console.error("Connection error:", error);
    return null;
  }
}

// Function to generate SQL query text
const generateQueryText = (
  stored_procedure,
  parameterDefs,
  parameterValues
) => {
  let query = `SELECT * FROM ${stored_procedure}(`;

  const parameter_list = parameterDefs.split(", ").map((paramWithType) => {
    const [name, type] = paramWithType.split(" ");
    return { name, type };
  });

  const parameterClauses = parameter_list
    .map((paramObj) => {
      if (parameterValues[paramObj.name] !== undefined) {
        if (paramObj.type === "text" || paramObj.type === "varchar") {
          return `${paramObj.name} := '${parameterValues[paramObj.name]}' :: ${
            paramObj.type
          }`;
        }
        return `${paramObj.name} := ${parameterValues[paramObj.name]} :: ${
          paramObj.type
        }`;
      }
      return null;
    })
    .filter((clause) => clause !== null);

  query += parameterClauses.join(", ");
  query += ")";

  return query;
};

// Function to execute the query with schema
async function getProcedureRows(knexInstance, queryText, schemaName) {
  try {
    // Set the search path to the specified schema
    await knexInstance.raw(`SET search_path TO "${schemaName}"`);

    // Execute the query
    const result = await knexInstance.raw(queryText);

    // Return rows if available, otherwise null
    if (result.rows.length > 0) {
      return result.rows;
    } else {
      return null;
    }
  } catch (error) {
    // Handle errors
    console.error("Error running procedure:", error);
    throw error;
  }
}
async function performXsltTransformation(xmlData, xslContent) {
  try {
    const xslt = new Xslt();
    const xmlParser = new XmlParser();
    const parsedXml = xmlParser.xmlParse(xmlData);
    const parsedXsl = xmlParser.xmlParse(xslContent);
    const outXmlString = await xslt.xsltProcess(parsedXml, parsedXsl);
    return outXmlString;
  } catch (xsltError) {
    throw new Error("XSLT Transformation error: " + xsltError.message);
  }
}
// Main function to generate a report
async function generateReport(req, res, next) {
  const { reportName, parameters } = req.body;

  let statusId;

  try {
    // Step 1: Check if the report name exists
    const reportExists = await checkReportExistence(reportName);
    if (!reportExists) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Step 2: Insert a status record for the report

    // Step 3: Get report details (connection, destination, etc.)
    const reportDetails = await getReportDetails(reportName);
    statusId = await insertStatusRecord(reportDetails.reportid);

    // Step 4: Get the connection details using sourceconnectionid
    const connectionDetails = await getConnectionDetails(
      reportDetails.sourceconnectionid
    );

    // Step 5: Check if the connection is working and get the Knex instance
    const testKnex = await checkConnection(connectionDetails);
    if (!testKnex) {
      await updateStatusRecord(
        statusId,
        "Failed",
        "Failed to connect to the data source"
      );
      return res
        .status(500)
        .json({ message: "Failed to connect to the data source" });
    }

    // Step 6: Get the destination details using destinationid
    const destinationDetails = await getDestinationDetails(
      reportDetails.destinationid
    );

    if (!destinationDetails) {
      await updateStatusRecord(statusId, "Failed", "Destination not found");
      return res.status(404).json({ message: "Destination not found" });
    }

    // Step 7: Download the XSL file from the destination
    const file = await downloadFile(
      "aws", // Assuming AWS, modify as needed
      destinationDetails.url,
      destinationDetails.apikey,
      "reportsdestination0", // Assuming the bucket or path name
      reportDetails.filekey // Assuming filekey refers to the XSL file key
    );

    if (!file) {
      await updateStatusRecord(
        statusId,
        "Failed",
        "Failed to download the file"
      );
      return res.status(500).json({ message: "Failed to download the file" });
    }

    // Step 8: Convert the Buffer to a string (XSL content)
    const xslContent = file.Body.toString("utf-8");

    // Step 9: Generate SQL query using stored procedure and parameters
    const storedProcedure = reportDetails.storedprocedure;
    const parametersDefs = reportDetails.parameters; // Assuming this is a comma-separated list
    const query = generateQueryText(
      storedProcedure,
      parametersDefs,
      parameters
    );

    // Step 10: Execute the generated query
    const schemaName = "ETS"; // Assuming schema is part of reportDetails
    const result = await getProcedureRows(testKnex, query, schemaName);

    // Step 11: Convert result to XML
    const xmlData = js2xmlparser.parse("ReportData", {
      message: "Report generated successfully",
      data: result,
    });

    try {
      const htmlContent = await performXsltTransformation(xmlData, xslContent);

      // Generate the PDF
      const pdfBuffer = await generatePDF(htmlContent);
      const pdfKey = `reports/${reportName}-${Date.now()}.pdf`; // Key for the S3 object

      // Step 12: Upload the PDF to the destination
      const uploadResult = await uploadFile(
        "aws",
        destinationDetails.url,
        destinationDetails.apikey,
        { key: pdfKey, buffer: pdfBuffer },
        "reportsdestination0"
      );

      if (!uploadResult.success) {
        await updateStatusRecord(statusId, "Failed", uploadResult.message);
        return res.status(500).json({ message: uploadResult.message });
      }

      // Update status record to successful
      await updateStatusRecord(statusId, "Successful");

      // Send success message with the URL
      res.json({ message: "PDF uploaded successfully", url: uploadResult.url });
    } catch (error) {
      logger.error("Error generating report", { error: error.message });
      await updateStatusRecord(
        statusId,
        "Failed",
        "XSLT Transformation or PDF generation failed: " + error.message
      );
      return res.status(500).json({
        message: "XSLT Transformation or PDF generation failed",
        error: error.message,
      });
    }
  } catch (err) {
    logger.error("Error generating report", { error: err });
    if (statusId) {
      await updateStatusRecord(statusId, "Failed", err.message);
    }
    next(err);
  }
}

// Function to generate PDF and return buffer
async function generatePDF(htmlContent) {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  generateReport,
};
