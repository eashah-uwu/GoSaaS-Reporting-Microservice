const knex = require("knex");
const debug = require("debug")("postgresql-connection");

class PostgreSQLConnection {
  constructor(config) {
    // Convert port to number if it is defined in the config
    if (config.port) {
      config.port = Number(config.port);
    }

    // Essential PostgreSQL configuration
    this.config = {
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      port: config.port,
    };

    debug("Using PostgreSQL config:", this.config);

    // Initialize knex with the essential PostgreSQL configuration
    this.knex = knex({
      client: "pg",
      connection: this.config,
    });
  }

  async testConnection() {
    try {
      await this.knex.raw("SELECT 1+1 AS result");
      console.log("Connection successful");

      const storedProcedures = await this.getStoredProcedures();
      console.log("Stored procedures:", storedProcedures);

      return {
        success: true,
        message: "Connection successful",
        storedProcedures,
      };
    } catch (error) {
      console.error("Error connecting to PostgreSQL:", error);
      return {
        success: false,
        message: "Failed to establish PostgreSQL connection",
        error,
      };
    }
  }

  async getStoredProcedures() {
    const storedProcedures = await this.knex.raw(`
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      l.lanname AS language,
      p.prokind AS kind
    FROM
      pg_catalog.pg_proc p
    LEFT JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
    LEFT JOIN pg_catalog.pg_language l ON p.prolang = l.oid
    WHERE
      p.prokind = 'p'  -- Filter for procedures only
    ORDER BY
      schema_name, function_name;
  `);

    return storedProcedures.rows;
  }
}

module.exports = PostgreSQLConnection;
