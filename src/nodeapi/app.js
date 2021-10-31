require("dotenv").config(); // load .env proeprties
require("./db/mongoose").connect(); // connect to mongodb with mongoose library
const express = require("express"); // req-res library
const multer = require('multer'); // allows functionality to get files(upload files)
const path = require('path'); // for working with files
const helpers = require('./helpers'); // helper file for multer
var cors = require('cors'); // cors 
const bcrypt = require("bcryptjs"); // encryption library
const jwt = require("jsonwebtoken"); // for user authentication
const auth = require("./middleware/auth"); // for user authentication

var nodemailer = require('nodemailer'); // to send mails

const funcs = require('./logic/functions'); // helper files to initiliaze the db

// models for db
const User = require("./models/user");
const Book = require("./models/book");
const Review = require("./models/review");
const Ranking = require("./models/ranking");
const Movie = require("./models/movie");
const Record = require("./models/record");

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.static('public', {index: 'entrance.html'}))

// for multer
const directory = path.join(__dirname, '/uploads');
app.use('/uploads', express.static(directory));

// for cors to work
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// app.options('*', cors()) // include before other routes
app.use(cors())

// multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, 'public/uploads');
  },

  // By default, multer removes file extensions so let's add them back
  filename: function(req, file, cb) {
    let myFile = req.get("email").replace('@', '_');
      cb(null, myFile + path.extname(file.originalname));
  }
});

// const { API_PORT } = process.env;
const port = process.env.API_PORT;
app.listen(port, () => {
  console.log(`listening on port: ${port}`)
});

app.get("/profile-pic", auth, async (req, res) => {

  console.log("In profile pic flow");
  
  const userInDB = await User.findOne({ email: req.get("email") });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  let fileName = userInDB.imagePath;

  console.log("picture file: " + fileName);
  if(!fileName) {
    return res.status(400).send("No photo");
  }

  res.status(200).sendFile(fileName);

});

app.post('/upload-profile-pic', async (req, res) => {

  console.log("In upload photo flow");

  const userInDB = await User.findOne({ email: req.get("email") });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }
  
  // 'profile_pic' is the name of our file input field in the HTML form
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('profile_pic');

  upload(req, res, function(err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any

      if (req.fileValidationError) {
        console.log(req.fileValidationError);
          return res.status(400).send(req.fileValidationError);
      }
      else if (!req.file) {
          return res.status(400).send('Please select an image to upload');
      }
      else if (err instanceof multer.MulterError) {
          return res.status(400).send(err);
      }
      else if (err) {
          return res.status(400).send(err);
    }

    var appDir = path.dirname(require.main.filename);
    
    // save user info
    userInDB.imagePath = appDir + "\\" + req.file.path;
    console.log("Image path: " + userInDB.imagePath);

    userInDB.save()
      .then(item => {
        console.log("user updated in database");
      })
      .catch(err => {
        console.log(`caught the error: ${err}`);
        return res.status(500).send("Oops. something went wrong, please contact administrator.");
      });

    // Display uploaded image for user validation
    console.log("Successful user photo upload")
    res.status(200).send(`Successful upload`);
  });
});

app.post("/register", async (req, res) => {
  try {
    console.log("In register flow");

    // Get user input
    const { firstname, lastname, email, password } = req.body;

    // Validate user input
    if (!(email && password && firstname && lastname)) {
      return res.status(400).send("All input is required");
    }

    // check if user already exists
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exists. Please Login");
    }

    // validate password
    if(!password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")) {
      const error = "Password not strong enough, should contain lowercase and uppercase letters, a number, special character and be at least 8 characters long";
      console.log(error);
      return res.status(400).send(error);
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 8);

    // Create user in our database
    const user = await User.create({
      firstName: firstname,
      lastName: lastname,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // return new user
    return res.status(201).send("OK");

  } catch (err) {
    console.log(err);
    return res.status(500).send("Oops. something went wrong, please contact administrator.");
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log("In login flow");
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      console.error("All input is required");
      res.status(400).send("All input is required");
      return;
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;
      user.save()
        .then(item => {
          console.log("user updated in database");
        })
        .catch(err => {
          console.log(`caught the error: ${err}`);
          return res.status(500).send("Oops. something went wrong, please contact administrator.");
        });

      console.log("User " + email + " logged in successfully");
      return res.status(200).send(token);
    }
    console.log("User " + email + " failed to log in");
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Oops. something went wrong, please contact administrator.");
  }
});

app.get("/favorite", auth, async (req, res) => {
  const email = req.get('email');
  const activity = req.get('activity');

  if (activity !== "books" && activity !== "movies") {
    return res.status(409).send("Wrong activity");
  }
  // Validate if user exists in our database
  const userInDB = await User.findOne({ email });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  let myRes = [];

  for (let element of userInDB.favorites) {
    if (element.activity !== activity) {
      continue;
    }
    if (activity === "books") {
      const book = await Book.findOne({ id: element.id });
      myRes.push(book);
    } else {
      const movie = await Movie.findOne({ id: element.id });
      myRes.push(movie);
    }
  };

  return res.status(200).send(myRes);
});

app.get("/isfavorite", auth, async (req, res) => {

  const email = req.get('email');
  const activity = req.get('activity');
  const id = req.get('id');

  if(activity !== "books" && activity !== "movies") {
    return res.status(409).send("Wrong activity");
  }

    // Validate if user exists in our database
    const userInDB = await User.findOne({ email });

    if (!userInDB) {
      return res.status(409).send("User does not exist");
    }

    for(let element of userInDB.favorites) {
      if(element.activity === activity && element.id === id) {
        console.log("Favorite found!");
        return res.status(200).send("true");
      }
    };

    console.log("Favorite not found!");
    return res.status(200).send("false");

});

app.delete("/favorite/delete", auth, async (req, res) => {

  const { email, activity, id } = req.body;

  console.log("Requesting to delete a favorite: ");
  console.log({ activity: activity, id: id, email: email });

  // Validate if user exists in our database
  const userInDB = await User.findOne({ email });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  var newFav = { activity: activity, id: id };

  // remove activity+id from the list of favorites
  userInDB.favorites.pull(newFav);
  userInDB.save()
    .then(item => {
      console.log("favorite removed from database");
    })
    .catch(err => {
      console.log(`caught the error: ${err}`);
      return res.status(500).send("Oops. something went wrong, please contact administrator.");
    });

  return res.status(200).send("OK");
});

app.post("/favorite/update", auth, async (req, res) => {

  const { email, activity, id } = req.body;

  // Validate if user exists in our database
  const userInDB = await User.findOne({ email });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  var newFav = { activity: activity, id: id };

  // add activity+id to the list of favorites if it doesn't exist
  let favoriteFound = false;

  for (let element of userInDB.favorites) {
    if (element.activity == activity && element.id == id) {
      favoriteFound = true;
    }
  };

  if (favoriteFound) {
    console.log("Favorite already exists, no need to add!");
  } else {
    console.log("Should add a new favorite!");
    userInDB.favorites.push(newFav);
    userInDB.save()
      .then(item => {
        console.log("favorite updated in database");
      })
      .catch(err => {
        console.log(`caught the error: ${err}`);
        return res.status(500).send("Oops. something went wrong, please contact administrator.");
      });
  }

  return res.status(200).send("OK");
});

app.post("/review", auth, async (req, res) => {
  const activity = req.get("activity");
  const id = req.get("id");
  const email = req.get("email");
  const myReview = req.get("myReview");

  console.log({ activity: activity, id: id, email: email, myReview: myReview });

  //save to mongoDb
  // If review exists for this specific email/activity/id in our database, need to update it
  // If doesn't exist - create it
  const filter = { email: email, id: id, activity: activity };
  const update = { desc: myReview };
  const options = { upsert: true, new: true };

  Review.findOneAndUpdate(filter, update, options, function (error, doc) {
    if (error) {
      console.log(error);
      return res.status(500).send("Server error");
    }

    return res.status(201).send("OK");
  });

});

app.delete("/review/delete", auth, async (req, res) => {
  const activity = req.get("activity");
  const id = req.get("id");
  const email = req.get("email");

  console.log("Requesting to delete a review: ");
  console.log({ activity: activity, id: id, email: email });

  Review.findOneAndDelete({ activity: activity, id: id, email: email }, function (error, doc) {
    if (error) {
      console.log(error);
      return res.status(500).send("Server error");
    }

    return res.status(200).send("Deleted");
  });
});

app.post("/ranking", auth, async (req, res) => {
  const activity = req.get("activity");
  const id = req.get("id");
  const email = req.get("email");
  const grade = req.get("grade");

  console.log({ activity: activity, id: id, email: email, grade: grade });

  //save to mongoDb
  // If ranking exists for this specific email/activity/id in our database, need to update it
  // If doesn't exist - create it
  const filter = { email: email, id: id, activity: activity };
  const update = { grade: grade };
  const options = { upsert: true, new: true };

  Ranking.findOneAndUpdate(filter, update, options, function (error, doc) {
    if (error) return res.status(500).send("Server error");
    return res.status(201).send("OK");
  });

});

app.delete("/ranking/delete", auth, async (req, res) => {
  const activity = req.get("activity");
  const id = req.get("id");
  const email = req.get("email");

  console.log("Requesting to delete ranking: ");
  console.log({ activity: activity, id: id, email: email });

  Ranking.findOneAndDelete({ activity: activity, id: id, email: email }, function (error, doc) {
    if (error) {
      console.log(error);
      return res.status(500).send("Server error");
    }

    return res.status(200).send("Deleted");
  });
});

app.get("/books", auth, async (req, res) => {

  const category = req.get("category");
  console.log("req category: " + req.headers.category);

  const findResult = await Book.find({ "category": { "$regex": category, "$options": "i" } },);
  
  Book.countDocuments({ "category": { "$regex": category, "$options": "i" } }).exec((err, count) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log({ count: count });
  });

  res.status(200).send(findResult);
});

app.get("/movies", auth, async (req, res) => {

  const genre = req.get("genre");
  const findResult = await Movie.find({ "genre": { "$regex": genre, "$options": "i" } },);

  Movie.countDocuments({ "genre": { "$regex": genre, "$options": "i" } }).exec((err, count) => {
    if (err) {
      console.log(err);
      return;
    }

    console.log({ count: count });
  });

  res.status(200).send(findResult);
});

app.get("/movie", auth, async (req, res) => {

  const id = req.get("id");
  const email = req.get("email");

  console.log("req id: " + id);

  //const findResult = await Movie.find({ genre: genre });
  let findResult = await Movie.findOne({ id: id });
  
  if(!findResult) {
    console.log("Failed to get movie info");
    return res.status(400).send("Couldn't find movie information");
  }

  const reviewRes = await Review.findOne({email: email, activity: "movies", id: id});

  var jsonResult = JSON.parse(JSON.stringify(findResult));
  

  if(reviewRes) {
    jsonResult.userReview = reviewRes.desc;
    //findResult.set('review', reviewRes.desc);
    //findResult.review = reviewRes.desc;
  }

  const rankingRes = await Ranking.findOne({ email: email, activity: "movies", id: id });
  if (rankingRes) {
    jsonResult.userRanking = rankingRes.grade;
    //findResult.set('review', reviewRes.desc);
    //findResult.review = reviewRes.desc;
  }

  const allRankingResults = await Ranking.find({ activity: "movies", id: id });
  if (allRankingResults) {
    let total = 0;
    let rankNum = 0;
    for (const res of allRankingResults) {
      total += res.grade;
      rankNum++;
    }
    jsonResult.totalRanking = total / rankNum;
  }

    // Check if the movie in favorites
    const userInDB = await User.findOne({ email });

    if (!userInDB) {
      return res.status(409).send("User does not exist");
    }
  
    let favoriteFound = false;
  
    for (let element of userInDB.favorites) {
      if (element.activity == "movies" && element.id == id) {
        favoriteFound = true;
      }
    };
  
    if(favoriteFound) {
      console.log("Favorite found!");
      jsonResult.favorite = "true";
    } else {
      console.log("Favorite NOT found!");
      jsonResult.favorite = "false";
    }

      // return all reviews for the book, except current user's review
  var allReviews = await Review.find( {$and: [{activity: 'movies',  id: id }, {email: { $ne: email}} ] });

  var jsonReviews = JSON.parse(JSON.stringify(allReviews));

  console.log(jsonReviews);

  for(var entry in jsonReviews) {
    console.log(jsonReviews[entry]);

    const userInDB = await User.findOne({ email: jsonReviews[entry].email });
    if(userInDB.email == email) {

    } else {
      jsonReviews[entry].name = userInDB.firstName + " " + userInDB.lastName;
      console.log(jsonReviews[entry]);
    }
  }

  // add jsonReviews to jsonResult
  jsonResult.reviews = jsonReviews;

  res.status(200).send(jsonResult);
});

app.get("/book", auth, async (req, res) => {

  const id = req.get("id");
  const email = req.get("email");

  console.log("req id: " + id);

  //const findResult = await Movie.find({ genre: genre });
  let findResult = await Book.findOne({ id: id });
  
  if(!findResult) {
    console.log("Failed to get book info");
    return res.status(400).send("Couldn't find book information");
  }

  const reviewRes = await Review.findOne({email: email, activity: "books", id: id});

  var jsonResult = JSON.parse(JSON.stringify(findResult));
  

  if(reviewRes) {
    jsonResult.userReview = reviewRes.desc;
    //findResult.set('review', reviewRes.desc);
    //findResult.review = reviewRes.desc;
  }

  const rankingRes = await Ranking.findOne({ email: email, activity: "books", id: id });
  if (rankingRes) {
    jsonResult.userRanking = rankingRes.grade;
    //findResult.set('review', reviewRes.desc);
    //findResult.review = reviewRes.desc;
  }

  const allRankingResults = await Ranking.find({ activity: "books", id: id });
  if (allRankingResults) {
    let total = 0;
    let rankNum = 0;
    for (const res of allRankingResults) {
      total += res.grade;
      rankNum++;
    }
    jsonResult.totalRanking = total / rankNum;
  }

  // Check if the book in favorites
  const userInDB = await User.findOne({ email });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  let favoriteFound = false;

  for (let element of userInDB.favorites) {
    if (element.activity == "books" && element.id == id) {
      favoriteFound = true;
    }
  };

  if(favoriteFound) {
    //console.log("Favorite found!");
    jsonResult.favorite = "true";
  } else {
    //console.log("Favorite NOT found!");
    jsonResult.favorite = "false";
  }

  // return all reviews for the book, except current user's review
  var allReviews = await Review.find( {$and: [{activity: 'books',  id: id }, {email: { $ne: email}} ] });

  var jsonReviews = JSON.parse(JSON.stringify(allReviews));

  //console.log(jsonReviews);

  for(var entry in jsonReviews) {
    //console.log(jsonReviews[entry]);

    const userInDB = await User.findOne({ email: jsonReviews[entry].email });
    if(userInDB.email == email) {

    } else {
      jsonReviews[entry].name = userInDB.firstName + " " + userInDB.lastName;
      //console.log(jsonReviews[entry]);
    }
  }

  // add jsonReviews to jsonResult
  jsonResult.reviews = jsonReviews;

  res.status(200).send(jsonResult);
});

app.get("/profile", auth, async (req, res) => {
  console.log("In get profile flow");

  // Get user input
  const email = req.get("email");

  // Validate user input
  if (!email) {
    res.status(400).send("User email was not sent");
  }

  // check if user exists
  // Validate if user exists in our database
  const userInDB = await User.findOne({ email });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  const result = { firstname: userInDB.firstName, lastname: userInDB.lastName, phone: userInDB.phone };
  return res.status(200).send(result);
});

app.post("/profile/update", auth, async (req, res) => {
  console.log("In update profile flow");
  console.log(req.body);

  const { email, firstname, lastname, phone } = req.body;

  // Validate user input
  if (!email) {
    res.status(400).send("User email was not sent");
  }

  // check if user exists
  // Validate if user exists in our database
  const userInDB = await User.findOne({ email });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  // save user info
  userInDB.firstName = firstname;
  userInDB.lastName = lastname;
  userInDB.phone = phone;

  userInDB.save()
    .then(item => {
      console.log("user updated in database");
    })
    .catch(err => {
      console.log(`caught the error: ${err}`);
      return res.status(500).send("Oops. something went wrong, please contact administrator.");
    });

  return res.status(200).send("OK");
});


app.post("/record/save", auth, async (req, res) => {
  console.log("In record save flow");
  console.log(req.body);

  const { email, gameName, score } = req.body;

  // Validate user input
  if (!email) {
    return res.status(400).send("User email was not sent");
  }

  // check if user exists
  // Validate if user exists in our database
  const userInDB = await User.findOne({ email });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  let query = {email: email, gameName: gameName};
  
  let shouldAdd = true;
  let numberOfRecords = 0;
  // count the number of records for the user

  const count = await Record.countDocuments(query);
  console.log("count:" + count);
  numberOfRecords = count;
  console.log("number of records: " + numberOfRecords);
  if (numberOfRecords > 2) {

    // get user's results for this game (should save just 3 best results)
    let findResult = await Record.find(query).sort({ "score": 1 }).limit(1);

    for await (const doc of findResult) {
      console.log(doc);

      console.log("doc.score: " + doc.score + ", new score: " + score);
      if (doc.score < score) {
        console.log("removing record");
        Record.findByIdAndDelete(doc._id, function (err) {
          if(err) console.log(err);
          console.log("Successful deletion");
        });
      } else {
        shouldAdd = false;
      }
    }
  }

  console.log("shouldAdd: " + shouldAdd);
  if (shouldAdd) {
    var newRecord = new Record();
    newRecord.email = email;
    newRecord.score = score;
    newRecord.gameName = gameName;
    newRecord.date = new Date().toLocaleString();

    console.log("Adding the following record: " + newRecord);
    newRecord.save()
      .then(item => {
        console.log("item saved to database");
        return res.status(200).send("Record saved");
      })
      .catch(err => {
        console.log(`caught the error: ${err}`);
        return res.status(400).send(`caught the error: ${err}`);
      });
  } else {
    return res.status(200).send("OK");
  }
});

app.get("/records", auth, async (req, res) => {

  console.log("In records get flow");

  const email = req.get('email');
  const gameName = req.get('gameName');

    // Validate user input
    if (!email) {
      return res.status(400).send("User email was not sent");
    }
  
    // check if user exists
    // Validate if user exists in our database
    const userInDB = await User.findOne({ email });
  
    if (!userInDB) {
      return res.status(409).send("User does not exist");
    }

  let query = {email: email, gameName: gameName};

  const count = await Record.countDocuments(query);
  console.log("count:" + count);

  if(count == 0) {
    return res.status(200).send({"norecords": "No records yet!"});
  } else {
    const findResult = await Record.find(query).sort({ "score": -1 });
    res.status(200).send(findResult);
  }

});

app.get("/records/total", auth, async (req, res) => {

  console.log("In total records get flow");

  const gameName = req.get('gameName');

  let query = {gameName: gameName};

  const count = await Record.countDocuments(query);
  console.log("count:" + count);

  if(count == 0) {
    return res.status(200).send({"norecords": "No records yet!"});
  } else {
    const findResult = await Record.find(query).sort({ "score": -1 }).limit(5);

    var jsonResult = JSON.parse(JSON.stringify(findResult));

    console.log(jsonResult);

    for(var entry in jsonResult) {
      console.log(jsonResult[entry]);

      const userInDB = await User.findOne({ email: jsonResult[entry].email });
      jsonResult[entry].name = userInDB.firstName + " " + userInDB.lastName;
      console.log(jsonResult[entry]);
    }


    res.status(200).send(jsonResult);
  }

});

app.post("/contact", async (req, res) => {
  console.log("In contact flow");

  const { mail, name, phone, subject, message } = req.body;

  let mailText = 'Hi! I am ' + name + ', my email is ' + mail + ' and my phone is ' + phone;
  mailText += ' I have sent you a message on the site contact page. Subject: ' + subject;
  mailText += ' Message: ' + message;


  var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    tls:{
      rejectUnauthorized:false
    },
    //ignoreTLS: true,
    auth: {
      user: process.env.MY_MAIL,
      pass: process.env.MY_PASS
    }
  };

  var transporter = nodemailer.createTransport(smtpConfig);
  
  var mailOptions = {
    from: process.env.MY_MAIL,
    to: process.env.MY_MAIL,
    subject: name + ' has contacted you',
    text: mailText
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

});

app.post("/reset", async (req, res) => {
  console.log("In reset flow");

  const { mail } = req.body;

  const userInDB = await User.findOne({ email: mail });

  if (!userInDB) {
    return res.status(409).send("User does not exist");
  }

  var pLength = 12;
  var keyListAlpha = "abcdefghijklmnopqrstuvwxyz",
    keyListUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    keyListInt = "123456789",
    keyListSpec = "!@#_",
    password = '';
  var len = Math.ceil(pLength / 3);
  len = len - 1;
  var lenSpec = pLength - 2 * len;

  for (i = 0; i < len; i++) {
    password += keyListAlpha.charAt(Math.floor(Math.random() * keyListAlpha.length));
    password += keyListInt.charAt(Math.floor(Math.random() * keyListInt.length));
    password += keyListUpper.charAt(Math.floor(Math.random() * keyListUpper.length));
  }

  for (i = 0; i < lenSpec; i++)
    password += keyListSpec.charAt(Math.floor(Math.random() * keyListSpec.length));

  password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');

  console.log(password);

  // password generated - should update the db and send to the user

  //Encrypt user password
  encryptedPassword = await bcrypt.hash(password, 8);
  userInDB.password = encryptedPassword;

  // save user to DB
  userInDB.save()
    .then(item => {
      console.log("user updated in database");
    })
    .catch(err => {
      console.log(`caught the error: ${err}`);
      return res.status(500).send("Oops. something went wrong, please contact administrator.");
    });

    // send the password to the user
    let mailText = 'Your new password is: ' + password;


  var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    tls:{
      rejectUnauthorized:false
    },
    //ignoreTLS: true,
    auth: {
      user: 'rosiprojectacc@gmail.com',
      pass: 'R0$1R0$1'
    }
  };

  var transporter = nodemailer.createTransport(smtpConfig);
  
  var mailOptions = {
    from: process.env.MY_MAIL,
    to: mail,
    subject: 'Password was reset successfully',
    text: mailText
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

    res.status(200).send("Check email for new password");

});

app.get('/', function(req, res)
{
    res.sendFile(path.resolve('./entrance.html'));
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

funcs.initBooks();
funcs.initMovies();
setInterval(funcs.backupDB, 24 * 60 * 60 * 1000); // run backup every 24 hours
//funcs.backupDB();