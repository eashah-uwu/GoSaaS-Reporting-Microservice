const { v4: uuidv4 } = require("uuid");

const traceIdMiddleware = (req, res, next) => {
  req.traceId = uuidv4();
  next();
};

module.exports = traceIdMiddleware;
