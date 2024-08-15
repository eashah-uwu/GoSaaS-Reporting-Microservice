const knex = require("knex");
const debug = require("debug");

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

    console.log("Using PostgreSQL config:", this.config);

    // Initialize knex with the essential PostgreSQL configuration
    this.knex = knex({
      client: "pg",
      connection: this.config,
    });
  }
  async testConnection() {
    try {
      await this.knex.raw("SELECT 1+1 AS result");
      debug("Connection successful");
      return {
        success: true,
        message: "Connection successful",
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
      debug("PostgreSQL connection pool has been closed");
    } catch (error) {
      debug("Error closing the PostgreSQL connection pool:", error);
      throw error;
    }
  }
  async getStoredProcedures() {
    try {
      const result = await this.knex.raw(
        `SELECT routine_name FROM information_schema.routines WHERE routine_type='PROCEDURE' AND specific_schema='public'`
      );
      return result.rows.map((row) => ({ name: row.routine_name }));
    } catch (error) {
      throw new Error("Failed to retrieve stored procedures: " + error.message);
    }
  }
}

module.exports = PostgreSQLConnection;
