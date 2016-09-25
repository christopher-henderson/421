var LoginLogout = require("./LoginLogout.js");
var Static = require("./Static.js");
var Landing = require("./Landing.js");

module.exports = [
  ['^/media/.*$', Static],
  ['^/login.*$', LoginLogout.Login],
  ['^/logout.*', LoginLogout.Logout],
  ['^/?$', Landing]
];
