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
  var ROOT = path.dirname(__dirname);

  fs.readdir(ROOT, function(err, files) {
    var stories = files.filter(function(f) {
      return f.endsWith(".story");
    });
    var paths = stories.map(function(f) {
      return ROOT + path.sep + f;
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

function getStory(story, callback) {
  var root = path.dirname(__dirname);
  storyName = story.trim();
  storyName = storyName.slice(
    (storyName.startsWith("/")) ? 1 : 0,
    (storyName.endsWith("/")) ? storyName.length - 1 : storyName.length
  );
  storyName = storyName.toLowerCase();
  storyName = storyName.replace(/%20./g, function(s) {
    return s.slice(3).toUpperCase();
  });
  storyName += ".story";
  var file = root + path.sep + storyName;
  fs.readFile(file, 'utf-8', callback);
}

exports.getStory = getStory;
exports.getStories = getStories;
exports.Story = Story;
