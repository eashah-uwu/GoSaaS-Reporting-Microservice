const { ZodError } = require("zod");
const querySchema = require("../schemas/querySchemas");
const logger = require("../logger");
const { StatusCodes } = require("http-status-codes");

const validateQuery = (req, res, next) => {
  try {
    req.query = querySchema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      logger.warn("Validation error", { errors: err.errors });
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
    next(err);
  }
};

module.exports = validateQuery;
