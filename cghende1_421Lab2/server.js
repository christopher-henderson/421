var File = require("./modules/file.js");
var r = require("./modules/router.js");
var http = require("http");
var handlers = require("./handlers/handlers.js");

router = new r.Router();

for (var i=0; i < handlers.length; i++) {
  router.addRoute(handlers[i][0], handlers[i][1]);
}

http.createServer(function (request, response) {
  router.route(request, response);
}).listen(1337);
