const { StatusCodes } = require("http-status-codes");
const logger = require("../logger");
const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation error",
      errors: err.errors,
    });
  }

  const statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    error: statusCode === StatusCodes.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : err.message,
  });

}

module.exports = errorHandler;
