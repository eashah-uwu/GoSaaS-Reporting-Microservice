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
      const storedProcedures = await this.getStoredProcedures();
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
  async getStoredProceduresData() {
    try {
      const storedProcedures = await this.getStoredProcedures();
      console.log("Stored procedures:", storedProcedures);
      return storedProcedures;
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
    try {
      const result = await this.knex.raw(`
        SELECT
          p.proname AS procedure_name,
          pg_catalog.pg_get_function_identity_arguments(p.oid) AS parameter_list
        FROM
          pg_catalog.pg_proc p
        JOIN
          pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE
          n.nspname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY
          p.proname;
      `);
      return result.rows;
    } catch (error) {
      console.error("Error fetching stored procedures:", error);
      throw error;
    }
  }

  async closePool() {
    try {
      await this.knex.destroy();
      debug("PostgreSQL pool has been closed");
    } catch (error) {
      debug("Error closing the PostgreSQL pool:", error);
      throw error;
    }
  }
}

module.exports = PostgreSQLConnection;
