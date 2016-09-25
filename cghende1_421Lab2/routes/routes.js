var LoginLogout = require("./LoginLogout.js");
var Static = require("./Static.js");

module.exports = [
  ['^/media/.*$', Static],
  ['^/login.*$', LoginLogout.Login],
  ['^/logout.*', LoginLogout.Logout]
];
