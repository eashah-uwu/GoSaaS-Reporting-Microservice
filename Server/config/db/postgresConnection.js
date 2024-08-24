const knex = require("knex");
const logger = require("../../logger");

class PostgreSQLConnection {
  constructor(config) {
    this.config = config;

    if (this.config.port) {
      this.config.port = Number(this.config.port);
    }

    if (this.config.schema) {
      this.knexConfig = {
        client: "pg",
        connection: {
          host: this.config.host,
          user: this.config.username,
          password: this.config.password,
          database: this.config.database,
          port: this.config.port,
          searchPath: this.config.schema,
        },
      };
      logger.info("Using PostgreSQL config with schema:", this.knexConfig);
    } else {
      this.knexConfig = {
        client: "pg",
        connection: {
          host: this.config.host,
          user: this.config.username,
          password: this.config.password,
          database: this.config.database,
          port: this.config.port,
        },
      };
      logger.info("Using PostgreSQL config without schema:", this.knexConfig);
    }

    this.knex = knex(this.knexConfig);
  }

  async testConnection() {
    try {
      const schemaExistsQuery = `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.schemata
          WHERE schema_name = '${this.config.schema || "public"}'
        ) AS schema_exists;
      `;
      const schemaExistsResult = await this.knex.raw(schemaExistsQuery);

      if (schemaExistsResult.rows[0].schema_exists) {
        await this.knex.raw("SELECT 1+1 AS result");
        const storedProcedures = await this.getStoredProcedures();
        return {
          success: true,
          message: "Connection successful",
          storedProcedures,
        };
      } else {
        throw new Error(
          `Schema '${this.config.schema || "public"}' does not exist.`
        );
      }
    } catch (error) {
      logger.error("Error connecting to PostgreSQL:", error);
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
      logger.info("Stored procedures:", storedProcedures);
      return storedProcedures;
    } catch (error) {
      logger.error("Error fetching stored procedures:", error);
      return {
        success: false,
        message: "Failed to establish PostgreSQL connection",
        error,
      };
    }
  }

  async getStoredProcedures() {
    try {
      // Use this.config.schema if it exists, otherwise default to 'public'
      const schema = this.config.schema || "public";

      const result = await this.knex.raw(`
      SELECT
        p.proname AS procedure_name,
        pg_catalog.pg_get_function_identity_arguments(p.oid) AS parameter_list
      FROM
        pg_catalog.pg_proc p
      JOIN
        pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      WHERE
        n.nspname = '${schema}'
      ORDER BY
        p.proname;
    `);

      return result.rows;
    } catch (error) {
      logger.error("Error fetching stored procedures:", error);
      throw error;
    }
  }

  async closePool() {
    try {
      await this.knex.destroy();
      logger.info("PostgreSQL pool has been closed");
    } catch (error) {
      logger.error("Error closing the PostgreSQL pool:", error);
      throw error;
    }
  }
}

module.exports = PostgreSQLConnection;
