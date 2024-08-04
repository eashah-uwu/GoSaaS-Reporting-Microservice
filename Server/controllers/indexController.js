const knex = require("../config/db/db");
const logger = require("../logger");
const asyncHandler = require("express-async-handler");

const checkDatabaseConnection = asyncHandler(async (req, res) => {
  // Example query to check database connection
  const result = await knex.raw("SELECT NOW()");

  // Log successful database connection check
  logger.info("Database connection check successful", {
    time: result.rows[0].now,
  });

  res.json({
    message: "Welcome to the Express app with knex!",
    time: result.rows[0].now,
  });
});

module.exports = checkDatabaseConnection;
