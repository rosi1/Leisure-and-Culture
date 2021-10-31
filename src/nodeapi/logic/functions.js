const mongoose = require('mongoose');
const Book = require("../models/book");
const Movie = require("../models/movie");
const path = require('path'); 
var spawn = require('child_process').spawn;


module.exports = {
    initBooks: function () {

        fs = require('fs');
        fs.readFile("./data/books.json", 'utf8', function (err, data) {

            if (err) {
                console.log(err);
                return;
            }
            var datafromfile = JSON.parse(data);
            //console.log("dataFromFile = " + datafromfile);
            datafromfile.forEach(function (obj) {
                // console.log(mongoose.connection.readyState);
                // console.log("book = " + obj);
                var book = new Book(obj);
                //console.log("Adding the following book to DB: " + book);
                book.save()
                    .then(item => {
                        console.log("item saved to database");
                    })
                    .catch(err => {
                        if (err.name === 'MongoError' && err.code === 11000) {

                        } else {
                            console.log(`caught the error: ${err}`);
                        }
                    });
            })
        })
    },
    initMovies: function () {
        fs = require('fs');
        fs.readFile("./data/movies.json", 'utf8', function (err, data) {

            if (err) {
                console.log(err);
                return;
            }
            var datafromfile = JSON.parse(data);
            //console.log("dataFromFile = " + datafromfile);
            datafromfile.forEach(function (obj) {
                // console.log(mongoose.connection.readyState);
                // console.log("movie = " + obj);
                var movie = new Movie(obj);
                //console.log("Adding the following movie to DB: " + movie);
                movie.save()
                    .then(item => {
                        console.log("item saved to database");
                    })
                    .catch(err => {
                        if (err.name === 'MongoError' && err.code === 11000) {

                        } else {
                            console.log(`caught the error: ${err}`);
                        }
                    });
            })
        })
    },
    backupDB: function () {
        const directory = path.join(__dirname, '../tools');
        var dumpFile = directory + "\\mongodump.exe";
        var backupDB = spawn(dumpFile, [
            '--host',     '127.0.0.1',
            '--port',     '27017',
            // '--username', dbuser,
            // '--password', dbpass,
            '--db',       'culture',
            '--archive=backupFileName.gz',
            '--gzip'
          ]); 
    }
}
