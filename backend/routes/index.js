const express = require("express");
const authController = require("../controller/authController");
const blogController = require('../controller/blogController');
const auth = require('../middlewares/auth');
const router = express.Router();

//USER

//login
router.post("/login", authController.login);
//register
router.post("/register", authController.register);
//logout
router.post("/logout", auth, authController.logout);
//refresh
router.get('/refresh',authController.refresh);
//blog
//CRUD
//create
router.post('/blog', auth, blogController.create);
//get all blogs
router.get('/blog/all', auth, blogController.getAll);
//read blog by id
router.get('/blog/:id', auth, blogController.getById);
//update
router.put('/blog', auth, blogController.update);
//delete
router.delete('/blog/:id', auth, blogController.delete);
//comment
module.exports = router;
