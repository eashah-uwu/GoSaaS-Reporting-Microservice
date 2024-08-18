const knex = require("../config/db/db");
const { encrypt } = require("../config/encryption"); // Import the encrypt function

class User {
  static async findByEmail(email) {
    return knex("User").where({ email }).first();
  }

  static async findById(id) {
    return knex("User").where({ userid: id }).first();
  }

  static async create(userData) {
    const { email, name } = userData;
    const randomPassword = Math.random().toString(36).slice(-8);
    const encryptedPassword = encrypt(randomPassword); // Encrypt the random password
    const [newUser] = await knex("User")
      .insert({
        email,
        name,
        password: encryptedPassword, // Store the encrypted password
        createdat: new Date(),
        updatedat: new Date(),
      })
      .returning("*");
    return newUser;
  }
}

module.exports = User;
