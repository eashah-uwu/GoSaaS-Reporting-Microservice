const knex = require("../config/db/db");

class Report {
  static async create(data) {
    const {
      title,
      description,
      generationdate,
      parameters,
      sourceconnectionid,
      destinationid,
      applicationid,
      storedprocedureid,
      userid,
      createdby,
    } = data;
    const [report] = await knex("report")
      .insert({
        title,
        description,
        generationdate: new Date(generationdate),
        parameters: JSON.stringify(parameters), // Ensure parameters are stored as JSON
        sourceconnectionid: sourceconnectionid,
        destinationid: destinationid,
        applicationid: applicationid,
        storedprocedureid: storedprocedureid,
        userid: userid,
        createdat: new Date(),
        createdby: createdby,
      })
      .returning("*");
    return report;
  }

  static async findById(id) {
    return knex("report").where({ reportid: id }).first();
  }

  static async update(id, data) {
    const {
      title,
      description,
      generationdate,
      parameters,
      sourceconnectionid,
      destinationid,
      applicationid,
      storedprocedureid,
      userid,
    } = data;
    const [report] = await knex("report")
      .where({ reportid: id })
      .update({
        title,
        description,
        generationdate: new Date(generationdate),
        parameters: parameters ? JSON.stringify(parameters) : null, // Ensure parameters are updated as JSON
        sourceconnectionid: sourceconnectionid,
        destinationid: destinationid,
        applicationid: applicationid,
        storedprocedureid: storedprocedureid,
        userid: userid,
        updatedat: new Date(),
      })
      .returning("*");
    return report;
  }

  static async delete(id) {
    return knex("report").where({ reportid: id }).del();
  }

  static async search({ query, offset, limit, filters, sortField, sortOrder }) {
    let baseQuery = knex("report")
      .select("*")
      .where((builder) => {
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
  
    if (sortField) {
      baseQuery = baseQuery.orderBy(sortField, sortOrder);
    }
  
    return baseQuery.offset(offset).limit(limit);
  }
  

  static async countSearchResults(query, filters) {
    let baseQuery = knex("report")
      .count({ count: "*" })
      .where((builder) => {
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
<<<<<<< Updated upstream
    return count.count;
=======
    return parseInt(count.count, 10);
>>>>>>> Stashed changes
  }
  static async findByApplicationId(applicationid) {
    return knex("report").where({
      applicationid: applicationid,
    });
  }
}

module.exports = Report;
