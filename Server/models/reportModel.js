const knex = require("../config/db/db");

class Report {
  static async create(data) {
    const { title, description, generationDate, parameters, sourceConnectionID, destinationID, applicationID, storedProcedureID, userID, createdBy } = data;
    const [report] = await knex("report")
      .insert({
        title,
        description,
        generationdate: new Date(generationDate),
        parameters: JSON.stringify(parameters), // Ensure parameters are stored as JSON
        sourceconnectionid: sourceConnectionID,
        destinationid: destinationID,
        applicationid: applicationID,
        storedprocedureid: storedProcedureID,
        userid: userID,
        createdat: new Date(),
        createdby: createdBy
      })
      .returning("*");
    return report;
  }

  static async findAll() {
    return knex("report").select("*");
  }

  static async findById(id) {
    return knex("report")
      .where({ reportid: id })
      .first();
  }

  static async update(id, data) {
    const { title, description, generationDate, parameters, sourceConnectionID, destinationID, applicationID, storedProcedureID, userID } = data;
    const [report] = await knex("report")
      .where({ reportid: id })
      .update({
        title,
        description,
        generationdate: new Date(generationDate),
        parameters: parameters ? JSON.stringify(parameters) : null, // Ensure parameters are updated as JSON
        sourceconnectionid: sourceConnectionID,
        destinationid: destinationID,
        applicationid: applicationID,
        storedprocedureid: storedProcedureID,
        userid: userID,
        updatedat: new Date()
      })
      .returning("*");
    return report;
  }

  static async delete(id) {
    return knex("report")
      .where({ reportid: id })
      .del();
  }

  static async paginate({ offset, limit }) {
    return knex("report")
      .select("*")
      .offset(offset)
      .limit(limit);
  }

  static async search({ query, offset, limit, filters, sortField, sortOrder }) {
    let baseQuery = knex("report")
      .select("*")
      .where(builder => {
        builder
          .where("title", "ilike", `%${query}%`)
          .orWhere("description", "ilike", `%${query}%`);
      });

    if (filters) {
      if (filters.title) {
        baseQuery = baseQuery.andWhere("title", "ilike", `%${filters.title}%`);
      }
      if (filters.date) {
        baseQuery = baseQuery.andWhere("generationdate", "=", filters.date);
      }
    }

    if (sortField && sortField !== "None") {
      baseQuery = baseQuery.orderBy(sortField, sortOrder);
    }

    const results = await baseQuery.offset(offset).limit(limit);
    return results;
  }

  static async countSearchResults(query, filters) {
    let baseQuery = knex("report")
      .count({ count: "*" })
      .where(builder => {
        builder
          .where("title", "ilike", `%${query}%`)
          .orWhere("description", "ilike", `%${query}%`);
      });

    if (filters) {
      if (filters.title) {
        baseQuery = baseQuery.andWhere("title", "ilike", `%${filters.title}%`);
      }
      if (filters.date) {
        baseQuery = baseQuery.andWhere("generationdate", "=", filters.date);
      }
    }

    const [count] = await baseQuery;
    return count.count;
  }
}

module.exports = Report;
