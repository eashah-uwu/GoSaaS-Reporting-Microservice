const knex = require("../config/db/db");
const { encrypt, decrypt } = require("../config/encryption");

class Connection {
  static async create(
    username_p,
    alias_p,
    host_p,
    port_p,
    database_p,
    schema_p,
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
        schema: schema_p,
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
      username,
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
      username,
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
        "username",
        "applicationid",
        "connectionid",
        "schema",
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
    const connection = await knex("connection")
      .select(
        "alias",
        "applicationid",
        "connectionid",
        "database",
        "schema",
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
    if (!connection) {
      throw new Error(`Connection with id ${id} not found`);
    }
    const decryptedPassword = decrypt(connection.password);
    return {
      ...connection,
      password: decryptedPassword,
    };
  }

  static async update(id, data) {
    let {
      alias = "",
      username = "",
      host = "",
      port = -1,
      database = "",
      schema = "", // Add schema to the destructuring
      type = "",
      isactive,
      isdeleted,
      password = "",
    } = data;

    const [prevConnection] = await knex("connection").where({
      connectionid: id,
    });

    if (port === -1) {
      alias = prevConnection.alias;
      username = prevConnection.username;
      host = prevConnection.host;
      port = prevConnection.port;
      database = prevConnection.database;
      schema = prevConnection.schema; // Default to the previous schema if not provided
      type = prevConnection.type;
    } else {
      port = parseInt(port, 10);
    }

    const encryptedPassword = password
      ? encrypt(password)
      : prevConnection.password;

    const [updatedConnection] = await knex("connection")
      .where({ connectionid: id })
      .update(
        {
          username,
          alias,
          host,
          port,
          database,
          schema, // Include schema in the update
          type,
          isactive,
          isdeleted,
          password: encryptedPassword,
          updatedat: new Date(),
        },
        [
          "alias",
          "host",
          "username",
          "port",
          "applicationid",
          "connectionid",
          "database",
          "schema", // Include schema in the return columns
          "type",
          "isactive",
          "isdeleted",
        ]
      );

    return updatedConnection;
  }
  static async findDuplicateUpdate({
    username,
    host,
    port,
    database,
    schema,
    password, // This is the plain text password from the request
    applicationid,
    userid,
    excludeId, // Add excludeId to exclude the current connection
  }) {
    // Find all connections with the matching details except for the password,
    // and where isdeleted is false, excluding the current connection by ID
    const connections = await knex("connection")
      .where({
        username,
        host,
        port,
        database,
        schema,
        applicationid,
        createdby: userid,
        isdeleted: false, // Ensure isdeleted is false
      })
      .whereNot({ connectionid: excludeId }) // Exclude the current connection
      .select("password"); // Only select the password field

    // Iterate through the retrieved connections and compare the passwords
    for (const connection of connections) {
      const decryptedPassword = decrypt(connection.password);
      if (decryptedPassword === password) {
        return connection; // Return the first matching connection
      }
    }

    // Return null if no match is found
    return null;
  }

  static async findDuplicate({
    username,
    host,
    port,
    database,
    schema,
    password, // This is the plain text password from the request
    applicationid,
    userid,
  }) {
    // Find all connections with the matching details except for the password
    const connections = await knex("connection")
      .where({
        username,
        host,
        port,
        database,
        schema,
        applicationid,
        createdby: userid,
        isdeleted: false, // Ensure isdeleted is false
      })
      .select("password"); // Only select the password field

    // Iterate through the retrieved connections and compare the passwords
    for (const connection of connections) {
      const decryptedPassword = decrypt(connection.password);
      if (decryptedPassword === password) {
        return connection; // Return the first matching connection
      }
    }

    // Return null if no match is found
    return null;
  }
  // In Connection model
  static async delete(id) {
    // Start a transaction to ensure both operations succeed or fail together
    return await knex.transaction(async (trx) => {
      // Perform soft delete on the connection
      const [connection] = await trx("connection")
        .where({ connectionid: id })
        .update({ isdeleted: true, updatedat: new Date() })
        .returning("*");

      if (connection) {
        // Perform soft delete on associated report templates
        await trx("report")
          .where({ sourceconnectionid: id })
          .update({ isdeleted: true, updatedat: new Date() });
      }

      return connection;
    });
  }

  static async findByName(alias, userid) {
    return knex("connection")
      .where({ createdby: userid, isdeleted: false })
      .andWhere("alias", "ilike", alias)
      .first();
  }
  static async findByApplicationId({
    applicationid,
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
        "schema",
        "type",
        "host",
        "port",
        "isactive",
        "isdeleted"
      )
      .where({ applicationid: applicationid, isdeleted: false })
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
    } else {
      baseQuery.orderBy("alias", "asc");
    }

    return baseQuery.offset(offset).limit(limit);
  }
  static async batchChangeStatus(ids, status) {
    const isActive = status === 'active';
    return knex("connection")
      .whereIn("connectionid", ids)
      .update({ isactive:isActive, updatedat: new Date() })
      .returning("*");
  }
  static async countSearchResults(applicationid, query, filters = {}) {
    let baseQuery = knex("connection")
      .count({ count: "*" })
      .where({ applicationid: applicationid, isdeleted: false })
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
  static async findByIds(ids) {
    return knex("connection")
      .whereIn("connectionid", ids)
      .andWhere({ isdeleted: false })
      .returning("*");
  }

  static async deleteMultiple(ids) {
    const connections = await knex("connection")
      .whereIn("connectionid", ids)
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");
    return connections;
  }
}

module.exports = Connection;
