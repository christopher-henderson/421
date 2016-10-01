var fs = require('fs');
var path = require("path");
var url = require('url');

var mime = require("../modules/mime.js");
var r = require("../router/router.js");
var Handler = r.Handler;

var Static = Object.create(Handler);
Static.ROOT = path.dirname(__dirname);
Static.handle = function(req, res) {
  var urlObj = url.parse(req.url, true, false);
  fs.readFile(this.ROOT + urlObj.pathname, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime(urlObj.pathname)
    });
    res.end(data);
  });
};

module.exports = Static;
