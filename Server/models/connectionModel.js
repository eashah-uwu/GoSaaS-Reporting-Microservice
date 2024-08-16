const knex = require("../config/db/db");
const { encrypt, decrypt } = require("../config/encryption");

class Connection {
  static async create(
    username_p,
    alias_p,
    host_p,
    port_p,
    database_p,
    type_p,
    password_p,
    applicationid_p,
    createdby_p,
    updatedby_p
  ) {
    // Encrypt the password before saving it to the database
    const encryptedPassword = encrypt(password_p);

    // Insert the new connection into the database and return the created record
    const [connection] = await knex("connection")
      .insert({
        username: username_p,
        alias: alias_p,
        host: host_p,
        port: port_p,
        database: database_p,
        type: type_p,
        isactive: true,
        isdeleted: false,
        password: encryptedPassword, // Save the encrypted password
        applicationid: applicationid_p,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: createdby_p,
        updatedby: updatedby_p,
      })
      .returning("*");
    const {
      alias,
      host,
      port,
      applicationid,
      connectionid,
      database,
      type,
      isactive,
      isdeleted,
    } = connection;
    return {
      alias,
      host,
      port,
      applicationid,
      connectionid,
      database,
      type,
      isactive,
      isdeleted,
    };
  }

  static async findAll() {
    return knex("connection").select("*").where({ isdeleted: false });
  }
  static async find({ query, offset, limit, filters = {} }) {
    let baseQuery = knex("connection")
      .select(
        "alias",
        "applicationid",
        "connectionid",
        "database",
        "type",
        "host",
        "port",
        "isactive",
        "isdeleted"
      )
      .where({ isdeleted: false })
      .andWhere((builder) => {
        if (query && query !== "") {
          builder
            .where("alias", "ilike", `%${query}%`)
            .orWhere("database", "ilike", `%${query}%`)
            .orWhere("type", "ilike", `%${query}%`)
            .orWhere("host", "ilike", `%${query}%`);

          // Only add the port condition if query is not empty
          if (query !== "") {
            builder.orWhere(
              knex.raw("CAST(port AS TEXT)"),
              "ilike",
              `%${query}%`
            );
          }
        }
      });

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

  static async findById(id) {
    return knex("connection")
      .select(
        "alias",
        "applicationid",
        "connectionid",
        "database",
        "type",
        "host",
        "port",
        "isactive",
        "isdeleted",
        "password",
        "username"
      )
      .where({ connectionid: id, isdeleted: false })
      .first();
  }

  static async update(id, data) {
    const { alias, host, port, database, type, isactive, isdeleted, password } =
      data;

    const [prevConnection] = await knex("connection").where({
      connectionid: id,
    });

    const encryptedPassword = password
      ? encrypt(password)
      : prevConnection.password;

    const [connection] = await knex("connection")
      .where({ connectionid: id })
      .update({
        ...prevConnection,
        isactive: isactive,
        isdeleted: isdeleted,
        alias: alias,
        host: host,
        port: port,
        database: database,
        type: type,
        password: encryptedPassword, // Update with the encrypted password
        updatedat: new Date(),
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

  static async findByApplicationId({
    applicationId,
    query,
    offset,
    limit,
    filters = {},
  }) {
    let baseQuery = knex("connection")
      .select(
        "alias",
        "applicationid",
        "connectionid",
        "database",
        "type",
        "host",
        "port",
        "isactive",
        "isdeleted"
      )
      .where({ applicationid: applicationId, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("database", "ilike", `%${query}%`)
          .orWhere("type", "ilike", `%${query}%`)
          .orWhere("host", "ilike", `%${query}%`)
          .orWhere(knex.raw("CAST(port AS TEXT)"), "ilike", `%${query}%`);
      });

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

  static async countSearchResults(applicationId, query, filters = {}) {
    let baseQuery = knex("connection")
      .count({ count: "*" })
      .where({ applicationid: applicationId, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("database", "ilike", `%${query}%`)
          .orWhere("type", "ilike", `%${query}%`)
          .orWhere("host", "ilike", `%${query}%`)
          .orWhere(knex.raw("CAST(port AS TEXT)"), "ilike", `%${query}%`);
      });

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
