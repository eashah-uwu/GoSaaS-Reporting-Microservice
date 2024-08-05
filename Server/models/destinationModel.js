const knex = require("../config/db/db");

class Destination {
  // Create a new destination
  static async create(data) {
    const {
      alias,
      url,
      apikey,
      isactive,
      isdeleted,
      applicationid,
      createdby,
      updatedby,
    } = data;

    // Insert data into the database
    const [destination] = await knex("destination")
      .insert({
        alias: alias,
        url: url,
        apikey: apikey, // Note the exact column name
        isactive: isactive, // Note the exact column name
        isdeleted: isdeleted, // Note the exact column name
        applicationid: applicationid, // Note the exact column name
        createdat: new Date(), // Note the exact column name
        updatedat: new Date(), // Note the exact column name
        createdby: createdby, // Note the exact column name
        updatedby: updatedby, // Note the exact column name
      })
      .returning("*");

    return destination;
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
    const { alias, url, apikey, isactive, isdeleted, updatedby } = data;
    const [destination] = await knex("destination")
      .where({ destinationid: id })
      .update({
        alias: alias,
        url: url,
        apikey: apikey, // Note the exact column name
        isactive: isactive, // Note the exact column name
        isdeleted: isdeleted, // Note the exact column name
        updatedat: new Date(), // Note the exact column name
        updatedby: updatedby, // Note the exact column name
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
}

module.exports = Destination;
