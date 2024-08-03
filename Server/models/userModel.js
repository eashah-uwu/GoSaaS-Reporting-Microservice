const knex = require("../config/db/db");

class User {
  static async findByEmail(email) {
    return knex('User').where({ email }).first();
  }

  static async findById(id) {
    return knex('User').where({ userid: id }).first();
  }
}

module.exports = User;
