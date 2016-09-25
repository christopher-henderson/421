

PREDULE = "<!DOCTYPE html>\n";
PREDULE += "<html>\n";
PREDULE += "<body>\n";

LOGINFORM = "<form action='/login' method='GET'>\n";
LOGINFORM += "<input type='text' name='username' pattern='.+'/><br>\n";
LOGINFORM += "<input type='password' name='password' pattern='.+'/><br>\n";
LOGINFORM += "<input required='true' type='submit' value='Login'><br>\n";
LOGINFORM += "</form>\n";

LOGOUT = "<form action='/logout' method='GET'>\n";
LOGOUT += "<button type='submit'>Logout</button>\n";
LOGOUT += "</form>\n";

FOOTER = "</body>\n";
FOOTER += "</html>\n";

exports.buildPage = function(req, body) {
  var response = PREDULE;
  if (req.loggedIn) {
    response += LOGOUT;
  } else {
    response += LOGINFORM;
  }
  response += body;
  response += FOOTER;
  return response;
};
