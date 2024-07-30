const knex = require("../config/db/db");

class Application {
  static async create(data) {
    const { name, description, isActive, userID, createdBy, updatedBy } = data;
    const [application] = await knex("application")
      .insert({
        name: name,
        description: description,
        isactive: isActive,
        userid: userID,
        createdat: new Date(),
        updatedat: new Date(),
        createdby: createdBy,
        updatedby: updatedBy,
      })
      .returning("*");
    return application;
  }
}

module.exports = Application;
