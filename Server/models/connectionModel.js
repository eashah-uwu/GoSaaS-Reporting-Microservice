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
        alias,
        host,
        port,
        database,
        type,
        isactive,
        isdeleted,
        password,
        applicationid,
        createdat: new Date(),
        updatedat: new Date(),
        createdby,
        updatedby,
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
        alias,
        host,
        port,
        database,
        type,
        isactive,
        isdeleted,
        password,
        updatedat: new Date(),
        updatedby,
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

  static async find({ query, offset, limit, filters = {} }) {
    let baseQuery = knex("connection")
      .select(
        "connectionid",
        "alias",
        "host",
        "port",
        "database",
        "type",
        "isactive",
        knex.raw(`to_char("createdat", 'YYYY-MM-DD') as "createdat"`)
      )
      .where("isdeleted", false)
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("database", "ilike", `%${query}%`)
          .orWhere("type", "ilike", `%${query}%`)
          .orWhere("host", "ilike", `%${query}%`);
      });
  
    // Apply additional filters if provided
    if (filters.alias) {
      baseQuery.andWhere("alias", "ilike", `%${filters.alias}%`);
    }
    if (filters.database) {
      baseQuery.andWhere("database", "ilike", `%${filters.database}%`);
    }
    if (filters.type) {
      baseQuery.andWhere("type", "ilike", `%${filters.type}%`);
    }
    if (filters.host) {
      baseQuery.andWhere("host", "ilike", `%${filters.host}%`);
    }
    if (filters.status) {
      if (filters.status === "active") baseQuery.andWhere("isactive", true);
      if (filters.status === "inactive") baseQuery.andWhere("isactive", false);
      if (filters.status === "deleted") baseQuery.andWhere("isdeleted", true);
    }
  
    // Apply sorting if sortField is provided
    if (filters.sortField && filters.sortField !== "None") {
      baseQuery.orderBy(filters.sortField, filters.sortOrder || "asc");
    }
  
    return baseQuery.offset(offset).limit(limit);
  }
  
  

  static async countSearchResults(query, filters = {}) {
    let baseQuery = knex("connection")
      .count({ count: "*" })
      .where("isdeleted", false)
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("database", "ilike", `%${query}%`)
          .orWhere("type", "ilike", `%${query}%`)
          .orWhere("host", "ilike", `%${query}%`);
      });

    if (filters.alias) {
      baseQuery.andWhere("alias", "ilike", `%${filters.alias}%`);
    }
    if (filters.database) {
      baseQuery.andWhere("database", "ilike", `%${filters.database}%`);
    }
    if (filters.type) {
      baseQuery.andWhere("type", "ilike", `%${filters.type}%`);
    }
    if (filters.host) {
      baseQuery.andWhere("host", "ilike", `%${filters.host}%`);
    }
    if (filters.status) {
      if (filters.status === "active") baseQuery.andWhere("isactive", true);
      if (filters.status === "inactive") baseQuery.andWhere("isactive", false);
      if (filters.status === "deleted") baseQuery.andWhere("isdeleted", true);
    }

    const [{ count }] = await baseQuery;
    return count;
  }
}

module.exports = Connection;
