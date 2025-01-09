const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const db = require('./config/db');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

Routes

const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');

//app.use(authRoutes);
app.use(userRoutes);
app.use(taskRoutes);

// Start the server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });
