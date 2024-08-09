const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  const traceId = req.traceId || "N/A";

  if (err instanceof ZodError) {
    logger.warn("Validation error", {
      traceid: traceId,
      errors: err.errors,
    });
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation error",
      errors: err.errors,
    });
  }

  // Handle other known errors (e.g., custom errors with a status code)
  if (err.status) {
    logger.warn(err.message, {
      traceid: traceId,
      error: err.message,
    });
    return res.status(err.status).json({
      message: err.message,
    });
  }

  // Log unexpected errors
  logger.error(err.message, {
    traceid: traceId,
    stack: err.stack,
  });

  // Respond with a generic error message
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Something went wrong!",
    error: "Internal Server Error",
  });
}

module.exports = errorHandler;
