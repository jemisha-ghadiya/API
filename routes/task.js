
const express = require('express');
const router = express.Router();
const {create_todo,retrive_data,update ,delete_todo, show_data} = require('../controllers/task');
const authenticateToken = require('../MiddleWare/authenticateToken');
 router.use(authenticateToken)
// Create a new 

/**
 * @swagger
 * /task/todopage:
 *   post:
 *     description: Creates a new todo task with the provided task details and authorization token.
 *     security:
 *       - BearerAuth: []  # Indicates that a Bearer token is required for to do data create
 *     parameters:
 *       - in: body
 *         name: todo
 *         description: The todo task details
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - task
 *             - description
 *             - duration
 *             - email
 *           properties:
 *             task:
 *               type: string
 *               example: "Finish Homework"
 *             description:
 *               type: string
 *               example: "Complete math assignment"
 *             duration:
 *               type: string
 *               example: "2 hours"
 *             email:
 *               type: string
 *               example: "user@example.com"
 *     responses:
 *       201:
 *         description: Todo task successfully created
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Todo task created successfully"
 *             task:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 task:
 *                   type: string
 *                   example: "Finish Homework"
 *                 description:
 *                   type: string
 *                   example: "Complete math assignment"
 *                 duration:
 *                   type: string
 *                   example: "2 hours"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *       400:
 *         description: Missing or invalid parameters
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "All Field required(task,description,duration,email)"         
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Somthing went wrong"
 */

router.post('/todopage', create_todo);


/**
 * @swagger
 * /task/todopages:
 *   get:
 *     description: Retrieves all todo tasks for the authenticated user
 *     security:
 *       - BearerAuth: []  # Security definition requiring a Bearer token
 *     responses:
 *       200:
 *         description: Successfully retrieved the todo tasks
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               task:
 *                 type: string
 *                 example: "Finish Homework"
 *               description:
 *                 type: string
 *                 example: "Complete math assignment"
 *               duration:
 *                 type: string
 *                 example: "2 hours"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Somthing went wrong"
 */


// Get all Todos
router.get('/todo/:id', show_data);
router.get('/todopages', retrive_data);

/**
 * @swagger
 * /task/todo_update/{id}:
 *   put:
 *     description: Updates the todo task details by ID.
 *     security:
 *       - BearerAuth: []  # Security definition requiring a Bearer token with update data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the todo task to update
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: body
 *         name: task
 *         description: The task details to update
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - task
 *             - description
 *             - duration
 *             - email
 *           properties:
 *             task:
 *               type: string
 *               example: "Finish Homework"
 *             description:
 *               type: string
 *               example: "Complete math assignment"
 *             duration:
 *               type: string
 *               example: "2 hours"
 *             email:
 *               type: string
 *               example: "user@example.com"
 *     responses:
 *       200:
 *         description: Todo task updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Todo task updated successfully"
 *             id:
 *               type: integer
 *               example: 1
 *             task:
 *               type: string
 *               example: "Finish Homework"
 *             description:
 *               type: string
 *               example: "Complete math assignment"
 *             duration:
 *               type: string
 *               example: "2 hours"
 *             email:
 *               type: string
 *               example: "user@example.com"
 *       400:
 *         description:  Task not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Error updating task, or task not found"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Unauthorized"
 *       404:
 *         description: Todo task not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "todo task not Found"
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Somthing went wrong"
 */

// Update a Todo by ID
router.put('/todo_update/:id',update);
/**
 * @swagger
 * /task/todopage/{id}:
 *   delete:
 *     description: Deletes a todo task by ID.
 *     security:
 *       - BearerAuth: []  # Security definition requiring a Bearer token with endpoint
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the todo task to delete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Todo task deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Todo task deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Unauthorized"
 *       404:
 *         description: Todo task not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "ToDo task not Found"
 *       500:
 *         description: Internal server error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Somthing went wrong"
 */

// Delete a Todo by ID
router.delete('/todopage/:id', delete_todo);

module.exports = router;
