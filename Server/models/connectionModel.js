const knex = require("../config/db/db");

class Connection {
  static async create(data) {
    const { alias, host, port, database, type, isActive, isDeleted, password, applicationID, createdBy, updatedBy } = data;
    const [connection] = await knex("connection")
      .insert({
        alias: alias,
        host: host,
        port: port,
        database: database,
        type: type,
        isactive: isActive,
        isdeleted: isDeleted,
        password: password,
        applicationid: applicationID,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: createdBy,
        updatedby: updatedBy,
      })
      .returning("*");
    return connection;
  }

  static async findAll() {
    return knex("connection").select("*").where({ isdeleted: false });
  }

  static async findById(id) {
    return knex("connection").where({ connectionid: id, isdeleted: false }).first();
  }

  static async update(id, data) {
    const { alias, host, port, database, type, isActive, isDeleted, password, updatedBy } = data;
    const [connection] = await knex("connection")
      .where({ connectionid: id })
      .update({
        alias: alias,
        host: host,
        port: port,
        database: database,
        type: type,
        isactive: isActive,
        isdeleted: isDeleted,
        password: password,
        updatedat: new Date(),
        updatedby: updatedBy,
      })
      .returning("*");
    return connection;
  }

  static async delete(id) {
    const [connection] = await knex("connection")
      .where({ connectionid: id })
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");
    return connection;
  }
}

module.exports = Connection;
