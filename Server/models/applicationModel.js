const knex = require("../config/db/db");

class Application {
  static async create(data) {
    const { name, description, isActive, userID, createdBy, updatedBy, isDeleted } = data;
    const [application] = await knex("application")
      .insert({
        name: name,
        description: description,
        isactive: isActive,
        userid: userID,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: createdBy,
        updatedby: updatedBy,
        isdeleted: isDeleted,
      })
      .returning("*");
    return application;
  }

  static async findAll() {
    return knex("application")
      .select("*")
      .where({ isdeleted: false });
  }

  static async findById(id) {
    return knex("application")
      .where({ applicationid: id, isdeleted: false })
      .first();
  }

  static async update(id, data) {
    const { name, description, isActive, updatedBy, isDeleted } = data;
    const [application] = await knex("application")
      .where({ applicationid: id })
      .update({
        name: name,
        description: description,
        isactive: isActive,
        updatedat: new Date(),
        updatedby: updatedBy,
        isdeleted: isDeleted,
      })
      .returning("*");
    return application;
  }

  static async delete(id) {
    const [application] = await knex("application")
      .where({ applicationid: id })
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");
    return application;
  }
}

module.exports = Application;
