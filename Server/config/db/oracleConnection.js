const knex = require("knex");
const logger = require("../../logger");

class OracleConnection {
  constructor(config) {
    // Store config as a class property so it can be accessed in other methods
    this.config = config;

    // Convert port to number if defined in the config
    if (this.config.port) {
      this.config.port = Number(this.config.port);
    }

    // Essential Oracle configuration
    this.knexConfig = {
      client: "oracledb",
      connection: {
        host: this.config.host,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port,
      },
    };

    logger.info("Using Oracle config:", this.knexConfig);

    // Initialize knex with the essential Oracle configuration
    this.knex = knex(this.knexConfig);
  }

  async testConnection() {
    try {
      // Check if the schema exists
      const schemaExistsQuery = `
        SELECT COUNT(*) AS schema_exists
        FROM all_schemas
        WHERE schema_name = '${this.config.schema || "PUBLIC"}'
      `;
      const schemaExistsResult = await this.knex.raw(schemaExistsQuery);

      if (schemaExistsResult.rows[0].schema_exists > 0) {
        // Test a simple query to check the connection
        await this.knex.raw("SELECT 1 FROM DUAL");
        logger.info("Connection successful");
        return {
          success: true,
          message: "Connection successful",
        };
      } else {
        throw new Error(
          `Schema '${this.config.schema || "PUBLIC"}' does not exist.`
        );
      }
    } catch (error) {
      logger.error("Error connecting to Oracle:", error);
      return {
        success: false,
        message: "Failed to establish Oracle connection",
        error,
      };
    }
  }

  async closePool() {
    try {
      await this.knex.destroy();
      logger.info("Oracle pool has been closed");
    } catch (error) {
      logger.error("Error closing the Oracle pool:", error);
      throw error;
    }
  }
}

module.exports = OracleConnection;
