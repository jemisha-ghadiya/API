const express = require("express");
const { body } = require("express-validator");
const {signup,login,get_userdata,update_userdata,delete_userdata} = require("../controllers/user.js");
const authenticateToken = require("../MiddleWare/authenticateToken");
const router = express.Router();
// const{  signinValidation}=require('../utils/validation')

/**
 * @swagger
 * /user/signup:
 *   post:
 *     description: Signs up a new user with email and password
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The user's signup credentials
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             password:
 *               type: string
 *               example: "password123"
 *     responses:
 *       200:
 *         description: Signup successful
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Signup successful"
 *             email:
 *               type: string
 *               example: "user@example.com"
 *       400:
 *         description: Missing or invalid parameters
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */

router.post("/signup",signup);
/**
 * @swagger
 * /user/login:
 *   post:
 *     description: Signs up a new user with email and password
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The user's signup credentials
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             password:
 *               type: string
 *               example: "password123"
 *     responses:
 *       200:
 *         description: Signup successful
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Signup successful"
 *             email:
 *               type: string
 *               example: "user@example.com"
 *       400:
 *         description: Missing or invalid parameters
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */

router.post("/login",login);

/**
 * @swagger
 * /user/users:
 *   get:
 *     description: Retrieves a list of all users or the logged-in user's data
 *     security:
 *       - BearerAuth: []  # Correctly indent security definitions, no inline comments
 *     responses:
 *       200:
 *         description: Successfully retrieved user data
 *         schema:
 *           type: object
 *           properties:
 *             users:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   email:
 *                     type: string
 *                     example: "user@example.com"
 *                   username:
 *                     type: string
 *                     example: "user123"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */


router.get("/users",authenticateToken, get_userdata);
/**
 * @swagger
 * /user/user/{id}:
 *   put:
 *     description: Updates a user's details by their ID.
 *     security:
 *       - BearerAuth: []  # This also requires a Bearer token
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: body
 *         name: user
 *         description: The user's updated information
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *               example: "newuser@example.com"
 *             password:
 *               type: string
 *               example: "newpassword123"
 *     responses:
 *       200:
 *         description: User details successfully updated
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "User updated successfully"
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: "newuser@example.com"
 *                 password:
 *                   type: string
 *                   example: "newpassword123"
 *       400:
 *         description: Missing or invalid parameters
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.put("/user/:id",authenticateToken, update_userdata);


/**
 * @swagger
 * /user/user/{id}:
 *   delete:
 *     description: Deletes a user by their ID.
 *     security:
 *       - BearerAuth: []  # Indicates that a Bearer token is required for this endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: integer
 *           example: 42
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "User deleted successfully"
 *       400:
 *         description: Invalid or missing parameters
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


router.delete("/user/:id", authenticateToken, delete_userdata);

module.exports = router;
