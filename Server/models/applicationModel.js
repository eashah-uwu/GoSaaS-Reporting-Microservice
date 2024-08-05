const knex = require("../config/db/db");

class Application {
  static async create(data) {
    const {
      name,
      description,
      isactive,
      userid,
      createdby,
      updatedby,
      isdeleted,
    } = data;
    const [application] = await knex("application")
      .insert({
        name: name,
        description: description,
        isactive: isactive,
        userid: userid,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: createdby,
        updatedby: updatedby,
        isdeleted: isdeleted,
      })
      .returning("*");
    return application;
  }

  static async findAll() {
    return knex("application").select("*").where({ isdeleted: false });
  }
  static async findByName(name) {
    return db("application").where({ name }).first();
  }

  static async findById(id) {
    return knex("application")
      .where({ applicationid: id, isdeleted: false })
      .first();
  }

  static async update(id, data) {
    const { name, isactive, isdeleted } = data;
    const [prevApplication] = await knex("application").where({
      applicationid: id,
    });
    const [application] = await knex("application")
      .where({ applicationid: id })
      .update({
        ...prevApplication,
        name: name,
        isactive: isactive,
        isdeleted: isdeleted,
        updatedat: new Date(),
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

  static async countAll() {
    const [{ count }] = await knex("application")
      .count({ count: "*" })
      .where("isdeleted", false);
    return count;
  }

  static async filter({ query, offset, limit, filters = {} }) {
    let baseQuery = knex("application")
      .select(
        "applicationid",
        "name",
        "isactive",
        "isdeleted",
        knex.raw(`to_char("createdat", 'YYYY-MM-DD') as "createdat"`)
      )
      .where("isdeleted", false)
      .andWhere((builder) => {
        builder
          .where("name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("createdat", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });

    if (filters.name) {
      baseQuery.andWhere("name", "ilike", `%${filters.name}%`);
    }
    if (filters.status) {
      if (filters.status === "active") baseQuery.andWhere("isactive", true);
      if (filters.status === "inactive") baseQuery.andWhere("isactive", false);
      if (filters.status === "delete") baseQuery.andWhere("isdeleted", true);
    }
    if (filters.sortField && filters.sortField !== "None") {
      baseQuery.orderBy(filters.sortField, filters.sortOrder || "asc");
    }

    return baseQuery.offset(offset).limit(limit);
  }

  static async countSearchResults(query, filters = {}) {
    let baseQuery = knex("application")
      .count({ count: "*" })
      .where("isdeleted", false)
      .andWhere((builder) => {
        builder
          .where("name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("createdat", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });

    if (filters.name) {
      baseQuery.andWhere("name", "ilike", `%${filters.name}%`);
    }
    if (filters.status) {
      if (filters.status === "active") baseQuery.andWhere("isactive", true);
      if (filters.status === "inactive") baseQuery.andWhere("isactive", false);
      if (filters.status === "delete") baseQuery.andWhere("isdeleted", true);
    }

    const [{ count }] = await baseQuery;
    return count;
  }
}

module.exports = Application;
