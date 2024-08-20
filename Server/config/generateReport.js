const knex = require("../config/db/db");
const Knex = require("knex");
const fs = require("fs").promises;
const { decrypt } = require("./encryption");

async function checkReportExistence(reportName) {
  const report = await knex("report").where({ title: reportName }).first();
  return !!report;
}

async function getReportDetails(reportName) {
  const report = await knex("report").where({ title: reportName }).first();
  return report;
}

async function getConnectionDetails(connectionId) {
  const connection = await knex("connection")
    .where({ connectionid: connectionId })
    .first();
  return connection;
}

async function checkConnection(connectionDetails) {
  try {
    let testKnex;
    let testConnection;
    const decryptedPassword = decrypt(connectionDetails.password);
    // Check the type of the connection and configure accordingly
    if (connectionDetails.type === "PostgreSQL") {
      testKnex = Knex({
        client: "pg",
        connection: {
          host: connectionDetails.host,
          port: connectionDetails.port || 5432,
          user: connectionDetails.username,
          password: decryptedPassword,
          database: connectionDetails.database,
        },
      });
      testConnection = await testKnex.raw("SELECT 1");
    } else if (connectionDetails.type === "Oracle") {
      testKnex = Knex({
        client: "oracledb",
        connection: {
          host: connectionDetails.host,
          port: connectionDetails.port || 1521,
          user: connectionDetails.username,
          password: decryptedPassword,
          database: connectionDetails.database,
        },
      });
      testConnection = await testKnex.raw("SELECT 1 FROM DUAL");
    } else {
      throw new Error("Unsupported connection type");
    }

    // Destroy the testKnex instance after the connection check
    await testKnex.destroy();

    return !!testConnection;
  } catch (error) {
    console.error("Connection error:", error);
    return false;
  }
}

async function checkFileExistence(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

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

    // Step 4: Check if the connection is working
    const connectionIsValid = await checkConnection(connectionDetails);
    if (!connectionIsValid) {
      return res
        .status(500)
        .json({ message: "Failed to connect to the data source" });
    }

    // If all checks pass, proceed to generate the report
    // Implement your report generation logic here, using `parameters` as needed

    return res.status(200).json({ message: "Report generated successfully" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateReport,
};
