const db = require("../config/db");

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

const updateUser = async (updatedemail, updatedPassword,updateProfile, id) => {
  return db.query(
    "UPDATE signup SET username = COALESCE($1, username), password = COALESCE($2, password), upload_image = COALESCE($3, upload_image) WHERE id = $4 RETURNING id, username, password, upload_image",
    [updatedemail, updatedPassword,updateProfile, id]
  );
};

const deleteUser = async (id) => {
  return db.query("DELETE FROM signup WHERE id = $1 RETURNING id", [id]);
};
const deleteUserByEmail = async (email) => {
  return db.query("DELETE FROM signup WHERE username = $1 RETURNING id", [
    email,
  ]);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUserByEmail,
};
