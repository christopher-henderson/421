var files = require("./files.js")

function Router() {

  this.handlers = {};

  this.addContext = function(pathname, handler) {
    this.handlers[pathname] = handler;
  }

  this.route = function(req, res) {
    pathname = req;
    handler = this.handlers[pathname];
    if (handler === undefined) {
      console.log('404');
      return;
      // res.writeHead(404);
      // res.end('lol no');
    }
    handler.handle(req, res);
  }
}

function Handler() {
  this.handle = function(req, res) {
    console.log("500");
  }
}

var Awesome = Object.create(Handler);
Awesome.handle = function(req, res) {
  console.log('200');
}



router = new Router();


router.addContext("lol", Awesome)
router.addContext("asdas", new Handler())

router.route("lol", 5)
router.route("lul", 5)
router.route("asdas", 5)
