const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const userRoutes = require("./routes/user.js");
const taskRoutes = require("./routes/task.js");
const db = require("./config/db.js");
const swaggerjsdoc = require("swagger-jsdoc");
const swaggerui = require("swagger-ui-express");
// const { options } = require("./server.js");
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database connection
db.connect()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log("Database connection error: ", err));
app.get("/user", (req, res) => {
  res.status(200).send({ message: "welcome to the API" });
});

// Routes

app.use("/user", userRoutes);
app.use("/task", taskRoutes);
const options = {
  swaggerDefinition: {
    info: {
      title: "API CRUD",
      version: "3.0.0",
      description: "API documentation for the Node.js app",
    },
    host: "localhost:3000",
    basePath: "/",
    securityDefinitions: {
      BearerAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: 'Please enter the token as: "Bearer <Your-JWT-Token>"',
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"],
};
// const options={
//   defination : {
//     openapi:'3.0.0',
//     servers:[{url:'http://localhost:3000'},],
//   },
//   apis:["./routes/*.js"],
// };
const spaces = swaggerjsdoc(options);
app.use("/api", swaggerui.serve, swaggerui.setup(spaces));

// const imagesPath = path.join(__dirname, "public", "uploads");
// console.log("Serving images from:", imagesPath);
// app.use("/uploads", express.static(imagesPath));

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Start servers
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
