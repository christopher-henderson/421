var url = require('url');
var qstring = require('querystring');

var c = require("../cookies/cookies.js");
var hf = require("../modules/HeaderFooter.js")

function Router() {

  this.patterns = [];

  this.addRoute = function(pattern, handler) {
    this.patterns.push(new Route(pattern, handler || new Handler()));
  };

  this.route = function(req, res) {
    // Not particularly efficient, but I want the regular expression matching
    // over constant time routing in this assignment.
    var urlObj = url.parse(req.url, true, false);
    var pathname = urlObj.pathname;
    for (var index=0; index < this.patterns.length; index++) {
      var handler = this.patterns[index].handlerOrNull(pathname);
      if (handler !== null) {
        // Asks the cookie service to fill in loggedIn and username.
        var filledReq = c.setCookieInfo(req);
        return handler.handle(filledReq, res);
      }
    }
    return NotFound.handle(req, res);
  };
}

function Handler() {
  this.handle = function(req, res) {
    console.log("500");
    res.writeHead(500);
    res.end('WHOOPS!');
  };
}

function Route(pattern, handler) {
  this.pattern = new RegExp(pattern);
  this.handler = handler;
  this.handlerOrNull = function(path) {
    return (this.pattern.exec(path) !== null) ? this.handler : null;
  };
}

var NotFound = Object.create(Handler);
NotFound.handle = function(req, res) {
  console.log('404');
  res.writeHead(404);
  res.end(hf.buildPage(req, "Not Found."));
};

exports.Handler = Handler;
exports.Router = Router;
