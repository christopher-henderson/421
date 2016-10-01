var LoginLogout = require("./LoginLogout.js");
var Static = require("./Static.js");
var Landing = require("./Landing.js");
var Login = require("./LoginPage.js");
var Story = require("./Story.js");
var CreateStory = require("./CreateStory.js");
var Edit = require("./Edit.js");

module.exports = [
  ['^/login/?$', Login],
  ['^/story/.*$', Story],
  ['^/loginAction.*$', LoginLogout.Login],
  ['^/logoutAction.*', LoginLogout.Logout],
  ['^/?$', Landing],
  ['^/create/?$', CreateStory],
  ['^/edit/.*$', Edit],
  ['^.*$', Static],
];
