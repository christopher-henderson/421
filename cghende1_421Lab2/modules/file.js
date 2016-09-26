var fs = require('fs');

function concatenate(files, callback) {
    var result = "";
    function inner(error, data) {
      result += data;
      if (files.length > 0) {
          fs.readFile(files.pop(), 'utf-8', inner);
      } else {
        callback(result);
      }
    }
    fs.readFile(files.pop(), 'utf-8', inner);
}

exports.get = function(file, callback) {
  concatenate([file], callback);
};
exports.concatenate = concatenate;
