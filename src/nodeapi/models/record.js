const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        //spaces
        trim: true
    },
    gameName:{
        type: String
    },
    score:{
        type: Number,
        default: 0
    },
    date:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Record", recordSchema);