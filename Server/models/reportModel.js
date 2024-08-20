const knex = require("../config/db/db");

class Report {
  static async create(title_p, description_p, parameter_p, source_p, destination_p, applicationid_p, storedprocedure_p, userid_p, key_p) {
    const [createdReport] = await knex("report")
      .insert({
        title: title_p,
        description: description_p,
        generationdate: new Date(),
        parameters: JSON.stringify(parameter_p),
        sourceconnectionid: source_p,
        destinationid: destination_p,
        applicationid: applicationid_p,
        storedprocedure: storedprocedure_p,
        userid: userid_p,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: userid_p,
        filekey: key_p
      })
      .returning("*");
    const [report] = await knex("report")
    .select(
      "report.title",
      "report.description",
      knex.raw(`to_char("report"."generationdate", 'YYYY-MM-DD') as "generationDate"`),
      "report.sourceconnectionid",
      "report.destinationid",
      "report.storedprocedure as storedProcedure",
      "report.applicationid",
      "sc.alias as sourceConnection",
      "d.alias as destination"
    )
    .leftJoin("connection as sc", "report.sourceconnectionid", "sc.connectionid")
    .leftJoin("destination as d", "report.destinationid", "d.destinationid")
    .where({ "report.reportid": createdReport.reportid });

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
      .where({ "report.applicationid": applicationId })
      .where((builder) => {
        builder
          .where("report.title", "ilike", `%${query}%`)
          .orWhere("report.description", "ilike", `%${query}%`)
          .orWhere("report.storedprocedure", "ilike", `%${query}%`)
          .orWhere("sc.alias", "ilike", `%${query}%`)
          .orWhere("d.alias", "ilike", `%${query}%`)
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
        "report.storedprocedure as storedProcedure",
        "report.applicationid",
        "sc.alias as sourceConnection",
        "d.alias as destination",
      )
      .leftJoin("connection as sc", "report.sourceconnectionid", "sc.connectionid")
      .leftJoin("destination as d", "report.destinationid", "d.destinationid")
      .where({ "report.applicationid": applicationId })
      .andWhere((builder) => {
        builder
          .where("report.title", "ilike", `%${query}%`)
          .orWhere("report.description", "ilike", `%${query}%`)
          .orWhere("report.storedprocedure", "ilike", `%${query}%`)
          .orWhere("sc.alias", "ilike", `%${query}%`)
          .orWhere("d.alias", "ilike", `%${query}%`)
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
