var url = require('url');

var c = require("../cookies/cookies.js");
var r = require("../router/router.js");
var Handler = r.Handler;


var Login = Object.create(Handler);
Login.handle = function(req, res) {
  var query = url.parse(req.url, true, false).query;
  if (req.loggedIn) {
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
  c.addCookie(query.username, query.role);
  res.writeHead(302, {
    'Set-Cookie': query.username + '=thisisatotallyfakedtokensdewf!!324we; Max-Age=31622400',
    'Location': '/'
  });
  res.end();
};

Logout = Object.create(Handler);
Logout.handle = function(req, res) {
  if (req.loggedIn) {
    c.deleteCookie(req.username);
    res.writeHead(302, {
      'Location': '/',
      'Set-Cookie': req.username + '=thisisatotallyfakedtokensdewf!!324we; Max-Age=0'
    });
  } else {
      res.writeHead(302, {'Location': '/'});
  }
  res.end();
};

exports.Login = Login;
exports.Logout = Logout;
