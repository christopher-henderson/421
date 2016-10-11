var fs = require('fs');
var url = require('url');
var qstring = require('querystring');
var templateRoot = 'news/';
var mimeTypes = {};

var path = require('path');
var express = require('express');
var app = express();
var session = require("express-session");
var cookieparser = require('cookie-parser')();
var ejs = require('ejs');

function Story(options) {
  this.Title = options.Title;
  this.Author = options.Author;
  this.Public = (options.Public === "no") ? false : true;
  this.Fragments = options.Fragments;
  this.File = options.File;
}

app.set('views', './news');

app.engine('html', ejs.renderFile);

app.use(cookieparser);

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

app.use(session({
  secret: 'IVTK4OO8zLMgzia',
  resave: true,
  saveUninitialized: true
}));

app.use('/media', express.static('media'));

app.all('/', function(req, res) {
  res.redirect("/landing.html");
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
  login(req, res);
});

app.get('^/login/?$', function(req, res) {
  app.render("login.html", function(err, html) {
    res.send(html);
  });
});

app.all('^/logout/?$', function(req, res) {
  logout(res);
});

app.get("^/buy/*.story$", function(req, res) {
  var fileName = path.basename(req.path);
  getStory(fileName, function(story) {
    app.render("buy.html",
      {
        story: story,
        username: req.usernameDict.username,
        role: req.usernameDict.role
      }, function(err, html) {
        res.send(html);
    });
  });
});

app.get("^/payment/*$", function(req, res) {
  req.session.email = req.query.email;
  req.session.address = req.query.address;
  req.session.story = new Story(JSON.parse(req.query.story));
  app.render("payment.html",
    {
      username: req.usernameDict.username,
      role: req.usernameDict.role,
      session: req.session
    }, function(err, html){
      res.send(html);
  });
});

app.get("^/confirmation/*$", function(req, res) {
  req.session.creditCard = req.query.creditCard;
  req.session.billingAddress = req.query.billingAddress;
  app.render("confirmation.html", {
    username: req.usernameDict.username,
    role: req.usernameDict.role,
    session: req.session
  }, function(err, html) {
    if (err) {
      console.log(err);
    }
    res.send(html);
  });
});

app.get("^/confirmed/?$", function(req, res) {
  var story = req.session.story;
  req.session = null;
  res.redirect("/" + story.File);
});

app.all('^*.story$', function(req, res) {
  var fullpath = path.join(__dirname, path.basename(req.path));
  fs.readFile(fullpath, 'utf-8', function(err, data) {
    var obj = JSON.parse(data);
    obj.File = path.basename(fullpath);
    var story = new Story(obj);
    var fragmentPaths = story.Fragments.map(function(fragment) {
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

app.all('^/media/*$', function(req, res) {

  renderMedia(res, req.path);
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

app.listen(3030, initMimeTypes);


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

function getStory(story, callback) {
  fs.readFile(story, 'utf-8', function(err, data){
    storyObj = new Story(JSON.parse(data));
    storyObj.File = story;
    callback(storyObj);
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
      obj.File = fileName;
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
    obj.File = path.basename(fullpath);
    var story = new Story(obj);
    var fragmentPaths = story.Fragments.map(function(fragment) {
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

function initMimeTypes() {
    var strs = [];

    // from Node documentation on readline
    // https://nodejs.org/api/readline.html
    const readline = require('readline');

    const rl = readline.createInterface({
        input: fs.createReadStream('mime.types')
    });

    rl.on('line', (line) => {
        line = line.trim();
        if (!line.startsWith("#")) {
            // not commented out. Split on whitespace
            // thanks http://stackoverflow.com/questions/14912502
            strs = line.match(/\S+/g) || [];
            // if it is 1 no extensions are present
            // if > 1 then 1 or more extensions present
            // add a mime type entry for each one
            for (i = 1; i < strs.length; i++) {
                mimeTypes[strs[i]] = strs[0];
            }
        }
    });
}

function createStory(req,res,userDict,edit) {
  var jsonData = "";
  req.on('data', function (chunk) {
    jsonData += chunk.toString();
  });
  req.on('end', function () {
    var postData = qstring.parse(jsonData);
    var filename=postData.filename + ".story";
    var aa = postData.Fragments.split(",");
    var array=[];
    for(var b in aa){
      array.push(aa[b].trim());
    }
    var fileContent ={Title: postData.Title,
                      Author: postData.Author,
                      Public: postData.Public,
                      Fragments: array
                    };
    fileContent = JSON.stringify(fileContent);
    //write filecontent to the .story file
    fs.writeFile(filename, fileContent, function(err) {
         console.error(err);
   });
  });
  if(edit){
    res.redirect("/");
   } else {
    res.redirect("/addStoryPage");
    // renderGeneric(res, 'addStoryPage.html');
  }
}

function createHTML(userDict,req,res) {
  var jsonData = "";
  req.on('data', function (chunk) {
    jsonData += chunk.toString();
  });
  req.on('end', function () {
    var postData = qstring.parse(jsonData);
    var filename = templateRoot + postData.filename + ".html";
    var fileContent = postData.text;
    fs.writeFile(filename, fileContent, function(err) {
         console.error(err);
   });
  });
  res.redirect("/");
}

function login(req,res) {
  var bodyData = "";
  req.on('data', function (chunk) {
    bodyData += chunk.toString();
  });
  req.on('end', function () {
    var postData = qstring.parse(bodyData);
    var role = postData.role;
    var username = postData.username;
    if (username === postData.password) {
      res.cookie("username", username);
      res.cookie("role", role);
      res.redirect("/");
    } else {
      res.redirect("/login/");
    }
  });
}

function logout(res) {
  res.cookie("username", "", {maxAge: 0});
  res.cookie("role", "", {maxAge: 0});
  res.redirect("/");
}
