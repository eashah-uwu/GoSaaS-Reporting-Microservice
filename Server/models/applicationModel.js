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

  static async search({ query, offset, limit, filters, sortField, sortOrder }) {
    let baseQuery = knex("application")
        .select("applicationid", "name", "isactive", "isdeleted", knex.raw(`to_char("createdat", 'YYYY-MM-DD') as "createdat"`))
        .where("isdeleted", false)
        .andWhere((builder) => {
            builder
                .where("name", "ilike", `%${query}%`)
                .orWhere(knex.raw(`CAST("createdat" AS TEXT)`), "ilike", `%${query}%`);
        });

    if (filters) {
        if (filters.name) {
            baseQuery = baseQuery.andWhere("name", "ilike", `%${filters.name}%`);
        }
        if (filters.status) {
            if (filters.status === 'active') {
                baseQuery = baseQuery.andWhere("isactive", true);
            } else if (filters.status === 'inactive') {
                baseQuery = baseQuery.andWhere("isactive", false);
            } else if (filters.status === 'delete') {
                baseQuery = baseQuery.andWhere("isdeleted", true);
            }
        }
    }

    if (sortField && sortField !== "None") {
        baseQuery = baseQuery.orderBy(sortField, sortOrder);
    }

    const results = await baseQuery.offset(offset).limit(limit);
    return results;
}


static async countSearchResults(query, filters) {
    let baseQuery = knex("application")
        .count({ count: "*" })
        .where("isdeleted", false)
        .andWhere((builder) => {
            builder
                .where("name", "ilike", `%${query}%`)
                .orWhere(knex.raw(`CAST("createdat" AS TEXT)`), "ilike", `%${query}%`);
        });

    if (filters) {
        if (filters.name) {
            baseQuery = baseQuery.andWhere("name", "ilike", `%${filters.name}%`);
        }
        if (filters.status) {
            if (filters.status === 'active') {
                baseQuery = baseQuery.andWhere("isactive", true);
            } else if (filters.status === 'inactive') {
                baseQuery = baseQuery.andWhere("isactive", false);
            } else if (filters.status === 'delete') {
                baseQuery = baseQuery.andWhere("isdeleted", true);
            }
        }
    }

    const [count] = await baseQuery;
    return count.count;
}


}

module.exports = Application;
