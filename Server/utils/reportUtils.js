const knex = require("../config/db/db");
const Knex = require("knex");
const { decrypt } = require("../config/encryption");
const {
  downloadFile,
  uploadFile,
} = require("../storage/cloudStorageService.js");
const logger = require("../logger");
const { Xslt, XmlParser } = require("xslt-processor");
const puppeteer = require("puppeteer");

// Function to insert a new status record
async function insertStatusRecord(reportid) {
  try {
    const [result] = await knex("reportstatushistory")
      .insert({
        reportid: reportid,
        status: "Pending",
        createdat: new Date(),
      })
      .returning("reportstatushistoryid");

    const statusId = result.reportstatushistoryid;

    if (typeof statusId !== "number") {
      throw new Error(`Invalid statusId: ${statusId}. Expected a number.`);
    }

    return statusId;
  } catch (error) {
    logger.error("Error inserting status record:", { error: error.message });
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
    logger.error("Error updating status record:", { error: error.message });
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

    if (connectionDetails.type === "PostgreSQL") {
      await testKnex.raw("SELECT 1");
    } else if (connectionDetails.type === "Oracle") {
      await testKnex.raw("SELECT 1 FROM DUAL");
    } else {
      throw new Error("Unsupported connection type");
    }

    return testKnex;
  } catch (error) {
    logger.error("Connection error:", { error: error.message });
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
    await knexInstance.raw(`SET search_path TO "${schemaName}"`);
    const result = await knexInstance.raw(queryText);

    if (result.rows.length > 0) {
      return result.rows;
    } else {
      return null;
    }
  } catch (error) {
    logger.error("Error running procedure:", { error: error.message });
    throw error;
  }
}

// Function to perform XSLT transformation
async function performXsltTransformation(xmlData, xslContent) {
  try {
    const xslt = new Xslt();
    const xmlParser = new XmlParser();
    const parsedXml = xmlParser.xmlParse(xmlData);
    const parsedXsl = xmlParser.xmlParse(xslContent);
    const outXmlString = await xslt.xsltProcess(parsedXml, parsedXsl);
    return outXmlString;
  } catch (xsltError) {
    logger.error("XSLT Transformation error:", { error: xsltError.message });
    throw new Error("XSLT Transformation error: " + xsltError.message);
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
    logger.error("Error generating PDF:", { error: error.message });
    throw error;
  }
}

module.exports = {
  insertStatusRecord,
  updateStatusRecord,
  checkReportExistence,
  getReportDetails,
  getConnectionDetails,
  getDestinationDetails,
  checkConnection,
  generateQueryText,
  getProcedureRows,
  performXsltTransformation,
  generatePDF,
  downloadFile,
  uploadFile,
};
