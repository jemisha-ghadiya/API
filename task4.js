// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { jwtDecode } = require("jwt-decode");

// const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const path = require("path");
const { error, log } = require("console");
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
// const authenticateToken = async (req, res, next) => {
//   const token = req.header("Authorization");
//   console.log(token, "88888888888   ");

//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   const decoded = jwtDecode(token);

//   console.log(decoded);
//   if (!decoded.user) {
//     console.log("user unauthorized");
//   } else {
//     console.log(decoded.user, "decoded id============");

//     const userdata = await db.query("select * from signup where id=$1", [
//       decoded.user,
//     ]);

//     if (!userdata) {
//       console.log("user not found");
//       return;
//     }
//     console.log("", userdata.rows[0].id);

//     req.userId = userdata.rows[0].id;
//     console.log((req.user = userdata.rows[0].id), "@@@@@@@@@@@@@@@@");
//   }

//   // jwt.verify(token, SECRET_KEY, (err, user) => {
//   //   if (err) return res.status(403).json({ error: 'Invalid Token' });
//   //   req.user = user;
//   next();
//   // });
// };

// Routes

const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    // Decode the token
    const decoded = jwt.verify(token, SECRET_KEY); // Use jwt.verify to validate and decode the token

    console.log(decoded, "Decoded Token");

    if (!decoded.userId) {
      return res.status(401).json({ error: "user not found" });
    }

    // Fetch user data from the database using the userId (from the decoded token)
    const userdata = await db.query("SELECT * FROM signup WHERE id = $1", [
      decoded.userId,
    ]);

    if (!userdata.rows.length) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach userId from database to the request object
    req.userId = userdata.rows[0].id; // Use the id from the 'signup' table
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error: "Invalid token" });
  }
};

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
  // Username validation: Ensure it's not empty and is a valid email
  body("email")
    .notEmpty()
    .withMessage("Username (email) cannot be empty")
    .isEmail()
    .withMessage("Username must be a valid email address"),

  // Password validation: Ensure the password is at least 8 characters long
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  async (req, res) => {
    const errors = validationResult(req);

    // If validation fails, return the errors as JSON
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      return res.json({
        message: errorMessages.join(", "), // Join multiple errors into one message
        success: false,
      });
    }

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Check if the username already exists in the database
      const result = await db.query(
        "SELECT * FROM signup WHERE username = $1",
        [email]
      );

      // If username already exists, return an error message
      if (result.rows.length > 0) {
        return res.json({
          message: "Email already exists. Please use a different email.",
          success: false,
        });
      }

      // Check if username is valid (email format), this is extra and not strictly necessary here
      if (!email || !email.includes("@")) {
        return res.json({
          message: "Username not valid",
          success: false,
          email,
        });
      }

      // Check if password is valid (min 8 characters)
      if (password.length < 8) {
        return res.json({
          message: "Password is not valid",
          success: false,
          email,
        });
      }

      // Insert the new user into the database
      const insertResult = await db.query(
        "INSERT INTO signup (username, password) VALUES ($1, $2) RETURNING username",
        [email, hashedPassword]
      );

      // Return success message with the username
      res.json({
        message: "Signup successful",
        success: true,
        email: insertResult.rows[0].username,
      });
    } catch (error) {
      console.error("Error during signup:", error);
      res.json({
        message: "An error occurred during signup. Please try again later.",
        success: false,
      });
    }
  }
);

// GET route to retrieve signup dat
app.get("/users", async (req, res) => {
  try {
    // Query to fetch all users from the signup table
    const result = await db.query("SELECT * FROM signup");

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Send the users' data as a JSON response
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error("Error fetching signup data:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching signup data." });
  }
});

app.delete("/signup/:id", authenticateToken, async (req, res) => {
  console.log(req.userId, " user id from token %%%%%%%%%%%%%%%%");

  const { id } = req.params;
  console.log(`Token userId: ${req.userId}, URL id: ${id}`);

  if (req.userId !== parseInt(id)) {
    return res
      .status(403)
      .json({ message: "You are not authorized to delete this user." });
  }

  try {
    // Check if the user exists in the database by ID
    const userResult = await db.query("SELECT * FROM signup WHERE id = $1", [
      parseInt(id),
    ]);
    console.log("Database query result:", userResult.rows);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optionally, handle dependent records (e.g., tasks in "todolist" table)
    // await db.query("DELETE FROM todolist WHERE signup_id = $1", [parseInt(id)]);

    // Delete the user from the database
    console.log("Executing DELETE query: DELETE FROM signup WHERE id = $1", [
      parseInt(id),
    ]);
    const deleteResult = await db.query(
      "DELETE FROM signup WHERE id = $1 RETURNING id", // Using RETURNING to get deleted user's info
      [parseInt(id)]
    );

    console.log("Delete Result:", deleteResult); // Log the delete result

    if (deleteResult.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Error deleting user, or record not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      deletedUserId: deleteResult.rows[0].id, // Return deleted user id as confirmation
    });
  } catch (error) {
    console.error("Error deleting user data:", error.message);
    res.status(500).json({
      message:
        "An error occurred while deleting the user data. Please try again later.",
      errorDetails: error.message, // Log error details
    });
  }
});

app.put(
  "/user/:id",
  // Ensure user is authenticated before allowing access
  body("email").optional().isEmail().withMessage("Invalid email format"), // Optional email validation
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"), // Optional password validation
  async (req, res) => {
    // Log the user ID from token

    // Validation of request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // New username and password
    const { id } = req.params; // Current user ID from the URL

    // Check if the user is trying to update their own information

    try {
      // Fetch user details from the database using the ID
      const userResult = await db.query("SELECT * FROM signup WHERE id = $1", [
        id,
      ]);

      // If no user is found, return a 404 error
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get the current username and password (as defaults)
      let updatedemail = userResult.rows[0].username;
      let updatedPassword = userResult.rows[0].password;

      // Update username and password if new values are provided
      if (email) updatedemail = email;
      if (password) updatedPassword = await bcrypt.hash(password, 10); // Hash the new password

      // Log the updated values (for debugging)
      console.log("Updating values:", { updatedemail, updatedPassword });

      // Update the user's details in the database
      const updateResult = await db.query(
        "UPDATE signup SET username = $1, password = $2 WHERE id = $3 RETURNING id, username,password",
        [updatedemail, updatedPassword, parseInt(id)]
      );

      // If no rows are updated, it might mean the update was unsuccessful
      if (updateResult.rowCount === 0) {
        return res
          .status(400)
          .json({ message: "No changes made, or record not found" });
      }

      // Respond with the updated user data
      res.status(200).json({
        message: "User data updated successfully",
        updatedUser: updateResult.rows[0],
      });
    } catch (error) {
      console.error("Error updating user data:", error);
      res.status(500).json({
        message:
          "An error occurred while updating the user data. Please try again later.",
      });
    }
  }
);

// Login API
app.post(
  "/login",
  body("email").notEmpty().withMessage("Username cannot be empty"),
  body("password").notEmpty().withMessage("Password cannot be empty"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", { error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists in the database
      const result = await db.query(
        "SELECT * FROM signup WHERE username = $1",
        [email]
      );

      const user = result.rows[0]; // Assuming first match is the user
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Compare hashed passwords
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }
      console.log(user.id, "888", user);

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: "1d",
      });

      // Send token as response
      return res.status(200).json({ message: "Login successful", token ,user});
    } catch (error) {
      console.error("Error during login:", error);
      return res
        .status(500)
        .json({
          message: "An error occurred during login. Please try again later.",
        });
    }
  }
);

// Add task API (POST /todopage)
app.post("/todopage", authenticateToken, async (req, res) => {
  const { task, description, duration, email } = req.body;

  if (!task || !description || !duration || !email) {
    return res.status(400).json({
      error: "All fields are required (task, description, duration).",
    });
  }

  try {
    // Insert the task into the todolist table
    await db.query(
      "INSERT INTO todolist (task, description, duration, username, signup_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [task, description, duration, email, req.userId]
    );

    // Respond with success message
    res.send({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
});

// Get tasks (GET /todopage)
app.get("/todopages", authenticateToken, async (req, res) => {
  console.log("get todo");

  console.log(req.userId, "user!!!!!!!!!!!!!");

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
      [req.userId]
    );
    console.log(result.rows, "9999999999999999999999");
    const todoAllData = result.rows;
    // Responding with the created task
    res.status(200).json({ todoAllData });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
  // res.send("to do page")
});

// Update Task
app.put("/todopage/:id", authenticateToken, async (req, res) => {
  const { id } = req.params; // Task ID from the URL
  const { task, description, duration, email } = req.body; // Data to update

  console.log(`Token userId: ${req.userId}, Task id from URL: ${id}`);

  try {
    // Step 1: Ensure the user is authorized to update the task by matching their token id with the task's signup_id
    const taskResult = await db.query(
      "SELECT * FROM todolist WHERE id = $1 AND signup_id = $2",
      [id, req.userId]
    );

    // Step 2: Check if the task exists and belongs to the user
    if (taskResult.rows.length)
      return res.status(404).json({ message: "Task not found or you do not have permission to update this task" });

    // Step 3: Proceed to update the task if the user is authorized
    const updateResult = await db.query(
      "UPDATE todolist SET task = $1, description = $2, duration = $3, username = $4 WHERE id = $5 RETURNING *",
      [task, description, duration, email, id]
    );

    // Step 4: Check if the update was successful
    if (updateResult.rows.length === 0) {
      return res.status(400).json({ message: "Error updating task, or task not found" });
    }

    // Successfully updated the task
    const updatedTask = updateResult.rows[0];
    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,  // Returning the updated task data
    });

  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      message: "An error occurred while updating the task. Please try again later.",
      errorDetails: error.message,
    });
  }
});


app.delete("/todopage/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  // const { username } = req.user;

  try {
    const result = await db.query("DELETE FROM todolist WHERE id = $1", [id]);
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
  res.send({ message: "delete successfully" });
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
