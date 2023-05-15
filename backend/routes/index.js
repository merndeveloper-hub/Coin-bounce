const express = require("express");
const authController = require("../controller/authController");
const router = express.Router();

//USER

//login
router.post("/login", authController.login);
//register
router.post("/register", authController.register);
//logout
//refresh

//blog
//CRUD
//create
//read all blogs
//read blog by id
//delete

//comment
module.exports = router;
