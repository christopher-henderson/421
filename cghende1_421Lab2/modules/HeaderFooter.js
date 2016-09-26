

PREDULE = "<!DOCTYPE html>\n";
PREDULE += "<html>\n";
PREDULE += "<body>\n";

LOGINFORM = "<form action='/loginAction' method='GET'>\n";
LOGINFORM += "<input type='text' name='username' pattern='.+'/><br>\n";
LOGINFORM += "<input type='password' name='password' pattern='.+'/><br>\n";
LOGINFORM += "<input required='true' type='submit' value='Login'><br>\n";
LOGINFORM += "</form>\n";

LOGOUT = "<form action='/logoutAction' method='GET'>\n";
LOGOUT += "<button type='submit'>Logout</button>\n";
LOGOUT += "</form>\n";

FOOTER = "</body>\n";
FOOTER += "</html>\n";

exports.buildPage = function(req, body) {
  var response = PREDULE;
  if (req.loggedIn) {
    response += "<h3>Hello " + req.username + "</h3><br>";
    response += LOGOUT;
  } else {
    response += LOGINFORM;
  }
  response += body;
  response += FOOTER;
  return response;
};
