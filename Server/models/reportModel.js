const knex = require("../config/db/db");

class Report {
  static async create(
    title_p,
    description_p,
    parameter_p,
    source_p,
    destination_p,
    applicationid_p,
    storedprocedure_p,
    userid_p,
    key_p
  ) {
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
        filekey: key_p,
        isdeleted: false,
      })
      .returning("*");
    const [report] = await knex("report")
      .select(
        "report.title",
        "report.reportid",
        "report.description",
        knex.raw(
          `to_char("report"."generationdate", 'YYYY-MM-DD') as "generationDate"`
        ),
        "report.sourceconnectionid",
        "report.destinationid",
        "report.storedprocedure as storedProcedure",
        "report.applicationid",
        "sc.alias as sourceConnection",
        "d.alias as destination",
        "report.filekey"
      )
      .leftJoin(
        "connection as sc",
        "report.sourceconnectionid",
        "sc.connectionid"
      )
      .leftJoin("destination as d", "report.destinationid", "d.destinationid")
      .where({ "report.reportid": createdReport.reportid });

    return report;
  }

  static async findById(reportid) {
    return knex("report").where({ reportid: reportid }).first();
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
      storedProcedure,
      userid,
      filekey
    } = data;
    const [report] = await knex("report")
      .where({ reportid: id })
      .update({
        title,
        description,
        generationdate: new Date(generationdate),
        parameters: parameters ? JSON.stringify(parameters) : null, 
        sourceconnectionid: sourceconnectionid,
        destinationid: destinationid,
        applicationid: applicationid,
        storedprocedure: storedProcedure,
        userid: userid,
        updatedat: new Date(),
        filekey: filekey
      })
      .returning("*");
    return report;
  }

  static async delete(id) {
    const [report] = await knex("report")
      .where({ reportid: id })
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");

    return report;
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

  static async findByName(title, applicationid) {
    return knex("report")
      .where({ applicationid: applicationid, isdeleted: false })
      .andWhere("title", "ilike", title)
      .first();
  }
  static asyn;
  static async countSearchResults(applicationid, query, filters) {
    let baseQuery = knex("report")
      .count({ count: "*" })
      .leftJoin(
        "connection as sc",
        "report.sourceconnectionid",
        "sc.connectionid"
      )
      .leftJoin("destination as d", "report.destinationid", "d.destinationid")
      .where({
        "report.applicationid": applicationid,
        "report.isdeleted": false,
      })
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

  static async findByApplicationId({
    applicationid,
    query,
    offset,
    limit,
    filters = {},
  }) {
    let baseQuery = knex("report")
      .select(
        "report.reportid",
        "report.title",
        "report.description",
        knex.raw(
          `to_char("report"."generationdate", 'YYYY-MM-DD') as "generationDate"`
        ),
        "report.sourceconnectionid",
        "report.destinationid",
        "report.parameters",
        "report.isactive",
        "report.storedprocedure as storedProcedure",
        "report.applicationid",
        "sc.alias as sourceConnection",
        "d.alias as destination",
        "report.filekey"
      )
      .leftJoin(
        "connection as sc",
        "report.sourceconnectionid",
        "sc.connectionid"
      )
      .leftJoin("destination as d", "report.destinationid", "d.destinationid")
      .where({
        "report.applicationid": applicationid,
        "report.isdeleted": false,
      })
      .andWhere((builder) => {
        builder
          .where(knex.raw(`CAST(report.reportid AS TEXT)`), "ilike", `%${query}%`)
          .orWhere("report.title", "ilike", `%${query}%`)
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

    if (filters.status) {
      if (filters.status === "active") baseQuery.andWhere("report.isactive", true);
      if (filters.status === "inactive") baseQuery.andWhere("report.isactive", false);
    }
    if (filters.sortField && filters.sortField !== "None") {
      baseQuery.orderBy(filters.sortField, filters.sortOrder || "asc");
    } else {
      baseQuery.orderBy("report.createdat", "desc");
    }

    return baseQuery.offset(offset).limit(limit);
  }

  static async findAll({ userid, query, offset, limit, filters = {} }) {
    let baseQuery = knex("reportstatushistory")
      .select(
        "reportstatushistory.reportstatushistoryid",
        "reportstatushistory.reportid",
        `app.name as applicationName`,
        "r.title",
        knex.raw(
          `to_char("r"."generationdate", 'YYYY-MM-DD') as "generationDate"`
        ),
        "r.description",
        "reportstatushistory.status",
        "reportstatushistory.filekey"
      )
      .leftJoin("report as r", "reportstatushistory.reportid", "r.reportid")
      .leftJoin("application as app", "r.applicationid", "app.applicationid")
      .where({ "reportstatushistory.userid": userid })
      .andWhere((builder) => {
        builder
          .where("reportstatushistory.status", "ilike", `%${query}%`)
          .orWhere("r.title", "ilike", `%${query}%`)
          .orWhere("r.description", "ilike", `%${query}%`)
          .orWhere("app.name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("r"."generationdate", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });

    if (filters.sortField && filters.sortField !== "None") {
      baseQuery.orderBy(filters.sortField, filters.sortOrder || "asc");
    } else {
      baseQuery.orderBy("r.generationdate", "desc");
    }

    return baseQuery.offset(offset).limit(limit);
  }
  static async countSearchReportsHistory(userid, query, filters) {
    let baseQuery = knex("reportstatushistory")
      .count({ count: "*" })
      .leftJoin("report as r", "reportstatushistory.reportid", "r.reportid")
      .leftJoin("application as app", "r.applicationid", "app.applicationid")
      .where({ "reportstatushistory.userid": userid })
      .where((builder) => {
        builder
          .where("reportstatushistory.status", "ilike", `%${query}%`)
          .orWhere("r.title", "ilike", `%${query}%`)
          .orWhere("r.description", "ilike", `%${query}%`)
          .orWhere("app.name", "ilike", `%${query}%`)
          .orWhere(
            knex.raw(`to_char("r"."generationdate", 'YYYY-MM-DD')`),
            "ilike",
            `%${query}%`
          );
      });
    if (filters.status) {
      if (filters.status === "active") baseQuery.andWhere("isactive", true);
      if (filters.status === "inactive") baseQuery.andWhere("isactive", false);
      if (filters.status === "deleted") baseQuery.andWhere("isdeleted", true);
    }

    const [count] = await baseQuery;
    return parseInt(count.count, 10);
  }
  static async findByIds(ids) {
    return knex("report")
      .whereIn("reportid", ids)
      .andWhere({ isdeleted: false })
      .returning("*");
  }
  static async deleteMultiple(ids) {
    const reports = await knex("report")
      .whereIn("reportid", ids)
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");
    return reports;
  }
  static async deleteByApplicationIds(ids) {
    const connections = await knex("report")
      .whereIn("applicationid", ids)
      .update({ isdeleted: true, updatedat: new Date() })
      .returning("*");
    return connections;
  }
  static async batchChangeStatus(ids, status) {
    const isActive = status === "active";
    return knex("report")
      .whereIn("reportid", ids)
      .update({ isactive: isActive, updatedat: new Date() })
      .returning("*");
  }
  static async connnectionsReportBatchStatusDisable(ids) {
    return knex("report")
      .whereIn("sourceconnectionid", ids)
      .update({ isactive: false, updatedat: new Date() })
      .returning("*");
  }
  static async destinationsReportBatchStatusDisable(ids) {
    return knex("report")
      .whereIn("destinationid", ids)
      .update({ isactive: false, updatedat: new Date() })
      .returning("*");
  }
  static async connnectionsReportStatusDisable(connectionid) {
    return knex("report")
      .where({ "sourceconnectionid": connectionid })
      .update({ isactive: false, updatedat: new Date() })
      .returning("*");
  }
  static async destinationsReportStatusDisable(destinationid) {
    return knex("report")
      .where({ "destinationid": destinationid })
      .update({ isactive: false, updatedat: new Date() })
      .returning("*");
  }
  static async updateSingleStatus(reportId, isactive) {
    return knex("report")
      .where({ "reportid": reportId })
      .update({ isactive: isactive, updatedat: new Date() })
      .returning("*");
  }
}

module.exports = Report;
