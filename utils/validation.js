

const { body } = require("express-validator");

// Validation rules for Sign Up
const signupValidation = [
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("confirm_password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

// Validation rules for Sign In
const signinValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
    
];

// Validation rules for Task creation
const taskValidation = [
  body("task")
  .optional()
    .isLength({ min: 5 })
    .withMessage("Task task must be at least 5 characters"),
  body("description")
  .optional()
    .isLength({ min: 5 })
    .withMessage("Task description must be at least 5 characters"),
    body("duration")
    .optional()
    .isLength({min:7})
    .withMessage("Task duration must be in 7 character"),
    body("email")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email address"),
];

// Validation rules for Update Task
const taskUpdateValidation = [
  body("title")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Task title must be at least 3 characters"),
  body("description")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Task description must be at least 5 characters"),
];

module.exports = {
  signupValidation,
  signinValidation,
  taskValidation,
  taskUpdateValidation,
};
