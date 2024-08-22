const { Worker } = require("bullmq");
const { generateReport } = require("../services/generateReport");
const connection = require("../config/db/redisConnectionFactory");
const logger = require("../logger"); // Assuming you have a logger configured

const reportWorker = new Worker(
  "reportQueue",
  async (job) => {
    const { reportName, userid, parameters } = job.data;
    try {
      const result = await generateReport(reportName, userid, parameters);
      return result;
    } catch (error) {
      logger.error(`Report generation failed: ${error.message}`);
      throw new Error(`Report generation failed: ${error.message}`);
    }
  },
  {
    connection,
  }
);

reportWorker.on("completed", (job, result) => {
  logger.info(`Job completed with result ${result}`);
});

reportWorker.on("failed", (job, err) => {
  logger.error(`Job failed with error ${err.message}`);
});

module.exports = reportWorker;
