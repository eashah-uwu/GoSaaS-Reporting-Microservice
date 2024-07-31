const knex = require("../config/db/db");

class Application {
  static async create(data) {
    const { name, description, isActive, userID, createdBy, updatedBy, isDeleted } = data;
    const [application] = await knex("application")
      .insert({
        Name: name,
        Description: description,
        isActive: isActive,
        UserID: userID,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
        CreatedBy: createdBy,
        UpdatedBy: updatedBy,
        isDeleted: isDeleted,  // Use provided isDeleted value
      })
      .returning("*");
    return application;
  }

  static async findAll() {
    return knex("application")
      .select("*")
      .where({ isDeleted: false });  // Filter out deleted records
  }

  static async findById(id) {
    return knex("application")
      .where({ ApplicationID: id, isDeleted: false })  // Filter out deleted records
      .first();
  }

  static async update(id, data) {
    const { name, description, isActive, updatedBy, isDeleted } = data;
    const [application] = await knex("application")
      .where({ ApplicationID: id })
      .update({
        Name: name,
        Description: description,
        isActive: isActive,
        UpdatedAt: new Date(),
        UpdatedBy: updatedBy,
        isDeleted: isDeleted,  // Update isDeleted field
      })
      .returning("*");
    return application;
  }

  static async delete(id) {
    const [application] = await knex("application")
      .where({ ApplicationID: id })
      .update({ isDeleted: true, UpdatedAt: new Date() })  // Perform soft delete
      .returning("*");
    return application;
  }
}

module.exports = Application;
