var LoginLogout = require("./LoginLogout.js");
var Static = require("./Static.js");
var Landing = require("./Landing.js");
var Login = require("./LoginPage.js")

module.exports = [
  ['^/media/.*$', Static],
  ['^/login/?$', Login],
  ['^/loginAction.*$', LoginLogout.Login],
  ['^/logoutAction.*', LoginLogout.Logout],
  ['^/?$', Landing]
];
