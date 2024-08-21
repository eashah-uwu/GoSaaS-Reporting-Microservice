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
  }

  // Retrieves all audit trail entries with joined data from related tables, and supports filtering
  static async getAuditTrails(filters) {
    const query = knex("audittrail as at")
      .join("auditevents as ae", "at.auditeventid", "=", "ae.id")
      .join("User as u", "at.userid", "=", "u.userid")
      .select(
        "at.createdby",
        "at.description",
        knex.raw(`CONCAT(ae.module, '-', ae.event) AS "Module-Event"`),
        "at.createddate"
      );

    // Apply filters
    if (filters.createdBy) {
      query.where("at.createdby", "ILIKE", `%${filters.createdBy}%`);
    }
    if (filters.module) {
      query.where("ae.module", "ILIKE", `%${filters.module}%`);
    }
    if (filters.event) {
      query.where("ae.event", "ILIKE", `%${filters.event}%`);
    }
    if (filters.dateFrom) {
      query.where("at.createddate", ">=", filters.dateFrom);
    }
    if (filters.dateTo) {
      query.where("at.createddate", "<=", filters.dateTo);
    }

    // Apply sorting
    if (filters.sortField) {
      query.orderBy(filters.sortField, filters.sortOrder || "desc");
    } else {
      query.orderBy("at.createddate", "desc");
    }

    // Apply pagination
    if (filters.page && filters.pageSize) {
      query.limit(filters.pageSize).offset((filters.page - 1) * filters.pageSize);
    }

    return query;
  }

  // Retrieves unique modules and events from the AuditEvents table
  static async getUniqueModulesAndEvents() {
    const [uniqueModules, uniqueEvents] = await Promise.all([
      knex("auditevents").distinct("module").select("module"),
      knex("auditevents").distinct("event").select("event"),
    ]);

    return {
      modules: uniqueModules.map((row) => row.module),
      events: uniqueEvents.map((row) => row.event),
    };
  }
}

module.exports = AuditModel;
