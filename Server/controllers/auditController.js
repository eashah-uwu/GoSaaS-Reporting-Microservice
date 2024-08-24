const AuditModel = require("../models/auditModel");
const HttpStatus = require("http-status-codes");

class AuditController {
  // Creates a new audit trail entry
  static async createAuditTrail(req, res) {
    const { userId, createdBy, description, module, event } = req.body;

    // Validate that module and event are not empty
    if (!module || !event) {
      return res.status(HttpStatus.StatusCodes.BAD_REQUEST).json({
        error: "Module and event must be provided.",
      });
    }

    const auditTrail = await AuditModel.createAuditTrail({
      userId,
      createdBy,
      description,
      module,
      event,
    });

    return res.status(HttpStatus.StatusCodes.CREATED).json(auditTrail);
  }

  // Retrieves all audit trail entries
  static async getAuditTrails(req, res) {
    const filters = req.query;
    const auditTrails = await AuditModel.getAuditTrails(filters);
    return res.status(HttpStatus.StatusCodes.OK).json(auditTrails);
  }

  // Gets unique modules
  static async getUniqueModules(req, res) {
    const modules = await AuditModel.getUniqueModules();
    return res.status(HttpStatus.StatusCodes.OK).json(modules);
  }

  // Gets unique events
  static async getUniqueEvents(req, res) {
    const events = await AuditModel.getUniqueEvents();
    return res.status(HttpStatus.StatusCodes.OK).json(events);
  }

  // Gets unique users
  static async getUniqueUsers(req, res) {
    const users = await AuditModel.getUniqueUsers();
    return res.status(HttpStatus.StatusCodes.OK).json(users);
  }
}

module.exports = AuditController;
