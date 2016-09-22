var url = require('url');
var qstring = require('querystring');

function Router() {

  this.handlers = {};

  this.addContext = function(pathname, handler) {
    this.handlers[pathname] = handler;
  }

  this.route = function(req, res) {
    var urlObj = url.parse(req.url, true, false);
    var pathname = urlObj.pathname;
    console.log(pathname);
    handler = this.handlers[pathname];
    if (handler === undefined) {
      console.log('404');
      res.writeHead(404);
      res.end('lol no');
      return
    }
    handler.handle(req, res);
  }
}

function Handler(req, res) {
  this.handle = function(req, res) {
    console.log("500");
    res.writeHead(500);
    res.end('WHOOPS!');
  }
}

exports.Handler = Handler;
exports.Router = Router;
