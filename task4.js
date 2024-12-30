// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
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
      return res.status(401).json({ error: "Invalid token" });
    }

    // Fetch user data from the database using the userId (from the decoded token)
    const userdata = await db.query("SELECT * FROM signup WHERE username = $1", [
      decoded.userId,
    ]);

    if (!userdata.rows.length) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach userId from database to the request object
    req.userId = userdata.rows[0].id;  // Use the id from the 'signup' table
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
  body("username").notEmpty().withMessage("Username (email) cannot be empty"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("signup", { error: errors.array()[0].msg });
    }

    const { username, password } = req.body;  // Assuming username is the email address
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // Check if username (email) already exists in the database
      const result = await db.query(
        "SELECT * FROM signup WHERE username = $1",
        [username]
      );

      // If username already exists, respond with an error message in JSON format
      if (result.rows.length > 0) {
        return res.json({
          message: "Email already exists. Please use a different email.",
          success: false,
        });
      }

      // If username does not exist, proceed to insert the new user
      const insertResult = await db.query(
        "INSERT INTO signup (username, password) VALUES ($1, $2) RETURNING username",
        [username, hashedPassword]
      );

      res.json({
        message: "Signup successful",
        success: true,
        username: insertResult.rows[0].username,
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


// GET route to retrieve signup data
app.get("/signups", async (req, res) => {
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
    res.status(500).json({ message: "An error occurred while fetching signup data." });
  }
});


app.delete("/signup/:id", 
  authenticateToken, 
  async (req, res) => {
    console.log(req.userId, " user id from token %%%%%%%%%%%%%%%%");

    const { id } = req.params;  // Current user ID from the URL
    console.log(`Token userId: ${req.userId}, URL id: ${id}`);

    // Check if the token's user ID matches the URL parameter ID
    if (req.userId !== parseInt(id)) {
      return res.status(403).json({ message: 'You are not authorized to delete this user.' });
    }

    try {
      // Check if the user exists in the database by ID
      const userResult = await db.query("SELECT * FROM signup WHERE id = $1", [parseInt(id)]);
      console.log('Database query result:', userResult.rows);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Optionally, handle dependent records (e.g., tasks in "todolist" table)
      // await db.query("DELETE FROM todolist WHERE signup_id = $1", [parseInt(id)]);

      // Delete the user from the database
      console.log("Executing DELETE query: DELETE FROM signup WHERE id = $1", [parseInt(id)]);
      const deleteResult = await db.query(
        "DELETE FROM signup WHERE id = $1 RETURNING id",  // Using RETURNING to get deleted user's info
        [parseInt(id)]
      );

      console.log('Delete Result:', deleteResult);  // Log the delete result

      if (deleteResult.rowCount === 0) {
        return res.status(400).json({ message: "Error deleting user, or record not found" });
      }

      res.status(200).json({
        message: "User deleted successfully",
        deletedUserId: deleteResult.rows[0].id,  // Return deleted user id as confirmation
      });

    } catch (error) {
      console.error("Error deleting user data:", error.message);
      res.status(500).json({
        message: "An error occurred while deleting the user data. Please try again later.",
        errorDetails: error.message // Log error details
      });
    }
  }
);




app.put("/signup/:id", 
    // Ensure user is authenticated before allowing access
  body("username").optional().isEmail().withMessage("Invalid email format"),  // Optional email validation
  body("password").optional().isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"), // Optional password validation
  authenticateToken,
  async (req, res) => {
    console.log(req.userId," user id from token %%%%%%%%%%%%%%%%");
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;  // New username and password
    const { id } = req.params;  // Current user ID from the URL

    // Log the userId from token and id from URL for debugging
    console.log(`Token userId: ${req.userId}, URL id: ${id}`);

    // Check if the token's user ID matches the URL parameter ID
    if (req.userId !== parseInt(id)) {
      return res.status(403).json({ message: 'You are not authorized to update this user.' });
    }

    try {
      // Check if the user exists in the database by ID
      const userResult = await db.query("SELECT * FROM signup WHERE id = $1", [parseInt(id)]);
      
      // Log the query result to check the issue
      console.log('Database query result:', userResult.rows);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      let updatedUsername = userResult.rows[0].username;  // Default to the current username if not updating
      let updatedPassword = userResult.rows[0].password;  // Default to the current password if not updating

      if (username) {
        updatedUsername = username;  // Use the provided new username if present
      }

      if (password) {
        // If a new password is provided, hash it before updating
        updatedPassword = await bcrypt.hash(password, 10);
      }

      // Log the data to be updated
      console.log("Updating user:", { id, updatedUsername, updatedPassword });

      // Update the user's details in the database
      const updateResult = await db.query(
        "UPDATE signup SET username = $1, password = $2 WHERE id = $3 RETURNING id, username, password",  // Add RETURNING to get updated user data
        [updatedUsername, updatedPassword, parseInt(id)]
      );

      // If no rows are updated, it might mean the update was unsuccessful
      if (updateResult.rowCount === 0) {
        return res.status(400).json({ message: "No changes made, or record not found" });
      }

      res.status(200).json({
        message: "User data updated successfully",
        updatedUser: updateResult.rows[0],
      });

    } catch (error) {
      console.error("Error updating user data:", error);
      res.status(500).json({
        message: "An error occurred while updating the user data. Please try again later.",
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

      const user = result.rows[0]; // Assuming first match is the user
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Compare hashed passwords
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.username }, SECRET_KEY, { expiresIn: "1d" });

      // Send token as response
      return res.status(200).json({ message: "Login successful", token });

    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "An error occurred during login. Please try again later." });
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
    return res.status(400).json({
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
  res.send({ message: "data insert succsessfully" });
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
    const todoAllData = result.rows
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
  const { id } = req.params;
  const { task, description, duration, username } = req.body;

  console.log(id, "000000000000000000000");

  try {
    const result = await db.query(
      "UPDATE todolist SET task = $1, description = $2, duration = $3 ,username=$4 WHERE id = $5",
      [task, description, duration, username, id]
    );
    console.log(result, "77777777777777777777");

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
  res.send({message:"upadte data successfully"});
});

// Delete Task
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
  res.send({message:"delete successfully"});
});
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
