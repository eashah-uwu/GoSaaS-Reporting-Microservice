const PostgreSQLConnection = require("./postgresConnection");
const OracleDBConnection = require("./oracleConnection");

class ConnectionFactory {
  static createConnection(connection_type, config) {
    switch (connection_type) {
      case "PostgreSQL":
        return new PostgreSQLConnection(config);
      case "Oracle":
        return new OracleDBConnection(config);
      default:
        throw new Error("Unsupported connection type");
    }
  }
}

module.exports = ConnectionFactory;
