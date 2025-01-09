
const express = require('express');
const router = express.Router();

const {create_todo,retrive_data,update,delete_todo} = require('../controllers/task');
const authenticateToken = require('../MiddleWare/authenticateToken');
 router.use(authenticateToken)
// Create a new Todo
router.post('/todopage', create_todo);

// Get all Todos
router.get('/todopages', retrive_data);


// Update a Todo by ID
router.put('/todo_update/:id',update);

// Delete a Todo by ID
router.delete('/todopage/:id', delete_todo);

module.exports = router;
