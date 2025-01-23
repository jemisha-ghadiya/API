// index.js

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
//    const  db  = require('./models/database'); // Database connection
const userRoutes = require("./routes/user.js");
const taskRoutes = require("./routes/task.js");
const db  = require("./config/db.js");
// 
const swaggerjsdoc=require('swagger-jsdoc')
const swaggerui=require('swagger-ui-express');
// const { options } = require("./server.js");
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
const options = {
  swaggerDefinition: {
    info: {
      title: 'API Documentation',
      version: '3.0.0',
      description: 'API documentation for the Node.js app',
    },
    host: 'localhost:3000', // Replace with your actual host
    basePath: '/', // Base path for your API
    
  },
  apis: ['./routes/*.js'], // Path to the API docs (e.g., route files where you use @swagger comments)
};
// const options={
//   defination : {
//     openapi:'3.0.0',
//     servers:[{url:'http://localhost:3000'},],
//   },
//   apis:["./routes/*.js"],
// };
const spaces=swaggerjsdoc(options)
app.use("/y",swaggerui.serve,swaggerui.setup(spaces))
// Start servers
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
