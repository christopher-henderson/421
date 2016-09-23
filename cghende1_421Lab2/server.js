var File = require("./modules/file.js");
var r = require("./modules/router.js");
var http = require('http');


var Awesome = Object.create(r.Handler);
Awesome.handle = function(req, res) {
  console.log('200');
  res.writeHead(200);
  res.end('yay!');
};



router = new r.Router();

router.addContext("^/lol/?$", Awesome);
router.addContext("/asdas", new r.Handler());
router.addContext('/uhoh');

http.createServer(function (request, response) {
  router.route(request, response);
}).listen(1337);
