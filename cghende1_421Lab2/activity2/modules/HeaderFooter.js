

PREDULE = "<!DOCTYPE html>\n";
PREDULE += "<html>\n";
PREDULE += "<body>\n";
PREDULE += "<h1><a href='/'>Home</a></h1>";

LOGINFORM = "<form action='/loginAction' method='GET'>\n";
LOGINFORM += "<input type='text' name='username' pattern='.+'/><br>\n";
LOGINFORM += "<input type='password' name='password' pattern='.+'/><br>\n";
LOGINFORM += "<input required='true' type='submit' value='Login'><br>\n";
LOGINFORM += "Subscriber <input type='radio' name='role' value='Subscriber' checked>";
LOGINFORM += "Reporter <input type='radio' name='role' value='Reporter'>";
LOGINFORM += "</form>\n";
LOGINFORM += "<a href='/login'>or click here</a><br>";

LOGOUT = "<form action='/logoutAction' method='GET'>\n";
LOGOUT += "<button type='submit'>Logout</button>\n";
LOGOUT += "</form>\n";

CREATESTORY = "<h3><a href='/createPage/'>Create a Story</h3>";

FOOTER = "</body>\n";
FOOTER += "</html>\n";

exports.buildPage = function(req, body) {
  var response = PREDULE;
  if (req.loggedIn) {
    response += "<h3>Hello " + req.username + "</h3><br>";
    response += "your role is " + req.role;
    response += LOGOUT;
  } else {
    response += LOGINFORM;
  }
  if (req.role === "Reporter") {
    response += CREATESTORY;
  }
  response += body;
  response += FOOTER;
  return response;
};
