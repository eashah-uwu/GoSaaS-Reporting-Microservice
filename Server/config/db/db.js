const config = require("config");
const knex = require("knex");
console.log(
  config.get("db.host"),
  config.get("db.database"),
  config.get("db.password")
);
const dbConfig = {
  client: "pg",
  connection: {
    host: config.get("db.host"),
    user: config.get("db.user"),
    password: config.get("db.password"),
    database: config.get("db.database"),
    port: config.get("db.port"),
  },
};

const knexInstance = knex(dbConfig);

module.exports = knexInstance;
