var fs = require('fs');
var path = require("path");
var url = require('url');

var s = require("../modules/story.js");
var r = require("../router/router.js");
var f = require("../modules/file.js");
var hf = require("../modules/HeaderFooter.js");
var Handler = r.Handler;

var Confirm = Object.create(Handler);
Confirm.handle = function(req, res) {
  var urlObj = url.parse(req.url, true, false);
  var storyName = urlObj.pathname.slice(9);
  var body = `<h2>Confirm deletion of ${storyName}</h2><br>
      <a href="/delete/${storyName}"><button type="submit">DELETE</button></a><br>`;
  res.writeHead(200);
  res.end(hf.buildPage(req, body));
};

module.exports = Confirm;
