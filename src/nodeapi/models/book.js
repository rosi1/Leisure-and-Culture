const mongoose = require('mongoose')

const BookSchema= new mongoose.Schema({
    title:{
        type: String,
        required: true,
        unique: true
    },
    id:{
        type: Number,
        required: true,
        unique: true,
        default: 0
    },
    category:{
        type: String,
        required: true
    },
    author:{
        type: String
    },
    year:{
        type: Number,
        required: true
    },
    summary: {
        type: String
    },
    imagePath: {
        type: String
    }
})

//constructor/defyning model
module.exports = mongoose.model('Book',BookSchema);

