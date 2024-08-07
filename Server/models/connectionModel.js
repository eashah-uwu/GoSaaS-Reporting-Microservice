const knex = require("../config/db/db");

class Connection {
  static async create(data) {
    const {
      alias,
      host,
      port,
      database,
      type,
      isactive,
      isdeleted,
      password,
      applicationid,
      createdby,
      updatedby,
    } = data;
    const [connection] = await knex("connection")
      .insert({
        alias: alias,
        host: host,
        port: port,
        database: database,
        type: type,
        isactive: isactive,
        isdeleted: isdeleted,
        password: password,
        applicationid: applicationid,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: createdby,
        updatedby: updatedby,
      })
      .returning("*");
    return connection;
  }

  static async findAll() {
    return knex("connection").select("*").where({ isdeleted: false });
  }

  static async findById(id) {
    return knex("connection")
      .select("alias","applicationid","connectionid","database","type","host","port","isactive","isdeleted")
      .where({ applicationid: id, isdeleted: false })
      .first();
  }

  static async update(id, data) {
    const {
      alias,
      host,
      port,
      database,
      type,
      isactive,
      isdeleted,
      password,
      updatedby,
    } = data;
    const [connection] = await knex("connection")
      .where({ connectionid: id })
      .update({
        alias: alias,
        host: host,
        port: port,
        database: database,
        type: type,
        isactive: isactive,
        isdeleted: isdeleted,
        password: password,
        updatedat: new Date(),
        updatedby: updatedby,
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
