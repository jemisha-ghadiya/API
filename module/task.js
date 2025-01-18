const db = require("../config/db");
const getdataById = async (id, userId) => {
  return db.query("SELECT * FROM todolist WHERE id = $1 AND signup_id = $2", [
    id,
    userId,
  ]);
};
const gettododataById = async (id) => {
  return db.query("select * from todolist where signup_id = $1", [id]);
};

const createtododata = async (task, description, duration, email, id) => {
  return db.query(
    "INSERT INTO todolist (task, description, duration, username, signup_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [task, description, duration, email, id]
  );
};

const updatetododata = async (task, description, duration, email, id) => {
  return db.query(
    "UPDATE todolist SET task = COALESCE($1, task), description = COALESCE($2, description), duration = COALESCE($3, duration), username = COALESCE($4, username) WHERE id = $5 RETURNING *",
    [task, description, duration, email, id]
  );
};

const deletetododata = async (id) => {
  return db.query("DELETE FROM todolist WHERE id = $1", [id]);
};
module.exports = {
  gettododataById,
  createtododata,
  updatetododata,
  deletetododata,
  getdataById,
};
