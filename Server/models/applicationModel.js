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
    return knex("application").select("applicationid", "name", "isactive", "isdeleted", "createdat");
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
  static async paginate({ offset, limit }) {
    return knex("application")
      .select("applicationid", 
              "name", 
              "isactive",
              "isdeleted", 
              knex.raw(`to_char("createdat", 'YYYY-MM-DD') as "createdat"`))
      .where("isdeleted", false)
      .offset(offset)
      .limit(limit);
  }

  static async countAll() {
    const [count] = await knex("application")
      .count({ count: "*" })
      .where("isdeleted", false);
    return count.count;
  }

  static async search({ query, offset, limit }) {
    const results = await knex("application")
      .select("applicationid", "name", "isactive", "isdeleted", knex.raw(`to_char("createdat", 'YYYY-MM-DD') as "createdat"`))
      .where("isdeleted", false)
      .andWhere((builder) => {
        builder
          .where("name", "ilike", `%${query}%`)
          .orWhere(knex.raw(`CAST("createdat" AS TEXT)`), "ilike", `%${query}%`);
      })
      .offset(offset)
      .limit(limit);
    return results;
  }

  static async countSearchResults(query) {
    const [count] = await knex("application")
      .count({ count: "*" })
      .where("isdeleted", false)
      .andWhere((builder) => {
        builder
          .where("name", "ilike", `%${query}%`)
          .orWhere(knex.raw(`CAST("createdat" AS TEXT)`), "ilike", `%${query}%`);
      });
    return count.count;
  }


}

module.exports = Application;
