const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;

// Define the log format based on the provided template
const logFormat = printf(({ timestamp, level, message, context }) => {
  const traceId = context && context.traceid ? context.traceid : "N/A"; // Default to "N/A" if traceid is not provided
  return `[${timestamp}] [${level.toUpperCase()}] [${traceId}] ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Customize the date format as needed
    logFormat
  ),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

// Add a console transport for development purposes
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    })
  );
}

module.exports = logger;
