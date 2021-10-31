const mongoose = require('mongoose')

const reviewSchema= new mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim: true
    },
    activity:{
        type: String,
        required: true,
        trim: true
    },
    id:{
        type: Number,
        required: true
    },
    desc:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Review", reviewSchema);