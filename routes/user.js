const express = require("express");
const { body } = require("express-validator");
const {signup,login,get_userdata,update_userdata,delete_userdata} = require("../controllers/user.js");
const authenticateToken = require("../MiddleWare/authenticateToken");
const router = express.Router();
//  const{signupcontroller}=require("../__tests__/user.js");

router.post("/signup",signup);

router.post("/login", login);
router.get("/users", get_userdata);
router.put("/user/:id", update_userdata);
router.delete("/user/:id", authenticateToken, delete_userdata);

module.exports = router;
