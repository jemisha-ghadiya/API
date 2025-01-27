// const express = require("express");
// const bodyParser = require("body-parser");
// const path = require("path");
// const dotenv = require("dotenv");
// const authenticateToken=require('./MiddleWare/authenticateToken.js')
// const {signup,login,get_userdata,update_userdata,delete_userdata}=require('./controllers/user.js')
// const{create_todo,retrive_data,update,delete_todo}=require('./controllers/task.js')
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// // function server() {
//   // Database connection
//   const db = require("./config/db");
//   db.connect()
//   .then(() => console.log("Database connected successfully"));
  
//   // Middleware
//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({ extended: true }));
//   app.set("view engine", "ejs");
//   app.set("views", path.join(__dirname, "views"));

//   // Routes

//   const userRoutes = require("./routes/user");
//   const taskRoutes = require("./routes/task");
//   app.get("/user", (req, res) => {
//     res.status(200).send({ message: "welcome to the user routes" });
//   });
//   //app.use(authRoutes);
//   app.use(userRoutes);
//   app.use(taskRoutes);
//   app.post('/signup',signup)
//   app.post('/login',login)
//    app.get('/users',authenticateToken,get_userdata)
//   app.put('/user/:id',authenticateToken,update_userdata)
//   app.delete("/user/:id", authenticateToken, delete_userdata);
//   app.post('/todopage',authenticateToken, create_todo);
//   app.get("todopages",authenticateToken,retrive_data)
// app.put("/todopage/:id",authenticateToken,update)
// app.delete("/todopage/:id",authenticateToken,delete_todo)
// //   Start the server
//   const server=app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
//   });
// // }

//  module.exports=app;

