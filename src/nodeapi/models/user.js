const mongoose = require('mongoose')
const validator = require('validator')

const userSchema= new mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
        trim: true
    },
    firstName:{
        type: String,
    },
    lastName:{
        type: String,
    },
    phone:{
        type: String,
        "default" : ""
    },
    token:{
        type: String
    },
    favorites: {
        type : Array, 
        "default" : [] 
    },
    imagePath: {
        type: String,
        default: ""
    }
})

// //constructor/defyning model
module.exports = mongoose.model("user", userSchema);