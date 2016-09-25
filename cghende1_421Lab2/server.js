var http = require("http");

var routes= require("./routes/routes.js");
var r = require("./router/router.js");

router = new r.Router();

for (var i=0; i < routes.length; i++) {
  router.addRoute(routes[i][0], routes[i][1]);
}

http.createServer(function (request, response) {
  router.route(request, response);
}).listen(1337);
