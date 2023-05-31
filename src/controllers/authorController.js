const Author = require('../models/authorModel')
const jwt = require('jsonwebtoken');

// Create Author
const createAuthor = async (req,res) => {
    try {
        let data = req.body;

        if(!data.fname){
            return res.status(400).send({
                status: false,
                message : 'author first name is required'
            })
        }
        if(!data.lname){
            return res.status(400).send({
                status: false,
                message : 'author last name is required'
            })
        }
        if(!data.email){
            return res.status(400).send({
                status: false,
                message : 'author email is required'
            })
        }
        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(data.email)) {
            return res.status(400).send({
                status: false,
                message: 'Invalid email format'
            })
        }
        const existingAuthor = await Author.findOne({ email: data.email });
        if(existingAuthor) {
            return res.status(400).send({
                status: false,
                message: `${data.email} already exists`
            });
        }

        if(!data.password) {
            return res.status(400).send({
                status: false, 
                message: 'author password is required'
            })
        }

        if(!data.title){
            return res.status(400).send({
                status: false,
                message : 'author title is required'
            })
        }
        if (!['Mr', 'Mrs', 'Miss'].includes(data.title)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid title. Author title will only include - Mr, Mrs, Miss' 
            });
        }

        let newAuthor = await Author.create(req.body);
        res.status(201).send({
            status: true,
            message : 'Author created successfully',
            data : newAuthor, 
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message : error.message
        })
    }
}

// Author Login
const login = async (req,res)=>{
    try {

        const data = req.body;

        if(!data.email){
            return res.status(400).send({
                status: false,
                message : 'author email is required'
            })
        }
        if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(data.email)) {
            return res.status(400).send({
                status: false,
                message: 'Invalid email format'
            })
        }

        if(!data.password) {
            return res.status(400).send({
                status: false, 
                message: 'author password is required'
            })
        }
        const author = await Author.findOne({ email:data.email, password:data.password });
        if(!author) {
            return res.status(401).send({
                status: false,
                message: 'Invalid email or password'
            })
        }

        const payload = {
            authorId: author._id,
            firstName: author.fname,
            lastName: author.lname
        } 

        const secret = process.env.JWT_SECRET_KEY;

        const options = {
            expiresIn: '3d'
        }

        const token = jwt.sign(payload, secret, options);

        res.setHeader("x-api-key", token);
        res.status(200).json({
            status:true,
            message : 'Author logged in successfully',
            data: {token}
        });
    } catch (error) {
        res.status(500).send({
            status: false,
            message : error.message
        })
    }
}


module.exports = {
    createAuthor,
    login
}