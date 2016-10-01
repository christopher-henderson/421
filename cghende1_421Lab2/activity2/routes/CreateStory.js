var url = require('url');
var path = require("path");
var fs = require("fs");
var qstring = require("querystring");

var c = require("../cookies/cookies.js");
var r = require("../router/router.js");
var f = require("../modules/file.js");
var s = require("../modules/story.js");
var Handler = r.Handler;

var ROOT = path.dirname(__dirname);
var CreateStory = Object.create(Handler);
CreateStory.handle = function(req, res) {
  readRequest(req, function(data) {
    var args = qstring.parse(data);
    var normalizedName = s.normalizeName(args.Title);
    var filePath = ROOT + path.sep + normalizedName + ".story";
    args.Fragments = args.Fragments.filter(function(frag) {
      return frag !== "";
    });
    s.saveFragments(args.Title, args.Fragments, function(fragNames) {
      args.Fragments = fragNames;
      fs.writeFile(filePath, JSON.stringify(args), function(err) {
        res.writeHead(302, {"Location": "/"});
        res.end();
      });
    });
  });
};

function readRequest(req, callback) {
  var q = "";
  req.on('data', function (chunk) {
      q += chunk;
    });
  req.on('end', function () {
    callback(q);
  });
}

module.exports = CreateStory;
