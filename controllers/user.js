const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt');
const db = require('../config/db');
const { validationResult } = require('express-validator');
// const{  signinValidation}=require('../utils/validation')

// Signup Logic
// const signup = async (req, res) => {
//   const { email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const result = await db.query("SELECT * FROM signup WHERE username = $1", [email]);

//   if (result.rows.length > 0) {
//     return res.json({ message: "Email already exists" });
//   }

//   const insertResult = await db.query(
//     "INSERT INTO signup (username, password) VALUES ($1, $2) RETURNING username",
//     [email, hashedPassword]
//   );

//   res.json({ message: "Signup successful", email: insertResult.rows[0].username });
// };
const signup = async (req, res)=> {
  const { email, password } = req.body;
 
  if (!password || password.trim() === '') {
    return res.status(400).json({ message: "Password is required" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // const hashedPassword = await bcrypt.hash(password, 6);
    // Check if the user already exists using db.query
    const result = await db.query("SELECT * FROM signup WHERE username = $1", [email]);
    console.log(result);
    

    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Insert the new user into the database
    const insertResult = await db.query(
      "INSERT INTO signup (username, password) VALUES ($1, $2) RETURNING username",
      [email, hashedPassword]
    );

    // Return success message
    res.status(400).json({ message: "Signup successful", email: insertResult.rows[0].username });
  } catch (err) {
    console.error("Error in signup:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Login Logic
// const login = async (req, res) => {
//   const { email, password } = req.body;
//   const result = await db.query("SELECT * FROM signup WHERE username = $1", [email]);
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   if (!result.rows.length) {
//     return res.status(400).json({ message: "User not found" });
//   }

//   const validPassword = await bcrypt.compare(password, result.rows[0].password);
//   if (!validPassword) return res.status(400).json({ message: "Invalid password" });

//   const token = jwt.sign({ userId: result.rows[0].id }, SECRET_KEY, { expiresIn: '1d' });
//   res.status(200).json({ message: "Login successful", token, user: result.rows[0] });
// };

const login = async (req, res) => {
  const { email, password } = req.body;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Proceed with login logic
  try {
    const result = await db.query("SELECT * FROM signup WHERE username = $1", [email]);
    if (!result.rows.length) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, result.rows[0].password);
    if (!validPassword) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: result.rows[0].id }, SECRET_KEY, { expiresIn: '1d' });
    res.status(200).json({ message: "Login successful", token, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const get_userdata= async (req, res) => {
  // const { id } = req.params;
  console.log(req.userId,"hhhhhhhhhhhhhhhhhj");
  
  try {
    // Query to fetch all users from the signup table
    const result = await db.query("SELECT * FROM signup where id=$1",[req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Send the users' data as a JSON response
    res.status(200).json({ result: result.rows });
  } catch (error) {
    console.error("Error fetching signup data:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching signup data." });
  }
};

// Optional password validation
 const update_userdata= async (req, res) => {
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
        "UPDATE signup SET username = COALESCE($1,username), password = COALESCE($2,password) WHERE id = $3 RETURNING id, username,password",
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
  };
 const delete_userdata= async (req, res) => {
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
  };


module.exports = { signup, login,get_userdata,update_userdata ,delete_userdata};

