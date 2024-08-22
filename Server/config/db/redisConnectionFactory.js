const Redis = require("ioredis");
const config = require("config");

const redisOptions = {
  host: config.get("redisConfig.host"),
  port: config.get("redisConfig.port"),
};

const redis = new Redis(redisOptions);

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("ready", () => {
  console.log("Redis connected successfully.");
});
