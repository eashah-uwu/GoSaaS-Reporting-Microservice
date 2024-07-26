const { Pool } = require("pg");
const config = require("config");
require("dotenv").config();

// Retrieve default database configuration from the config file
const defaultDbConfig = config.get("db");

// Create a database configuration object
const dbConfig = {
  host: process.env.PGHOST || defaultDbConfig.host,
  port: parseInt(process.env.PGPORT, 10) || defaultDbConfig.port,
  database: process.env.PGDATABASE || defaultDbConfig.database,
  user: process.env.PGUSER || defaultDbConfig.user,
  password: process.env.PGPASSWORD || defaultDbConfig.password,
};

// Create a new Pool instance using the configuration
const pool = new Pool(dbConfig);

module.exports = pool;
