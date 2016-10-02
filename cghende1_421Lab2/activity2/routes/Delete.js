var fs = require('fs');
var path = require("path");
var url = require('url');

var s = require("../modules/story.js");
var r = require("../router/router.js");
var f = require("../modules/file.js");
var hf = require("../modules/HeaderFooter.js");
var Handler = r.Handler;

var Delete = Object.create(Handler);
Delete.handle = function(req, res) {
  var ROOT = path.dirname(__dirname);
  var urlObj = url.parse(req.url, true, false);
  var storyName = s.normalizeName(urlObj.pathname.slice(8)) + ".story";
  fs.unlink(ROOT + path.sep + storyName, function(err) {
    res.writeHead(302, {"Location": "/"});
    res.end();
  });
};

module.exports = Delete;
