const knex = require("../config/db/db");

class ReportStatusHistory {
  static async findById(id) {
    return knex("reportstatushistory")
      .where({ reportstatushistoryid: id })
      .first()
      .orderBy("createdat");
  }
}

module.exports = ReportStatusHistory;
