

//------------------BOILER PLATE-----------------------

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

        //------------MIDDLEWARE CONFIGURATION---------

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/getmynews", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/getmynews";

mongoose.connect(MONGODB_URI);
        //------------MIDDLEWARE CONFIGURATION---------

//------------------BOILER PLATE-----------------------

//------------------ROUTES-----------------------



// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {


    // First, we grab the body of the html with axios
    axios.get("https://www.npr.org/sections/news/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("article").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("div")
          .children("div")
          .children("h2")
          .children("a")
          .text();

        result.summary = $(this)
          .children("div")
          .children("div")
          .children("p")
          .children("a")
          .text()

        //------------
        result.link = $(this)
          .children("div")
          .children("div")
          .children("h2")
          .children("a")
          .attr("href");
  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });

      //-----------


      //-----------
  
      
      // Send a message to the client
      res.send("Scrape Complete");
    //   window.location.replace('/');
    });

    res.redirect('/');
    res.redirect('/');

  });


  
  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({})
      .then(function (dbArticle) {
        res.json(dbArticle);
      })
  
  });

  app.post("/clear", function(req, res) {

    db.Article.collection.drop();
    db.Note.collection.drop();
    res.end();
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    // db.Article.find({_id:mongojs.ObjectId(req.params.id)}, function(err,found) {
    //   if(err) throw err;
    //   else {
    //     res.json(found)
    //   }
    // })
  
    db.Article.findOne({_id:req.params.id})
      .populate("note")
      .then(function(dbArticle) {
        res.json(dbArticle)
      })
      .catch(err => {
        res.json(err);
      })
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/articles/:id", function(req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
  
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate( {_id: req.params.id},{note:dbNote._id}, {new:true})
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(err => {
        res.json(err);
      })
  });
  
//------------------ROUTES-----------------------

//------------------APP LISTEN-----------------------
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  
//------------------APP LISTEN-----------------------