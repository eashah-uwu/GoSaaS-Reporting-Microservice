const knex = require("../config/db/db");

class Application {
  static async create(data) {
    const { name, description, isActive, userID, createdBy, updatedBy } = data;
    const [application] = await knex("application")
      .insert({
        name,
        description,
        isactive: isActive,
        userid: userID,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: createdBy,
        updatedby: updatedBy,
      })
      .returning("*");
    return application;
  }

  static async findAll() {
    return knex("application").select("*");
  }

  static async findById(id) {
    return knex("application").where({ applicationid: id }).first();
  }

  static async update(id, data) {
    const { name, description, isActive, updatedBy } = data;
    const [application] = await knex("application")
      .where({ applicationid: id })
      .update({
        name,
        description,
        isactive: isActive,
        updatedat: new Date(),
        updatedby: updatedBy,
      })
      .returning("*");
    return application;
  }

  static async delete(id) {
    const [application] = await knex("application")
      .where({ application_id: id })
      .del()
      .returning("*");
    return application;
  }
}

module.exports = Application;