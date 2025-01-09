// models/user.js
const db = require('../config/db');  // Assuming db.js contains your connection

// User model class with methods for common operations
class User {
  // Find a user by email
  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM signup WHERE username = $1', [email]);
    return result.rows[0]; // Returns the first row of the result, if found
  }

  // Find a user by ID
  static async findById(id) {
    const result = await db.query('SELECT * FROM signup WHERE id = $1', [id]);
    return result.rows[0]; // Returns the first row of the result, if found
  }

  // Create a new user
  static async create(email, password) {
    const result = await db.query(
      'INSERT INTO signup (username, password) VALUES ($1, $2) RETURNING id, username',
      [email, password]
    );
    return result.rows[0]; // Returns the newly created user
  }

  // Update user details
  static async update(id, email, password) {
    const result = await db.query(
      'UPDATE signup SET username = $1, password = $2 WHERE id = $3 RETURNING id, username, password',
      [email, password, id]
    );
    return result.rows[0]; // Returns the updated user
  }

  // Delete a user by ID
  static async delete(id) {
    const result = await db.query('DELETE FROM signup WHERE id = $1 RETURNING id', [id]);
    return result.rows[0]; // Returns the deleted user's ID
  }
}

module.exports = User;
