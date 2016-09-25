var fs = require('fs');

function concatenate(files) {
    var result = "";
    function lol(error, data) {
      result += data;
      if (files.length > 0) {
          fs.readFile(files.pop(), 'utf-8', lol);
      } else {
        console.log(result);
      }
    }
    fs.readFile(files.pop(), 'utf-8', lol);
}

exports.concatenate = concatenate;
