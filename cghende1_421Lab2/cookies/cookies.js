COOKIES = {};

var usernameFromCookie = function(cookie) {
  if (!cookie) {
    return null;
  }
  return cookie.split("=")[0];
};

isLoggedIn = function(username) {
  if (!username) {
    return false;
  }
  return COOKIES[username] !== undefined;
};

exports.setCookieInfo = function(req) {
  req.username = usernameFromCookie(req.headers.cookie);
  req.loggedIn = isLoggedIn(req.username);
  return req;
};

exports.addCookie = function(username) {
  COOKIES[username] = true;
};

exports.deleteCookie = function(username) {
  if (COOKIES[username]) {
    delete COOKIES[username];
  }
};
