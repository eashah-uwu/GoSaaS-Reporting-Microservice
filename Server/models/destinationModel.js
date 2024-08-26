const knex = require("../config/db/db");

class Destination {
  // Create a new destination
  static async create(
    alias_p,
    destination_p,
    url_p,
    apikey_p,
    bucketName_p,
    applicationId_p,
    userId_p
  ) {
    // Insert data into the database
    const [destination] = await knex("destination")
      .insert({
        alias: alias_p,
        url: url_p,
        cloudprovider: destination_p,
        apikey: apikey_p, // Note the exact column name
        bucketname: bucketName_p,
        isactive: true, // Note the exact column name
        isdeleted: false, // Note the exact column name
        applicationid: applicationId_p, // Note the exact column name
        createdat: new Date(), // Note the exact column name
        updatedat: new Date(), // Note the exact column name
        createdby: userId_p, // Note the exact column name
        updatedby: userId_p, // Note the exact column name
      })
      .returning("*");
    const {
      alias,
      applicationid,
      destinationid,
      url,
      apikey,
      bucketname,
      isactive,
      isdeleted,
    } = destination;
    return {
      alias,
      applicationid,
      destinationid,
      url,
      apikey,
      bucketname,
      isactive,
      isdeleted,
    };
  }

  // Retrieve all destinations
  static async findAll() {
    return knex("destination").select("*").where({ isdeleted: false });
  }

  // Retrieve destination by ID
  static async findById(id) {
    return knex("destination")
      .where({ destinationid: id, isdeleted: false })
      .first();
  }

  static async findDuplicate(
    url,
    apiKey,
    bucketname,
    applicationId,
    userid,
    destination
  ) {
    const destinations = await knex("destination")
      .where({
        url,
        apikey: apiKey,
        bucketname: bucketname,
        applicationid: applicationId,
        createdby: userid,
        cloudprovider: destination,
        isdeleted: false,
      })
      .select("*");

    return destinations;
  }

  // Update an existing destination
  static async update(id, data) {
    const { alias, destination, url, apikey, bucketName, isactive, isdeleted } =
      data;
    const [prevDestination] = await knex("destination").where({
      destinationid: id,
    });
    const [destination_r] = await knex("destination")
      .where({ destinationid: id })
      .update({
        ...prevDestination,
        isactive: isactive,
        isdeleted: isdeleted,
        alias: alias,
        cloudprovider: destination,
        url: url,
        apikey: apikey,
        bucketname: bucketName,
        updatedat: new Date(),
      })
      .returning("*");
    return destination_r;
  }
  static async batchChangeStatus(ids, status) {
    const isActive = status === "active";
    return knex("destination")
      .whereIn("destinationid", ids)
      .update({ isactive: isActive, updatedat: new Date() })
      .returning("*");
  }
  // Delete a destination by ID (soft delete)
  static async delete(id) {
    const [destination] = await knex("destination")
      .where({ destinationid: id })
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");

    return destination;
  }

  static async findByName(alias, applicationid) {
    return knex("destination")
      .where({ applicationid: applicationid, isdeleted: false })
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
    let baseQuery = knex("destination")
      .select(
        "alias",
        "applicationid",
        "destinationid",
        "cloudprovider",
        "url",
        "apikey",
        "bucketname",
        "isactive",
        "isdeleted"
      )
      .where({ applicationid, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("url", "ilike", `%${query}%`)
          .orWhere("apikey", "ilike", `%${query}%`);
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
      baseQuery.orderBy("createdat", "desc");
    }

    return baseQuery.offset(offset).limit(limit);
  }

  static async countSearchResults(applicationid, query, filters = {}) {
    let baseQuery = knex("destination")
      .count({ count: "*" })
      .where({ applicationid, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("url", "ilike", `%${query}%`)
          .orWhere("apikey", "ilike", `%${query}%`);
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
    return knex("destination")
      .whereIn("destinationid", ids)
      .andWhere({ isdeleted: false })
      .returning("*");
  }

  static async deleteMultiple(ids) {
    const destinations = await knex("destination")
      .whereIn("destinationid", ids)
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");
    return destinations;
  }
  static async deleteByApplicationIds(ids) {
    const connections = await knex("destination")
      .whereIn("applicationid", ids)
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");
    return connections;
  }
}

module.exports = Destination;
