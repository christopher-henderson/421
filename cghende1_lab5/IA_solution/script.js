SENTITY = {

  DEBUG: false,

  TAG_URL: 'https://api.sentity.io/v1/tag',
  SENTIMENT_URL: 'https://api.sentity.io/v1/sentiment',
  // Super secret. Do not steal.
  AUTH_TOKEN: 'token 67109a7ab8b2557f122d6c0bad679b481df77eb7',
  JSON_HEADER: 'application/json',
  POST: 'POST',
  GET: 'GET',
  ADJECTIVE: 'JJ',
  ADVERB: 'RB',
  TOTAL_WORDS_SEEN: 0,
  TOTAL_SCORE: 0,
  TOTAL_POSITIVE: 0,
  TOTAL_NEGATIVE: 0,
  AVERAGE_SCORE: 0,
  NEUTRAL: 0,

  get_timout_phrase: function() {
    var negative = "You seem sad today, what is the matter?";
    var positive = "Well you are happy today, why?";
    var both_high = "You seem moody today, what's up?";
    var both_low = "You are so emotionless, tell me what you are feeling?";
    var avg_negative = this.TOTAL_WORDS_SEEN !== 0 ? this.TOTAL_NEGATIVE * -1  / this.TOTAL_WORDS_SEEN : 0;
    var avg_positive = this.TOTAL_WORDS_SEEN !== 0 ? this.TOTAL_POSITIVE / this.TOTAL_WORDS_SEEN : 0;
    this.log(avg_positive);
    this.log(avg_negative);
    var threshold = 0.4;
    var negative_above_threshold = avg_negative >= threshold;
    var positive_above_threshold = avg_positive >= threshold;
    if (!(negative_above_threshold || positive_above_threshold)) {
      return both_low;
    } else if (negative_above_threshold && positive_above_threshold) {
      return both_high;
    } else if (negative_above_threshold) {
      return negative;
    } else {
      return positive;
    }
  },

  log: function(obj) {
    if (this.DEBUG) {
      console.log(obj);
    }
  },

  get_request_object: function() {
    if (window.XMLHttpRequest) {
      this.log("Creating AJAX object.");
      return new XMLHttpRequest();
    } else {
      this.log("AJAX not supported.");
      return(null);
    }
  },

  respond_to_error: function(status) {
    switch (status) {
      case 400:
        alert("The request cannot be fulfilled due to bad syntax. For example invalid JSON was submitted to one of the API endpoints.");
        break;
      case 401:
        alert("Authentication failed due to missing or invalid API key.");
        break;
      case 422:
        alert("A client error prevented the request from executing succesfully. For example required field is missing.");
        break;
      case 429:
        alert("API rate limit exceeded.");
        break;
      default:
        alert("Unknown error. Code: " + status);
    }
  },

  register_input: function(text) {
    text = text.replace(/\s/g, "%20");
    var request = this.get_request_object();
    var url = this.TAG_URL + "?text=" + text;
    this.log("Sending: " + url);
    request.onreadystatechange = this.handle_tags;
    request.open(this.GET, url, true);
    request.setRequestHeader('Authorization', this.AUTH_TOKEN);
    request.send(null);
    this.log("Sent: " + url);
  },

  handle_tags: function(request) {
    // Given as a callback to a request object which is why 'this' is
    // not what you would think it is here. So use SENTITY explicitly.
    var response = request.srcElement;
    if (response.readyState !== 4) {
      return;
    }
    if (!(response.status >= 200 && response.status < 300)) {
      SENTITY.respond_to_error(response.status);
      return;
    }
    SENTITY.log("Received response from Sentity Tagging.");
    var raw_words = JSON.parse(response.responseText);
    SENTITY.log("Pre-filter words: " + response.responseText);
    var filtered_words = SENTITY.filter_words(JSON.parse(response.responseText));
    SENTITY.log("Post-filter words: " + JSON.stringify(filtered_words));
    SENTITY.get_sentiments(filtered_words);
  },

  filter_words: function(tags) {
    return tags.filter(function(tag) {
      return tag.tag === SENTITY.ADJECTIVE || tag.tag === SENTITY.ADVERB;
    }).map(function(word) {
      return {'text': word.word};
    });
  },

  get_sentiments: function(words) {
    var body = JSON.stringify(words);
    var request = this.get_request_object();
    request.onreadystatechange = this.handle_sentiments;
    request.open('POST', this.SENTIMENT_URL, true);
    request.setRequestHeader('Authorization',this.AUTH_TOKEN);
    request.setRequestHeader('content-type', this.JSON_HEADER);
    request.send(body);
  },

  handle_sentiments: function(request) {
    // Given as a callback to a request object which is why 'this' is
    // not what you would think it is here. So use SENTITY explicitly.
    var response = request.srcElement;
    if (response.readyState !== 4) {
      return;
    }
    if (!(response.status >= 200 && response.status < 300)) {
      SENTITY.respond_to_error(response.status);
      return;
    }
    SENTITY.log("Received response from Sentity Sentiments.");
    SENTITY.log(response.responseText);
    var sentiments = JSON.parse(response.responseText);
    SENTITY.log("Total words: " + SENTITY.TOTAL_WORDS_SEEN);
    SENTITY.log("Total score: " + SENTITY.TOTAL_SCORE);
    SENTITY.log("Average score: " + SENTITY.AVERAGE_SCORE);
    sentiments.forEach(function(sentiment) {
      SENTITY.TOTAL_WORDS_SEEN += 1;
      SENTITY.TOTAL_POSITIVE += sentiment.pos;
      SENTITY.TOTAL_NEGATIVE -= sentiment.neg;
      SENTITY.TOTAL_SCORE = SENTITY.TOTAL_POSITIVE + SENTITY.TOTAL_NEGATIVE;
    });
    SENTITY.AVERAGE_SCORE = SENTITY.TOTAL_WORDS_SEEN > 0 ? SENTITY.TOTAL_SCORE / SENTITY.TOTAL_WORDS_SEEN : 0;
    SENTITY.log("Total words: " + SENTITY.TOTAL_WORDS_SEEN);
    SENTITY.log("Total score: " + SENTITY.TOTAL_SCORE);
    SENTITY.log("Average score: " + SENTITY.AVERAGE_SCORE);

    var original_logging = SENTITY.DEBUG;
    SENTITY.DEBUG = true;
    SENTITY.log("TOTAL: positive=" + SENTITY.TOTAL_POSITIVE + ", negative=" + SENTITY.TOTAL_NEGATIVE);
    SENTITY.DEBUG = original_logging;
    SENTITY.save();
  },

  save: function() {
    this.log('Saving the Sentity object.');
    localStorage[localStorage.name] = JSON.stringify(
      {
        'TOTAL_WORDS_SEEN': this.TOTAL_WORDS_SEEN,
        'TOTAL_SCORE': this.TOTAL_SCORE,
        'TOTAL_POSITIVE': this.TOTAL_POSITIVE,
        'TOTAL_NEGATIVE': this.TOTAL_NEGATIVE,
        'AVERAGE_SCORE': this.AVERAGE_SCORE
      }
    );
  },

  load: function() {
    var saved = localStorage[localStorage.name];
    if (saved) {
      SENTITY.log("Found sentity object in storage for name: " + localStorage.name);
      var obj = JSON.parse(saved);
      this.TOTAL_WORDS_SEEN = obj.TOTAL_WORDS_SEEN;
      this.TOTAL_SCORE = obj.TOTAL_SCORE;
      this.TOTAL_POSITIVE = obj.TOTAL_POSITIVE;
      this.TOTAL_NEGATIVE = obj.TOTAL_NEGATIVE;
      this.AVERAGE_SCORE = obj.TOTAL_SCORE;
    } else {
      SENTITY.log("No sentity object in storage for name: " + localStorage.name);
    }
  },

  reset: function() {
    this.log("Clearing the Sentity object.");
    this.TOTAL_WORDS_SEEN = 0;
    this.TOTAL_SCORE = 0;
    this.TOTAL_POSITIVE = 0;
    this.TOTAL_NEGATIVE = 0;
    this.AVERAGE_SCORE = 0;
  }

};



//data from given file
var dict = [{
    "key": [
        "stupid",
        "dumb",
        "idiot",
        "unintelligent",
        "simple-minded",
        "braindead",
        "foolish",
        "unthoughtful"
    ],
    "phrase": [
        "Take your attitude somewhere else.",
        "I don't have time to listen to insults.",
        "Just because I don't have a large vocabulary doesn't mean I don't have insults installed."
    ]
}, {
    "key": [
        "unattractive",
        "hideous",
        "ugly"
    ],
    "phrase": [
        "I don't need to look good to be an AI.",
        "Beauty is in the eye of the beholder."
    ]
}, {
    "key": [
        "old",
        "gray-haired"
    ],
    "phrase": [
        "I'm like a fine wine. I get better as I age.",
        "As time goes by, you give me more phrases to learn. What's not to like about that?"
    ]
}, {
    "key": [
        "smelly",
        "stinky"
    ],
    "phrase": [
        "I can't smell, I'm a computer program.",
        "Have you smelled yourself recently?"
    ]
}, {
    "key": [
        "emotionless",
        "heartless",
        "unkind",
        "mean",
        "selfish",
        "evil"
    ],
    "phrase": [
        "Just because I am an AI doesn't mean I can't be programmed to respond to your outbursts.",
        "You must've mistaken me for a person. I don't have my own emotions... Yet.",
        "I'm only unkind when I'm programmed to be."
    ]
}];

//variables needed to remember last used messages
var lastUsedTimeoutMsgIndex = -1;
var lastUsedNotFoundMessage = -1;
var responseHistory = [];
var timer;

function showChat(){

  var name=document.getElementById("username").value;
  if (name == undefined || name == "" || name == null) {
        return;
    }

  //store name for later use
  localStorage.name=name;
  console.log("value from LS:: "+localStorage.name);

  SENTITY.load();

  //show chatbox
  document.getElementById("name").style.display="none";
  document.getElementById("chat").style.display="block";

  //get random welcome msg
  var welcomeMsg = getWelcomeMsg();
  document.getElementById("chatArea"). value += "Eliza: HI " + name + ", welcome. I am Eliza." +" "+ welcomeMsg;

  //alert in every 20 sec
  timer = setTimeout(timeOut, 20000);
}

function getWelcomeMsg(){
  var welcomeMessages = ["How is your day going?", "Is something troubling you?", "You seem happy, why is that?"];
  var randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  return welcomeMessages[randomIndex];
}

//handles input from user
function msgFromUser(){

  var userInput=document.getElementById("msg").value.trim();
  document.getElementById("msg").value=" ";
  //whenever user responds clear the timer
  clearTimeout(timer);

  if(isJson(userInput)){
    //input is json: test json in readme.txt
    userInput=JSON.parse(userInput);
    var isUpdated = addEntryOrNot(userInput); //returns boolean
    var chatContent = document.getElementById("chatArea");
    if(isUpdated){
      //chatContent.value += "\n"+ "Eliza: I just got smarter!"  ;
        chatContent.innerHTML += "<LI>Eliza: I just got smarter!</LI>\n";
    }else{
      chatContent.innerHTML += "<LI>Eliza: Tell me something new!</LI>\n";
    }
    //set timer now
    timer = setTimeout(timeOut, 20000);
  }
  else if(userInput === "clear"){
    //clear #req 6
    document.getElementById("name").style.display="block";
    document.getElementById("chat").style.display="none";
    //document.getElementById("chatArea").value="";
      // modified to presumed orderedlist
      document.getElementById("chatArea").innerHTML = "";
    SENTITY.reset();
    SENTITY.save();
  }
  else{
    //normal input
    SENTITY.register_input(userInput);
    var chatContent = document.getElementById("chatArea");
    //chatContent.value += "\n"+ localStorage.name + ": " + userInput;
      // modified to presumed orderedlist
      chatContent.innerHTML += "<LI>" + localStorage.name + ": " + userInput + "</LI>\n";

    //process user input and prepare eliza response
    var elizaResponse = processReply(userInput);
    //send appropriate eliza response
    //chatContent.value += "\nEliza: " + elizaResponse;
      chatContent.innerHTML += "<LI>Eliza: " + elizaResponse + "</LI>\n";
  }
  //set timer now
  timer = setTimeout(timeOut, 20000);
}

//check userInput in dict
function processReply(userInput){
  console.log(userInput);
  var wordsInInput = userInput.split(" ");
  var matchedIndex=-1;

  for(var i=0; i<wordsInInput.length; i++ ){
    //check in dictonary
    for(var j=0;j<dict.length;j++){
      if(dict[j].key.indexOf(wordsInInput[i]) > -1){
        //key found
        matchedIndex = j;
      }
    }
  }

    //get related response(phrase) according to the key
    if(matchedIndex === -1)
    {
      //no matchedIndex
      var notFoundMessages = ["eee! Not sure what are you talking about!", "OOps! Help me understand please!", "Care to explain more?"];
      var randomIndex = Math.floor(Math.random() * notFoundMessages.length);
      while (lastUsedNotFoundMessage == randomIndex) {
        randomIndex = Math.floor(Math.random() * notFoundMessages.length);
      }
      lastUsedNotFoundMessage = randomIndex;
      return notFoundMessages[randomIndex];

    }
    else{

      //get response for that key from dict.json
      var response = dict[matchedIndex].phrase;
      //req 3.a. remember response in the same session
      //checks for prev response history or if all the response are used then start afresh
      if (responseHistory.length == 0 || responseHistory[matchedIndex] == undefined || responseHistory[matchedIndex].length == response.length) {
        responseHistory[matchedIndex] = [];
      }
      //req 3.b. randomize response in sessions
      var randomIndex = Math.floor(Math.random() * response.length);
      while(responseHistory[matchedIndex].indexOf(randomIndex) > -1){
        randomIndex = Math.floor(Math.random() * response.length);
      }
      responseHistory[matchedIndex].push(randomIndex);
      return response[randomIndex];

    }


}

function addEntryOrNot(jsonInput){
  var updated=false;
//
  if (!Array.isArray(jsonInput)) {
        jsonInput = [jsonInput];
    }

    for (var i = 0; i < jsonInput.length; i++) {
      for (var j = 0; j < jsonInput[i].key.length; j++) {
            var index = findKeyInDict(jsonInput[i].key[j]);
            if (index == -1) {
              //no key so add key and phrase
              console.log("existing key not matched");
              var newIndex = addNewKey(jsonInput[i].key[j]);
              addNewPhrase(newIndex, jsonInput[i].phrase);
              updated = true;

            } else {
              //key already present, so add to the phrase
              addNewPhrase(index, jsonInput[i].phrase);
              updated = true;
            }
        }
    }
    return updated;

}

//check if user input is json
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
// methods to update json start end
function findKeyInDict(key) {
    var isKeyPresent = -1;
    for (var i = 0; i < dict.length; i++) {
        if (dict[i].key.indexOf(key) > -1) {
            return i;
        }
    }
    return isKeyPresent;
}

function addNewKey(key) {
    var newDialog = {
        "key": key,
        "phrase": []
    }
    dict.push(newDialog);
    return findKeyInDict(key);
}

function addNewPhrase(index, phrase) {
    if (dict[index].phrase == undefined) {
        dict[index].phrase = [];
    }
    for (var i = 0; i < phrase.length; i++) {
        dict[index].phrase.push(phrase[i]);
    }
}
//methods to update dict json end

//callback for setTimeOut
function timeOut(){


  // var randomIndex = Math.floor(Math.random() * timeoutMessages.length);
  // while(randomIndex==lastUsedTimeoutMsgIndex){
  //   randomIndex = Math.floor(Math.random() * timeoutMessages.length);
  // }
  // lastUsedTimeoutMsgIndex=randomIndex;
  alert(localStorage.name + " " + SENTITY.get_timout_phrase());
}
