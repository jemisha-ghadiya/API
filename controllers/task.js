//const { db } = require('../models/database');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/jwt");
const db = require("../config/db");
const { validationResult } = require("express-validator");
const todotask = require("../module/task.js");
const{taskValidation}=require('../utils/validation.js')

const create_todo = [taskValidation,async (req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  const { task, description, duration, email } = req.body;

  if (!task || !description || !duration || !email) {
    return res.status(400).json({
      error: "All fields are required (task, description, duration).",
    });
  }

  try {
    
    await todotask.createtododata(
      task,
      description,
      duration,
      email,
      req.userId
    );
    
    res.status(200).json({ message: "Data inserted successfully" });
    // throw new Error("Simulated internal server error");  
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
}];

const retrive_data = async (req, res) => {
  console.log("get todo");
  console.log(req.userId, "user!!!!!!!!!!!!!");
  try {
    const result = await todotask.gettododataById(req.userId);
    console.log(result.rows, "9999999999999999999999");
    const todoAllData = result.rows;
    res.status(200).json({ todoAllData });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ error: "Failed to add task" });
  }
};

const update = [taskValidation,async (req, res) => {

  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  console.log(req.userId, "user!!!!!!!!!!!!!");

  const { id } = req.params;
  const { task, description, duration, email } = req.body;

  console.log(`Token userId: ${req.userId}, Task id from URL: ${id}`);

  try {
    const taskResult = await todotask.getdataById(id, req.userId);
    if (taskResult.rows.length === 0)
      return res
        .status(404)
        .json({
          message:
            "Task not found or you do not have permission to update this task",
        });
        
    const updateResult = await todotask.updatetododata(
      task,
      description,
      duration,
      email,
      id
    );
    if (updateResult.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Error updating task, or task not found" });
    }
    const updatedTask = updateResult.rows[0];
    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      message:
        "An error occurred while updating the task. Please try again later.",
      errorDetails: error.message,
    });
  }
}];

const delete_todo = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;

  try {
    const taskResult = await todotask.getdataById(id, userId);
    if (taskResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          message:
            "Task not found or you do not have permission to delete this task",
        });
    }
    await todotask.deletetododata(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};

module.exports = { create_todo, retrive_data, update, delete_todo };
