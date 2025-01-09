// index.js

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
//    const  db  = require('./models/database'); // Database connection
const userRoutes = require("./routes/user.js");
const taskRoutes = require("./routes/task.js");
const db  = require("./config/db.js");
// 

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database connection


 db.connect()
.then(() => console.log("Database connected successfully"));

// Routes
// //app.use('/auth', authRoutes);
app.use("/user", userRoutes);
app.use("/task", taskRoutes);

// Start servers
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
