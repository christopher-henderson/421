var fs = require('fs');
var path = require("path");
var url = require('url');

var r = require("../modules/router");
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

COOKIES = {};

var usernameFromCookie = function(cookie) {
  if (!cookie) {
    return "";
  }
  return cookie.split("=")[0];
};

var isLoggedIn = function(username) {
  return COOKIES[username] !== undefined;
};

var LoginService = Object.create(Handler);
LoginService.handle = function(req, res) {
  var query = url.parse(req.url, true, false).query;
  if (req.headers.cookie && isLoggedIn(query.username)) {
    res.writeHead(302, {'Location': '/'});
    res.end();
    return;
  }
  if (!(query.username && query.password && query.username === query.password)) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(403);
    res.end('Invalid Credentials.');
    return;
  }
  COOKIES[query.username] = true;
  res.writeHead(302, {
    'Set-Cookie': query.username + '=thisisatotallyfakedtokensdewf!!324we; Max-Age=31622400',
    'Location': '/'
  });
  res.end();
};

Logout = Object.create(Handler);
Logout.handle = function(req, res) {
  if (req.headers.cookie) {
    var username = req.headers.cookie.split("=")[0];
    if (isLoggedIn(username)) {
      delete COOKIES[username];
    }
    res.writeHead(302, {
      'Location': '/',
      'Set-Cookie': username + '=thisisatotallyfakedtokensdewf!!324we; Max-Age=0'
    });
  } else {
      res.writeHead(302, {'Location': '/'});
  }
  res.end();
};

module.exports = [
  ['^/media/.*$', Static],
  ['^/login.*$', LoginService],
  ['^/logout.*', Logout]
];
