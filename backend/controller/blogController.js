const Joi = require('joi');
const mongodbIdPattern = /^[0-9-fA-F]{24}$/;

const blogController = {
    async create(req,res,next){
        // 1. validate req body
        //2. handle photo storage, naming
        //3. add tp db
        // 4.return response

 // client side -> base64 encoded string -> decode -> store -> save        

const createBlogSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().regex(mongodbIdPattern).required(),
    content: Joi.string().required(),
    photo: Joi.string().required()
})

const {error} = createBlogSchema.validate(req.body);
if(error){
    return next(error)
}

const {title, author, content, photo} = req.body;

// read as buffer

//allot a random name
//save locally
    },
    async getAll(req,res,next){},
    async getById(req,res,next){},
    async update(req,res,next){},
    async delete(req,res,next){},
}

module.exports = blogController;