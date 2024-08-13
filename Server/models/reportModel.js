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
  static async findByTitle(title) {
    return knex("report").select("*").where({ title }).first();
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

  static async countSearchResults(applicationId, query, filters) {
    let baseQuery = knex("report")
      .count({ count: "*" })
      .leftJoin("connection as sc", "report.sourceconnectionid", "sc.connectionid")
      .leftJoin("destination as d", "report.destinationid", "d.destinationid")
      .leftJoin("storedprocedure as sp", "report.storedprocedureid", "sp.storedprocedureid")
      .where({ "report.applicationid": applicationId })
      .where((builder) => {
        builder
          .where("report.title", "ilike", `%${query}%`)
          .orWhere("report.description", "ilike", `%${query}%`)
          .orWhere("sc.alias", "ilike", `%${query}%`)
          .orWhere("d.alias", "ilike", `%${query}%`)
          .orWhere("sp.name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("report"."generationdate", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });

    const [count] = await baseQuery;
    return parseInt(count.count, 10);
  }

  static async findByApplicationId({ applicationId, query, offset, limit, filters = {} }) {
    let baseQuery = knex("report")
      .select(
        "report.title",
        "report.description",
        knex.raw(`to_char("report"."generationdate", 'YYYY-MM-DD') as "generationDate"`),
        "report.sourceconnectionid",
        "report.destinationid",
        "report.applicationid",
        "report.storedprocedureid",
        "sc.alias as sourceConnection",
        "d.alias as destination",
        "sp.name as storedProcedure",
      )
      .leftJoin("connection as sc", "report.sourceconnectionid", "sc.connectionid")
      .leftJoin("destination as d", "report.destinationid", "d.destinationid")
      .leftJoin("storedprocedure as sp", "report.storedprocedureid", "sp.storedprocedureid")
      .where({ "report.applicationid": applicationId })
      .andWhere((builder) => {
        builder
          .where("report.title", "ilike", `%${query}%`)
          .orWhere("report.description", "ilike", `%${query}%`)
          .orWhere("sc.alias", "ilike", `%${query}%`)
          .orWhere("d.alias", "ilike", `%${query}%`)
          .orWhere("sp.name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("report"."generationdate", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });

    if (filters.sortField && filters.sortField !== "None") {
      baseQuery.orderBy(filters.sortField, filters.sortOrder || "asc");
    }

    return baseQuery.offset(offset).limit(limit);
  }
}

module.exports = Report;
