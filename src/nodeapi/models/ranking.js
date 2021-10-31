const mongoose = require('mongoose')
const validator = require('validator')

const rankingSchema = new mongoose.Schema({
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
    grade:{
        type: Number,
    }
})

module.exports = mongoose.model("Ranking", rankingSchema);