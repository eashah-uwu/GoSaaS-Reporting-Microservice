const { StatusCodes } = require("http-status-codes");

function errorHandler(err, req, res, next) {
  console.error(err.stack); // Log the error stack for debugging
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Something went wrong!",
    error: err.message,
  });
}

module.exports = errorHandler;
