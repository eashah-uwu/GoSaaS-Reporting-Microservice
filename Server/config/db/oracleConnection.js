const knex = require("knex");
const debug = require("debug")("oracle-connection");

class OracleConnection {
  constructor(config) {
    // Convert port to number if it is defined in the config
    if (config.port) {
      config.port = Number(config.port);
    }

    // Essential Oracle configuration
    this.config = {
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      port: config.port,
    };

    debug("Using Oracle config:", this.config);
    console.log(this.config);
    // Initialize knex with the essential Oracle configuration
    this.knex = knex({
      client: "oracledb",
      connection: this.config,
    });
  }

  async testConnection() {
    try {
      await this.knex.raw("SELECT 1 FROM DUAL");
      console.log("Connection successful");
      return {
        success: true,
        message: "Connection successful",
      };
    } catch (error) {
      console.error("Error connecting to Oracle:", error);
      return {
        success: false,
        message: "Failed to establish Oracle connection",
        error,
      };
    }
  }
}

module.exports = OracleConnection;
