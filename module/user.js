const db = require('../config/db');


const findUserByEmail = async (email) => {
  return db.query("SELECT * FROM signup WHERE username = $1", [email]);
};


const findUserById = async (id) => {
  return db.query("SELECT * FROM signup WHERE id = $1", [id]);
};


const createUser = async (email, hashedPassword) => {
  return db.query(
    "INSERT INTO signup (username, password) VALUES ($1, $2) RETURNING username",
    [email, hashedPassword]
  );
};


const updateUser = async (updatedemail, updatedPassword,id) => {
  return db.query(
    "UPDATE signup SET username = COALESCE($1, username), password = COALESCE($2, password) WHERE id = $3 RETURNING id, username, password",
    [updatedemail, updatedPassword, id]
  );
};


const deleteUser = async (id) => {
  return db.query("DELETE FROM signup WHERE id = $1 RETURNING id", [id]);
};
const deleteUserByEmail = async (email) => { return db.query("DELETE FROM signup WHERE username = $1 RETURNING id", [email]); };

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUserByEmail
};
