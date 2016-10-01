var path = require("path");
var fs = require("fs");

function Story(options) {
  this.json = options;
  this.title = options.Title;
  this.author = options.Author;
  this.public = (options.Public === "no") ? false : true;
  this.fragments = options.Fragments;

  this.save = function() {

  };
}

nameFragments = function(title, fragments) {
  index = 1;
  return fragments.map(function(_) {
    var name = title + index.toString() + ".html";
    index += 1;
    return name;
  });
};

saveFragments = function(title, fragments, callback) {
  var normalizedName = normalizeName(title);
  var ROOT = path.dirname(__dirname);
  var filePath = ROOT + path.sep + "news" + path.sep;
  var fragmentNames = nameFragments(normalizedName, fragments);
  index = 0;
  function inner(error, data) {
    if (index < fragmentNames.length) {
      var fullPath = filePath + fragmentNames[index];
      index += 1;
      fs.writeFile(fullPath, fragments[index-1], inner);
    } else {
      callback(fragmentNames);
    }
  }
  var fullPath = filePath + index.toString();
  fs.writeFile(fullPath, fragments[index-1], inner);
};

function normalizeName(story) {
  var storyName = story.trim();
  storyName = storyName.slice(
    (storyName.startsWith("/")) ? 1 : 0,
    (storyName.endsWith("/")) ? storyName.length - 1 : storyName.length
  );
  storyName = storyName.toLowerCase();
  storyName = storyName.replace(/(%20| )./g, function(s) {
    if (s.startsWith("%20")) {
      return s.slice(3).toUpperCase();
    } else {
      return s.slice(1).toUpperCase();
    }
  });
  return storyName;
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
  var storyName = normalizeName(story) + ".story";
  var file = root + path.sep + storyName;
  fs.readFile(file, 'utf-8', callback);
}

exports.getStory = getStory;
exports.getStories = getStories;
exports.Story = Story;
exports.saveFragments = saveFragments;
exports.normalizeName = normalizeName;
