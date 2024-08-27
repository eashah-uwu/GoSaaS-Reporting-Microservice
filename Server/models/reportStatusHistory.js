const knex = require("../config/db/db");

class ReportStatusHistory {
  static async findById(id) {
    return knex("reportstatushistory")
      .where({ reportstatushistoryid: id })
      .first()
      .orderBy("createdat");
  }
  static async getReportStats(userid) {
    const results = await knex('reportstatushistory')
      .select('status')
      .count('reportstatushistoryid as count')
      .where({ userid: userid })
      .groupBy('status');
  
    const stats = {
      totalReports: 0,
      processing: 0,
      successful: 0,
      failed: 0
    };
 
    results.forEach(result => {
      stats.totalReports += parseInt(result.count, 10);
      if (result.status === 'Pending') {
        stats.processing = parseInt(result.count, 10);
      } else if (result.status === 'Generated') {
        stats.successful = parseInt(result.count, 10);
      } else if (result.status === 'Failed') {
        stats.failed = parseInt(result.count, 10);
      }
    });
  
    return stats;
  }
}

module.exports = ReportStatusHistory;
