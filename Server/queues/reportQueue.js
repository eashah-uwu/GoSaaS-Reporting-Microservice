// Server/queues/reportQueue.js

const { Queue } = require("bullmq");
const connection = require("../config/db/redisConnectionFactory");

const reportQueue = new Queue("reportQueue", {
  connection,
});

module.exports = reportQueue;
