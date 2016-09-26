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
  if (!req.loggedIn) {
    req.role = "Guest";
  } else {
    req.role = COOKIES[req.username];
  }
  return req;
};

exports.addCookie = function(username, role) {
  COOKIES[username] = role;
};

exports.deleteCookie = function(username) {
  if (COOKIES[username]) {
    delete COOKIES[username];
  }
};
