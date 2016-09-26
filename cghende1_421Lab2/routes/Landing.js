var fs = require('fs');
var path = require("path");
var url = require('url');

var hf = require("../modules/HeaderFooter.js");
var story = require("../modules/story.js");
var r = require("../router/router.js");
var Handler = r.Handler;

var Landing = Object.create(Handler);
Landing.handle = function(req, res) {
  story.getStories(function(stories) {
    var page = "";
    for (var index in stories) {
      var story = stories[index];
      page += "<h2>";
      page += (req.loggedIn || story.public) ? "<a href='/story/" + story.title + "/'>" + story.title + "</a>" : story.title;
      page += "</h2>";
    }
    res.writeHead(200);
    res.end(hf.buildPage(req, page));
  });
};

module.exports = Landing;
