const knex = require("../config/db/db");
const logger = require("../logger");

const checkDatabaseConnection = async () => {
  // Example query to check database connection
  const result = await knex.raw("SELECT NOW()");

  // Log successful database connection check
  logger.info("Database connection check successful", {
    time: result.rows[0].now,
  });
  return true;
};

module.exports = checkDatabaseConnection;
