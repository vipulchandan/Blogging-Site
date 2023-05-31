const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
        fname: {
            type: String,
            required: 'First name is required',
            trim: true,
        },
        lname: {
            type: String,
            required: 'Last name is required',
            trim: true,
        },
        title: {
            type: String,
            enum: ['Mr', 'Mrs', 'Miss'],
            required: 'Title is required',
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: 'Email address is required',
            match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        },
        password: {
            type: String,
            trim: true,
            required: 'Password is required'
        }

},{timestamps : true})

const Author = mongoose.model("Author",authorSchema);

module.exports = Author;