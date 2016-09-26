var path = require("path");
var fs = require("fs");

function Story(options) {
  this.title = options.Title;
  this.author = options.Author;
  this.public = (options.Public === "no") ? false : true;
  this.fragments = options.Fragments;
}

function getStories(callback) {
  var result = [];
  var root = path.dirname(__dirname);

  fs.readdir(root, function(err, files) {
    var stories = files.filter(function(f) {
      return f.endsWith(".story");
    });
    var paths = stories.map(function(f) {
      return root + path.sep + f;
    });
    function inner(error, data) {
      result.push(new Story(JSON.parse(data)));
      if (paths.length > 0) {
          fs.readFile(paths.pop(), 'utf-8', inner);
      } else {
        callback(result);
      }
    }
    fs.readFile(paths.pop(), 'utf-8', inner);
  });
}

exports.getStories = getStories;
