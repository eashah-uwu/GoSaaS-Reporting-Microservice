const AuditModel = require("../models/auditModel");
const HttpStatus = require("http-status-codes");

class AuditController {
  // Creates a new audit trail entry
  static async createAuditTrail(req, res) {
    try {
      const { userId, createdBy, description, module, event } = req.body;

      // Validate that module and event are not empty
      if (!module || !event) {
        return res.status(HttpStatus.BAD_REQUEST).json({
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

      return res.status(HttpStatus.CREATED).json(auditTrail);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
    }
  }

  // Retrieves all audit trail entries
  static async getAuditTrails(req, res) {
    try {
      const auditTrails = await AuditModel.getAuditTrails();
      return res.status(HttpStatus.OK).json(auditTrails);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
    }
  }
}

module.exports = AuditController;
