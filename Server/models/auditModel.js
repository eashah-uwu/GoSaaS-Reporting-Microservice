const knex = require("../config/db/db");

class AuditModel {
  // Fetches the event ID for a given module and event
  static async getAuditEventId(module, event) {
    const [auditEvent] = await knex("auditevents")
      .select("id")
      .where({ module, event })
      .limit(1);

    if (!auditEvent) {
      throw new Error(`Audit event for module "${module}" and event "${event}" not found.`);
    }

    return auditEvent.id;
  }

  // Creates a new audit trail entry
  static async createAuditTrail({ userId, createdBy, description, module, event }) {
    try {
      const auditEventId = await this.getAuditEventId(module, event);

      const [newAuditTrail] = await knex("audittrail")
        .insert({
          userid: userId,
          createdby: createdBy,
          createddate: new Date(),
          description: description || null,
          isactive: true,
          auditeventid: auditEventId,
        })
        .returning("*");

      return newAuditTrail;
    } catch (error) {
      throw new Error(`Failed to create audit trail: ${error.message}`);
    }
  }

  // Retrieves all audit trail entries with joined data from related tables
  static async getAuditTrails() {
    try {
      return knex("audittrail as at")
        .join("auditevents as ae", "at.auditeventid", "=", "ae.id")
        .join("User as u", "at.userid", "=", "u.userid")
        .select(
          "at.createdby",
          "at.description",
          knex.raw(`CONCAT(ae.module, '-', ae.event) AS "Module-Event"`),
          "at.createddate"
        )
        .orderBy("at.createddate", "desc");
    } catch (error) {
      throw new Error(`Failed to retrieve audit trails: ${error.message}`);
    }
  }
}

module.exports = AuditModel;
