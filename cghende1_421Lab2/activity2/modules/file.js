var fs = require('fs');

function concatenate(files, callback) {
    var result = "";
    function inner(error, data) {
      result = data + result;
      if (files.length > 0) {
          fs.readFile(files.pop(), 'utf-8', inner);
      } else {
        callback(result);
      }
    }
    fs.readFile(files.pop(), 'utf-8', inner);
}

function writeFromRequest(req, callback) {
  var f = "";
  req.on('data', function (chunk) {
      f += chunk;
    });
  req.on('end', function () {
    fs.writeFile("/Users/chris/Documents/421/421/cghende1_421Lab2/activity2/lol", f, callback(f));
  });
}

exports.writeFromRequest = writeFromRequest;
exports.get = function(file, callback) {
  concatenate([file], callback);
};
exports.concatenate = concatenate;
