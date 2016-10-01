var fs = require('fs');
var path = require("path");
var url = require('url');

var s = require("../modules/story.js");
var r = require("../router/router.js");
var f = require("../modules/file.js");
var hf = require("../modules/HeaderFooter.js");
var Handler = r.Handler;

// <!DOCTYPE html>
// <html>
// <body>
//
// <form action='/create' method='POST' enctype="application/json">
//   Title: <input type='text' name='Title' pattern='.+'/><br>
//   Author: <input type='text' name='Author' pattern='.+'/><br>
//   Public: <input type='radio' name='Public' value='yes' checked>
//   Private: <input type='radio' name='Public' value='no'><br>
//   Fragements: <input type="text" name="Fragments">
//               <input type="text" name="Fragments">
//               <input type="text" name="Fragments">
//               <input type="text" name="Fragments">
//               <input type="text" name="Fragments">
//               <input type="text" name="Fragments">
//   <button type='submit'>Submit</button>
// </form>
//
// </body>
// </html>

function getFragments(files, callback) {
  var ROOT = path.dirname(__dirname);
  var filePath = ROOT + path.sep + "news" + path.sep;
  files = files.map(function(f) {
    return filePath + f;
  });
  var result = [];
  function inner(error, data) {
    result.push(data);
    if (files.length > 0) {
        fs.readFile(files.shift(), 'utf-8', inner);
    } else {
      callback(result);
    }
  }
  fs.readFile(files.shift(), 'utf-8', inner);
}


var Edit = Object.create(Handler);
Edit.handle = function(req, res) {
  var urlObj = url.parse(req.url, true, false);
  var storyName = urlObj.pathname.slice(6);
  s.getStory(storyName, function(err, data) {
    var story = new s.Story(JSON.parse(data));
    var isPublic = (story.public) ? "checked" : "";
    var isPrivate = (story.public) ? "" : "checked";
    getFragments(story.fragments, function(frags) {
      var body = `<!DOCTYPE html>
        <html>
        <body>

        <form action='/create' method='POST' enctype="application/json">
          Title: <input type='text' name='Title' value="${story.title}" pattern='.+'/><br>
          Author: <input type='text' name='Author' value="${story.author}" pattern='.+'/><br>
          Public: <input type='radio' name='Public' value='yes' ${isPublic}/>
          Private: <input type='radio' name='Public' value='no' ${isPrivate}/><br>
          Fragements: `;
        for (var index in frags) {
          body += `<input type="text" name="Fragments", value="${frags[index]}">`;
        }
        body += "<br><button type='submit'>Submit</button></form></body></html>";
        res.writeHead(200);
        res.end(hf.buildPage(req, body));
    });
  });
};

module.exports = Edit;