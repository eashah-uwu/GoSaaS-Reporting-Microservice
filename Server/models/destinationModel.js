const knex = require("../config/db/db");

class Destination {
  // Create a new destination
  static async create(alias_p,url_p,apikey_p,applicationId_p,userId_p) {
    // Insert data into the database
    const [destination] = await knex("destination")
      .insert({
        alias: alias_p,
        url: url_p,
        apikey: apikey_p, // Note the exact column name
        isactive: true, // Note the exact column name
        isdeleted: false, // Note the exact column name
        applicationid: applicationId_p, // Note the exact column name
        createdat: new Date(), // Note the exact column name
        updatedat: new Date(), // Note the exact column name
        createdby: userId_p, // Note the exact column name
        updatedby: userId_p, // Note the exact column name
      })
      .returning("*");
      const {alias,applicationid,destinationid,url,apikey,isactive,isdeleted}=destination
    return {alias,applicationid,destinationid,url,apikey,isactive,isdeleted};
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

  // Update an existing destination
  static async update(id, data) {
    const { alias, url, apikey, isactive, isdeleted } = data;
    const [prevDestination] = await knex("destination")
    .where({ destinationid: id })
    const [destination] = await knex("destination")
    .where({ destinationid: id })
      .update({
        ...prevDestination,
        isactive: isactive,
        isdeleted: isdeleted,
        alias:alias,
        url:url,
        apikey:apikey,
        updatedat: new Date(),
      })
      .returning("*");
    return destination;
  }

  // Delete a destination by ID (soft delete)
  static async delete(id) {
    const [destination] = await knex("destination")
      .where({ destinationid: id })
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");

    return destination;
  }
  
  static async findByApplicationId({ applicationId, query, offset, limit, filters = {} }) {
    let baseQuery = knex("destination")
      .select(
        "alias",
        "applicationid",
        "destinationid",
        "url",
        "apikey",
        "isactive",
        "isdeleted"
      )
      .where({ applicationid: applicationId, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("url", "ilike", `%${query}%`)
          .orWhere("apikey", "ilike", `%${query}%`);
      });

    // Apply additional filters if provided
    if (filters.alias) {
      baseQuery.andWhere("alias", "ilike", `%${filters.alias}%`);
    }
    if (filters.url) {
      baseQuery.andWhere("url", "ilike", `%${filters.url}%`);
    }
    if (filters.apikey) {
      baseQuery.andWhere("apikey", "ilike", `%${filters.apikey}%`);
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

  static async countSearchResults(applicationId, query, filters = {}) {
    let baseQuery = knex("destination")
      .count({ count: "*" })
      .where({ applicationid: applicationId, isdeleted: false })
      .andWhere((builder) => {
        builder
          .where("alias", "ilike", `%${query}%`)
          .orWhere("url", "ilike", `%${query}%`)
          .orWhere("apikey", "ilike", `%${query}%`);
      });

    if (filters.alias) {
      baseQuery.andWhere("alias", "ilike", `%${filters.alias}%`);
    }
    if (filters.url) {
      baseQuery.andWhere("url", "ilike", `%${filters.url}%`);
    }
    if (filters.apikey) {
      baseQuery.andWhere("apikey", "ilike", `%${filters.apikey}%`);
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

module.exports = Destination;
