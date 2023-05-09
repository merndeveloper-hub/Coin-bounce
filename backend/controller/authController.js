const Joi = require('joi');

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/;
const authController = {
async register(req, res, next) {
const userRegisterSchema = Joi.object({
    username:Joi.string().min(5).max(30).required(),
    name:Joi.string().max(30).required(),
    email:Joi.string().email().required(),
    password:Joi.string().pattern(passwordPattern).required(),
    confirmPassword:Joi.ref('password'),


})
},
}

module.exports = authController;