const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, errors } = format;

// Define the log format for detailed error messages
const logFormat = printf(({ timestamp, level, message, stack, context }) => {
  const traceId = context && context.traceid ? context.traceid : "N/A";
  const errorDetails = stack
    ? `at ${stack.split("\n")[1].split(":").slice(1, 3).join(":")}`
    : "";
  const internalServerError =
    level === "error" ? "Internal server error: " : "";
  return `[${timestamp}] [${level.toUpperCase()}] [${traceId}] ${internalServerError}${message} ${errorDetails}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat
      ),
    }),
    new transports.File({
      filename: "logs/combined.log",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat
      ),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    })
  );
}

module.exports = logger;
