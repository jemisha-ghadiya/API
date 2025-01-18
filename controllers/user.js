const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const user=require('../module/user.js')
const{  signinValidation}=require('../utils/validation.js')
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
const signup =[signinValidation 
  ,async (req, res)=> {
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
    
    const result = await user.findUserByEmail(email);
    console.log(result);
    
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const insertResult = await user.createUser(email,hashedPassword)
    res.status(400).json({ message: "Signup successful", email: insertResult.rows[0].username });
  } catch (err) {
    console.error("Error in signup:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}];
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

const login =[signinValidation, async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const result = await user.findUserByEmail(email);
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
}];
const get_userdata= async (req, res) => {
  // const { id } = req.params;
  console.log(req.userId,"hhhhhhhhhhhhhhhhhj");
  
  try {
    const result = await user.findUserById(req.userId);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ result: result.rows });
  } catch (error) {
    console.error("Error fetching signup data:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching signup data." });
  }
};


 const update_userdata= [signinValidation,async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; 
    const { id } = req.params; 
    console.log(id,"cbbbbbbbb")
    try {
      const userResult = await user.findUserById(id);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      let updatedemail = userResult.rows[0].username;
      let updatedPassword = userResult.rows[0].password;

      if (email) updatedemail = email;
      if (password) updatedPassword = await bcrypt.hash(password, 10);
      console.log("Updating values:", { updatedemail, updatedPassword });
      const updateResult = await user.updateUser(updatedemail, updatedPassword, parseInt(id));
      if (updateResult.rowCount === 0) {
        return res
          .status(400)
          .json({ message: "No changes made, or record not found" });
      }
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
  }];
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
      
      const userResult = await user.findUserById(parseInt(id));
      console.log("Database query result:", userResult.rows);
  
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      
      console.log("Executing DELETE query: DELETE FROM signup WHERE id = $1", [
        parseInt(id),
      ]);
      const deleteResult = await user.deleteUser(parseInt(id));
  
      console.log("Delete Result:", deleteResult); 
  
      if (deleteResult.rowCount === 0) {
        return res
          .status(400)
          .json({ message: "Error deleting user, or record not found" });
      }
  
      res.status(200).json({
        message: "User deleted successfully",
        deletedUserId: deleteResult.rows[0].id, 
      });
    } catch (error) {
      console.error("Error deleting user data:", error.message);
      res.status(500).json({
        message:
          "An error occurred while deleting the user data. Please try again later.",
        errorDetails: error.message, 
      });
    }
  };


module.exports = { signup, login,get_userdata,update_userdata ,delete_userdata};

