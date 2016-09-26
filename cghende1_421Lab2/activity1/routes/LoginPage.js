var fs = require('fs');
var path = require("path");
var url = require('url');

var hf = require("../modules/HeaderFooter.js");
var story = require("../modules/story.js");
var r = require("../router/router.js");
var Handler = r.Handler;

var Login = Object.create(Handler);
Login.handle = function(req, res) {
  if (req.loggedIn) {
    res.writeHead(302, "Location: /");
    res.end();
  }
  res.end(hf.buildPage(req, ""));
};

module.exports = Login;
