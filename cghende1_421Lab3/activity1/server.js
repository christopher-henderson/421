var fs = require('fs');
var url = require('url');
var templateRoot = 'news/';

var path = require('path');
var express = require('express');
var app = express();
var bodyparser = require("body-parser");
var cookieparser = require('cookie-parser')();
var ejs = require('ejs');

app.set('views', './news');
app.engine('html', ejs.renderFile);

app.use(cookieparser);
app.use(bodyparser.urlencoded({extended: true}));
app.use(function(req, res, next) {
  // Step 1: Process headers. In this case, find the cookie
  var usernameDict = { username: "Jane Doe", role: "Guest" };
  var cookies = req.cookies;
  if (cookies.username !== undefined && cookies.role !== undefined) {
      usernameDict = {username: cookies.username, role: cookies.role};
  }
  req.usernameDict = usernameDict;
  next();
});
app.use('/media', express.static('media'));
app.use('/news', express.static('news'));

app.all('/', function(req, res) {
  res.writeHead(302, {Location: '/landing.html'});
  res.end();
});

app.get('^/landing.html$', function(req, res) {
  getStories(function(stories) {
    app.render("index.html", {
      username: req.usernameDict.username,
      role: req.usernameDict.role,
      stories: stories
    }, function(err, html) {
      res.send(html);
    });
  });
});

app.post('^/login/?$', function(req, res) {
  if (req.body.username === req.body.password) {
    res.cookie("username", req.body.username);
    res.cookie("role", req.body.role);
    res.redirect("/");
  } else {
    res.redirect("/login/");
  }
});

app.get('^/login/?$', function(req, res) {
  app.render("login.html", function(err, html) {
    res.send(html);
  });
});

app.all('^/logout/?$', function(req, res) {
  res.cookie("username", "", {maxAge: 0});
  res.cookie("role", "", {maxAge: 0});
  res.redirect("/");
});

app.all('^*.story$', function(req, res) {
  var fullpath = path.join(__dirname, path.basename(req.path));
  fs.readFile(fullpath, 'utf-8', function(err, data) {
    var obj = JSON.parse(data);
    obj.file = path.basename(fullpath);
    var story = new Story(obj);
    var fragmentPaths = story.fragments.map(function(fragment) {
      return path.join("news", fragment);
    });
    var HTMLFragments = [];
    function inner(err, data) {
      HTMLFragments.push(data);
      if (fragmentPaths.length > 0) {
        fs.readFile(fragmentPaths.shift(), 'utf-8', inner);
      } else {
        app.render("story.html",
          {
            username: req.usernameDict.username,
            role: req.usernameDict.role,
            story: story,
            fragments: HTMLFragments
          },
          function(err, html) {
            res.send(html);
          }
        );
      }
    }
    fs.readFile(fragmentPaths.shift(), 'utf-8', inner);
  });
});

app.all('^/addStoryPage/?$', function(req, res) { // endpoint for adding
  if (req.usernameDict.role != 'Reporter') {
      clientError(res, 403, "You are not authorized to use this page");
  } else {
    app.render("addStoryPage.html", function(err, html) {
      res.send(html);
    });
  }
});

app.all('^/editPage/?$', function(req, res){
  if (req.usernameDict.role != 'Reporter') {
      clientError(res, 403, "You are not authorized to use this page");
  } else {
      editStory(res, req.url, 'editStoryPage.html');
  }
});

app.post("^/metadata/?$", function(req, res) {
  if (req.usernameDict.role != 'Reporter') {
      clientError(res, 403, "You are not authorized to use this page");
  } else {
      createStory(req,res,req.usernameDict,false);
  }
});

app.post('^/editMetadata/?$', function(req, res) {
  if (req.usernameDict.role != 'Reporter') {
      clientError(res, 403, "You are not authorized to use this page");
  } else {
      createStory(req, res, req.usernameDict, true);
  }
});

app.post('^/html/?$', function(req, res) {
  if (req.usernameDict.role != 'Reporter') {
      clientError(res, 403, "You are not authorized to use this page");
  } else {
      createHTML(req.usernameDict, req, res);
  }
});

app.all('^/delete*$', function(req, res) {
  if (req.usernameDict.role != 'Reporter') {
      clientError(res, 403, "You are not authorized to use this page");
  } else {
      deleteFile(req.usernameDict, req.url, res);
  }
});

app.listen(3030);

function clientError(res, code, msg) {
    res.status(code);
    app.render("clientError.html", {code: code, msg: msg}, function(err, html) {
      res.send(html);
    });
}

function editStory(res, requrl, templateName){
  var renderedTemplate;
  //get file name
  var header = url.parse(requrl, true);
  var fileToBeEdited = header.query.name;  //*name*.story
  var filenameToBeEdited=fileToBeEdited.substring(0,fileToBeEdited.indexOf("."));  //name (without .story)
  //console.log("filenameToBeEdited::"+filenameToBeEdited);

  //read existing data
  fs.readFile(fileToBeEdited, function(err, contents) {
    var fileContent = JSON.parse(contents);
    app.render(templateName, {
      title: fileContent.Title,
      author: fileContent.Author,
      isPublic: fileContent.Public,
      fragments: fileContent.Fragments,
      filename: filenameToBeEdited
    }, function(err, html) {
      res.send(html);
    });
  });
}

function getStories(callback) {
  var result = [];
  var ROOT = __dirname;

  fs.readdir(ROOT, function(err, files) {
    var stories = files.filter(function(f) {
      return f.endsWith(".story");
    });
    var paths = stories.map(function(f) {
      return ROOT + path.sep + f;
    });
    function inner(error, data) {
      var fileName = path.basename(paths.pop());
      var obj = JSON.parse(data);
      obj.file = fileName;
      result.push(new Story(obj));
      if (paths.length > 0) {
          fs.readFile(paths[paths.length - 1], 'utf-8', inner);
      } else {
        callback(result);
      }
    }
    fs.readFile(paths[paths.length - 1], 'utf-8', inner);
  });
}

function renderStory(story, callback) {
  var fullpath = path.join(__dirname, path.basename(story));
  fs.readFile(fullpath, 'utf-8', function(err, data) {
    var obj = JSON.parse(obj);
    obj.file = path.basename(fullpath);
    var story = new Story(obj);
    var fragmentPaths = story.fragments.map(function(fragment) {
      return path.join("news", fragment);
    });
    var HTMLFragments = [];
    function inner(err, data) {
      HTMLFragments.push(data);
      if (fragmentPaths.length > 0) {
        fs.readFile(fragmentPaths.shift(), 'utf-8', inner);
      } else {
        app.render("story.html", {fragments: HTMLFragments}, function(err, html) {
          res.send(html);
        });
      }
    }
    fs.readFile(fragmentPaths.shift(), 'utf-8', inner);
  });
}

function deleteFile(userDict,requrl,res){
  //get file name to delete
  var header = url.parse(requrl, true);
  var fileToBeDeleted = header.query.name;
  //find its related html -_- also "are you sure u want to delete?"
  fs.unlink(fileToBeDeleted, function(err){
            if (err) throw err;
            res.redirect("/");
       });
}

function createStory(req,res,userDict,edit) {
  var filename=req.body.filename + ".story";
  var aa = req.body.Fragments.split(",");
  var array = aa.map(function(item){
    return item.trim();
  });
  var fileContent ={Title: req.body.Title,
                    Author: req.body.Author,
                    Public: req.body.Public,
                    Fragments: array
                  };
  fileContent = JSON.stringify(fileContent);
  //write filecontent to the .story file
  fs.writeFile(filename, fileContent, function(err) {
       console.error(err);
  });
  if(edit){
    res.redirect("/");
   } else {
    res.redirect("/addStoryPage");
  }
}

function createHTML(userDict,req,res) {
  var postData = req.body;
  var filename = templateRoot + postData.filename + ".html";
  var fileContent = postData.text;
  fs.writeFile(filename, fileContent, function(err) {
    if (err) {
      console.error(err);
    }
  });
  res.redirect("/");
}

function Story(options) {
  this.title = options.Title;
  this.author = options.Author;
  this.public = (options.Public === "no") ? false : true;
  this.fragments = options.Fragments;
  this.file = options.file;
}
