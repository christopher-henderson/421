var LoginLogout = require("./LoginLogout.js");
var Static = require("./Static.js");
var Landing = require("./Landing.js");
var Login = require("./LoginPage.js");
var Story = require("./Story.js");

module.exports = [
  ['^/login/?$', Login],
  ['^/story/.*$', Story],
  ['^/loginAction.*$', LoginLogout.Login],
  ['^/logoutAction.*', LoginLogout.Logout],
  ['^/?$', Landing],
  ['^.*$', Static]
];
