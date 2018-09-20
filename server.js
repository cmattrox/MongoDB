var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000

var app = express();


app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongohomework";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


app.get("/scrape", function(req, res) {
  db.Article.find({}).then(function(dbArticle) {
      priorTitles = []
      for (k=0;k<dbArticle.length;k++){
        oldTitle = dbArticle[k].title
        priorTitles.push(oldTitle)
      }
      axios.get("http://www.espn.com/nfl/team/_/name/kc/").then(function(response) {
        var $ = cheerio.load(response.data);

        $("article div div h1").each(function(i, element) {
          var result = {};

          result.title = $(this)
            .children("a")
            .text();
          result.link = $(this)
            .children("a")
            .attr("href");
          result.summary = $(this)
            .parent()
            .children("p")
            .text();

          if(priorTitles.indexOf(result.title)==-1){
            db.Article.create(result)
              .then(function(dbArticle) {
              })
              .catch(function(err) {
                return res.json(err);
              });
            }
        });

        res.send("Scrape Complete");
      });
    })
  .catch(function(err) {
    res.json(err);
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .sort({dateAdded: -1})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id})
  .populate("note")
  .then(function(dbArticle) {
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err)
  })
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body).then(function(dbNote) {
    return db.Article.findOneAndUpdate({_id: req.params.id},{"$push":{ note: dbNote._id }},{ new: true, "upsert": true  });
  })
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  });
});
app.post("/articles/remove/:id", function(req, res) {
  db.Note.findOneAndRemove({_id: req.params.id}).then(function(dbNote) {
    res.json(dbNote);
  })
  .catch(function(err) {
    res.json(err);
  });
});

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});