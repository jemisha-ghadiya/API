
const express = require('express');
const router = express.Router();
const {create_todo,retrive_data,update,delete_todo} = require('../controllers/task');
const authenticateToken = require('../MiddleWare/authenticateToken');
 router.use(authenticateToken)
// Create a new 

/**
 * @swagger
 * /task/todopage:
 *   post:
 *     description: Creates a new todo task with the provided task details and authorization token.
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token to authenticate the user
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <JWT-TOKEN>"
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

router.post('/todopage', create_todo);


/**
 * @swagger
 * /task/todopages:
 *   get:
 *     description: Retrieves all todo tasks for the authenticated user
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Bearer token to authenticate the user
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <JWT-TOKEN>"
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
 *       500:
 *         description: Internal server error
 */

// Get all Todos
router.get('/todopages', retrive_data);

/**
 * @swagger
 * /task/todo_update/{id}:
 *   put:
 *     description: Updates the todo task details by ID.
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
 *       - in: header
 *         name: Authorization
 *         description: Bearer token to authenticate the user
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <JWT-TOKEN>"
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
 *         description: Missing or invalid parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Todo task not found
 *       500:
 *         description: Internal server error
 */

// Update a Todo by ID
router.put('/todo_update/:id',update);
/**
 * @swagger
 * /task/todopage/{id}:
 *   delete:
 *     description: Deletes a todo task by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the todo task to delete
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: header
 *         name: Authorization
 *         description: Bearer token to authenticate the user
 *         required: true
 *         schema:
 *           type: string
 *           example: "Bearer <JWT-TOKEN>"
 *     responses:
 *       200:
 *         description: Todo task deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Todo task deleted successfully"
 *       400:
 *         description: Invalid or missing parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Todo task not found
 *       500:
 *         description: Internal server error
 */

// Delete a Todo by ID
router.delete('/todopage/:id', delete_todo);

module.exports = router;
