var fs = require('fs');
var path = require("path");
var url = require('url');

var s = require("../modules/story.js");
var r = require("../router/router.js");
var f = require("../modules/file.js");
var hf = require("../modules/HeaderFooter.js");
var Handler = r.Handler;

var StoryHandler = Object.create(Handler);
StoryHandler.handle = function(req, res) {
  var urlObj = url.parse(req.url, true, false);
  // 7 === length of /story/
  var story = urlObj.pathname.slice(7);
  s.getStory(story, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.end("Story not found");
      return;
    }
    var storyObj = new s.Story(JSON.parse(data));
    if (!req.loggedIn && !storyObj.public) {
      res.writeHead(302, "Location: /login");
      res.end();
      return;
    }
    var ROOT = path.dirname(__dirname);
    var fragments = storyObj.fragments.map(function(file) {
      return ROOT + path.sep + "news" + path.sep + file;
    });
    f.concatenate(fragments, function(data) {
      if (storyObj.author === req.username && req.role === "Reporter") {
        var edit = "<a href='/edit/" + storyObj.title + "'>Edit</a><br>";
        data = edit + data;
      }
      res.writeHead(202);
      res.end(hf.buildPage(req, data));
    });
  });
};

module.exports = StoryHandler;
