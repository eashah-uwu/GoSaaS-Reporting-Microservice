const knex = require("../config/db/db");
const Knex = require("knex");
const { decrypt } = require("./encryption");
const { downloadFile } = require("../storage/cloudStorageService.js");
const logger = require("../logger");
const js2xmlparser = require("js2xmlparser");

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

// Main function to generate a report
async function generateReport(req, res, next) {
  const { reportName, parameters } = req.body;

  try {
    // Step 1: Check if the report name exists
    const reportExists = await checkReportExistence(reportName);
    if (!reportExists) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Step 2: Get report details (connection, destination, etc.)
    const reportDetails = await getReportDetails(reportName);

    // Step 3: Get the connection details using sourceconnectionid
    const connectionDetails = await getConnectionDetails(
      reportDetails.sourceconnectionid
    );

    // Step 4: Check if the connection is working and get the Knex instance
    const testKnex = await checkConnection(connectionDetails);
    if (!testKnex) {
      return res
        .status(500)
        .json({ message: "Failed to connect to the data source" });
    }

    // Step 5: Get the destination details using destinationid
    const destinationDetails = await getDestinationDetails(
      reportDetails.destinationid
    );

    if (!destinationDetails) {
      return res.status(404).json({ message: "Destination not found" });
    }

    // Step 6: Download the XSL file from the destination
    const file = await downloadFile(
      "aws", // Assuming AWS, modify as needed
      destinationDetails.url,
      destinationDetails.apikey,
      "reportsdestination0", // Assuming the bucket or path name
      reportDetails.filekey // Assuming filekey refers to the XSL file key
    );

    if (!file) {
      return res.status(500).json({ message: "Failed to download the file" });
    }

    // Step 7: Convert the Buffer to a string (XSL content)
    const xslContent = file.Body.toString("utf-8");

    // Step 8: Generate SQL query using stored procedure and parameters
    const storedProcedure = reportDetails.storedprocedure;
    const parametersDefs = reportDetails.parameters; // Assuming this is a comma-separated list
    const query = generateQueryText(
      storedProcedure,
      parametersDefs,
      parameters
    );
    console.log("Generated Query:", query);

    // Step 9: Execute the generated query
    const schemaName = "ETS"; // Assuming schema is part of reportDetails
    const result = await getProcedureRows(testKnex, query, schemaName);

    // Step 10: Convert result to XML
    const xmlData = js2xmlparser.parse("ReportData", {
      message: "Report generated successfully",
      data: result,
    });

    // Send the XML response
    res.set("Content-Type", "application/xml");
    return res.status(200).send(xmlData);
  } catch (err) {
    logger.error("Error generating report", { error: err });
    next(err);
  }
}

module.exports = {
  generateReport,
};
