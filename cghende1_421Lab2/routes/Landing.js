var fs = require('fs');
var path = require("path");
var url = require('url');

var hf = require("../modules/HeaderFooter.js");
var r = require("../router/router.js");
var Handler = r.Handler;

var Landing = Object.create(Handler);
Landing.handle = function(req, res) {
  res.writeHead(200);
  res.end(hf.buildPage(req, "<br>LOL HI!<br>"));
};

module.exports = Landing;
