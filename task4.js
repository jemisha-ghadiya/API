// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const { jwtDecode } = require("jwt-decode");

const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const path = require("path");
const { error } = require("console");
const pg = require("pg");
const app = express();
const port = 3000;
const SECRET_KEY = "your_secret_key";
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "task",
  password: "root",
  port: 4000,
});
db.connect();
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// In-memory database for demonstration purposes
const users = [];
const todos = [];

// Helper Functions
const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization");
  console.log(token, "88888888888   ");

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const decoded = jwtDecode(token);

  console.log(decoded);
  if (!decoded.user) {
    console.log("user unauthorized");
  } else {
    console.log(decoded.user, "decoded id============");

    const userdata = await db.query("select * from signup where id=$1", [
      decoded.user,
    ]);

    if (!userdata) {
      console.log("user not found");
      return;
    }
    console.log("", userdata.rows[0].id);

    req.userId = userdata.rows[0].id;
    console.log((req.user = userdata.rows[0].id), "@@@@@@@@@@@@@@@@");
  }

  // jwt.verify(token, SECRET_KEY, (err, user) => {
  //   if (err) return res.status(403).json({ error: 'Invalid Token' });
  //   req.user = user;
  next();
  // });
};

// Routes

// Home page
app.get("/", (req, res) => {
  res.render("login", { error: null });
});

// Login page
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Sign-up page
app.get("/signup", (req, res) => {
  res.render("signup", { error: null });
});
app.get("/todopage", (req, res) => {
  res.render("todopage", { error: null });
});
// Sign Up API
app.post(
  "/signup",
  body("username").notEmpty().withMessage("Username cannot be empty"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", { error: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Check if user exists
      const result = await db.query(
        "SELECT * FROM signup WHERE username = $1",
        [username]
      );

      if (result.rows.length > 0) {
        return res.render("signup", { error: "User already exists" });
      }

      // Insert new user
      await db.query(
        "INSERT INTO signup (username, password) VALUES ($1, $2)",
        [username, hashedPassword]
      );

      // Redirect to login page after successful signup
      res.redirect("/login");
    } catch (error) {
      console.error("Error during signup:", error);
      res.render("signup", {
        error: "An error occurred while signing up. Please try again later.",
      });
    }
  }
);

// Login API
app.post(
  "/login",
  body("username").notEmpty().withMessage("Username cannot be empty"),
  body("password").notEmpty().withMessage("Password cannot be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", { error: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists in the database
      const result = await db.query(
        "SELECT * FROM signup WHERE username = $1",
        [username]
      );
      const user = result.rows[0].id; // Assuming first match is the user
      console.log(user, "===================");

      if (!user) {
        return res.render("login", { error: "User not found" });
      }

      // Compare hashed passwords
      const validPassword = await bcrypt.compare(
        password,
        result.rows[0].password
      );
      console.log(validPassword, "^^^^^^^^^^^^^^^^^^^^^");

      if (!validPassword) {
        return res.render("login", { error: "Invalid password" });
      }

      // Generate JWT token
      const token = jwt.sign({ user }, SECRET_KEY, { expiresIn: "1d" });

      // Send token as response
      res.status(200).json({ token });
    } catch (error) {
      console.error("Error during login:", error);
      res.render("login", {
        error: "An error occurred during login. Please try again later.",
      });
    }
  }
);

// Add task API (POST /todopage)
app.post("/todopage", authenticateToken, async (req, res) => {
  // console.log(req.body,req?.userId, "user!!!!!!!!!!!!!");

  const { task, description, duration, username } = req.body; // Task data from form
  // const {  } = req.user;
  // Username from JWT token

  if (!task || !description || !duration || !username) {
    return res
      .status(400)
      .json({
        error: "All fields are required (task, description, duration).",
      });
  }

  try {
    // console.log(task, description, duration, username, "**************");

    // Inserting new task into the todolist table with username to associate it with the user
    await db.query(
      "INSERT INTO todolist (task, description, duration, username, signup_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [task, description, duration, username, req.userId]
    );
    //  console.log(result)
    // Responding with the created task
    // res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    // console.error('Error adding task:', error);
    res.status(500).json({ error: "Failed to add task" });
  }
  res.send("to do page");
});

// Get tasks (GET /todopage)
app.get("/todopages", authenticateToken, async (req, res) => {
  console.log("get todo");

  console.log(req?.userId, "user!!!!!!!!!!!!!");

  // const { task, description, duration, username } = req.body;  // Task data from form
  // const { }  = req.user;
  // Username from JWT token

  // if (!task || !description || !duration || !username) {
  //   return res.status(400).json({ error: 'All fields are required (task, description, duration).' });
  // }
  try {
    // console.log(task, description, duration, username, "**************");
    // Inserting new task into the todolist table with username to associate it with the user
    const result = await db.query(
      "select * from todolist where signup_id = $1",
      [req?.userId]
    );
    console.log(result, "9999999999999999999999");
    // Responding with the created task
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
  // res.send("to do page")
});

// Update Task
app.put("/todopage/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { task, description, duration, username } = req.body;

  console.log(id, "000000000000000000000");

  try {
    const result = await db.query(
      "UPDATE todolist SET task = $1, description = $2, duration = $3 ,username=$4 WHERE id = $5",
      [task, description, duration, username,id]
    );
    console.log(result,"77777777777777777777");
    

    // if (result.rows.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ error: "Task not found or you do not have permission" });
    // }
    //  res.status(200).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
  res.send("upadte data");
});

// Delete Task
app.delete("/todopage/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  // const { username } = req.user;

  try {
    const result = await db.query(
      "DELETE FROM todolist WHERE id = $1",
      [id]
    );
    // if (result.rows.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ error: "Task not found or you do not have permission" });
    // }
    // res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
  res.send("delete successfully")
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
