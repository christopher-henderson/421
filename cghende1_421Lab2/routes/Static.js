var fs = require('fs');
var path = require("path");
var url = require('url');

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
    res.writeHead(200);
    res.end(data);
  });
};

module.exports = Static;
