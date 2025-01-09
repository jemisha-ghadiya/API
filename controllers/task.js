//const { db } = require('../models/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/jwt');
 const db = require('../config/db');
const { validationResult } = require('express-validator');



const create_todo= async (req, res) => {
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
};

// Get tasks (GET /todopage)
const retrive_data= async (req, res) => {
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
};

const update= async (req, res) => {
    console.log(req.userId, "user!!!!!!!!!!!!!");
    
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
    if (taskResult.rows.length===0)
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
};

const delete_todo= async (req, res) => {
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
};
module.exports = {create_todo ,retrive_data,update,delete_todo};
