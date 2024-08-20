const knex = require("../config/db/db");

class Application {
  static async create(data,userid) {
    const {
      name,
      description,
      isactive = true,
      createdby = userid,
      updatedby = userid,
      isdeleted = false,
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

    const [formattedApplication] = await knex("application")
      .select(
        'applicationid',
        knex.raw(`to_char("createdat", 'YYYY-MM-DD') as "createdat"`),
        'isactive',
        'isdeleted',
        'name'
      )
      .where('applicationid', application.applicationid);

    return formattedApplication;
  }

  static async findAll() {
    return knex("application").select("*").where({ isdeleted: false });
  }
  static async findByName(name) {
    return knex("application").where({ name }).first();
  }

  static async findById(id) {
    return knex("application")
      .where({ applicationid: id, isdeleted: false })
      .first();
  }

  static async update(id, data) {
    let { name, isactive, isdeleted,description=""} = data;
    const [prevApplication] = await knex("application").where({
      applicationid: id,
    });
    if(!description){
      description=prevApplication.description
    }
    const [application] = await knex("application")
      .where({ applicationid: id })
      .update({
        ...prevApplication,
        name: name,
        isactive: isactive,
        isdeleted: isdeleted,
        description:description,
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

  static async find({ query, offset, limit, filters = {},userid }) {
    let baseQuery = knex("application")
      .select(
        "applicationid",
        "name",
        "isactive",
        "isdeleted",
        knex.raw(`to_char("createdat", 'YYYY-MM-DD') as "createdat"`)
      )
      .where({ userid: userid, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("createdat", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });
  
    if (filters.status) {
      if (filters.status === "active") baseQuery.andWhere("isactive", true);
      if (filters.status === "inactive") baseQuery.andWhere("isactive", false);
      if (filters.status === "delete") baseQuery.andWhere("isdeleted", true);
    }
    if (filters.sortField) {
      const sortOrder = filters.sortOrder === "desc" ? "desc" : "asc";
      baseQuery.orderBy(filters.sortField, sortOrder);
    }
  
    return baseQuery.offset(offset).limit(limit);
  }
  

  static async countSearchResults(query, filters = {},userid) {
    let baseQuery = knex("application")
      .count({ count: "*" })
      .where({ userid: userid, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("createdat", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });

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
