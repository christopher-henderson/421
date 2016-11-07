USER = 1;
ELIZA = 2;

LOW_SCORE_THRESHOLD = 0.1;

FIZZLE = "Sorry, I didn't understand that.";
LEARNED = "I just got smarter!";

TAG_URL = 'https://api.sentity.io/v1/tag';
SENTIMENT_URL = 'https://api.sentity.io/v1/sentiment';
// Super secret. Do not steal.
AUTH_TOKEN = 'token 67109a7ab8b2557f122d6c0bad679b481df77eb7';
JSON_HEADER = 'application/json';
TOTAL_WORDS_SEEN = 0;
TOTAL_SCORE = 0;
AVERAGE_SCORE = 0;
NEUTRAL = 0;

BACK_STACK = [];
FORWARD_STACK = [];

// function preflight() {
//   var request = getRequestObject();
//   request.open('OPTIONS');
  // request.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type, Last-Modified, If-Modified-Since, Content-Length, Accept-Encoding, Authorization, X-Requested-With, X-Ratelimit-Limit, X-Ratelimit-Remaining');
  // request.setRequestHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
//   request.setRequestHeader('Access-Control-Expose-Headers', 'Content-Type, Last-Modified, If-Modified-Since, Content-Length, Accept-Encoding, Authorization, X-Requested-With, X-Ratelimit-Limit, X-Ratelimit-Remaining');
//   request.setRequestHeader('Access-Control-Max-Age', '86400');
// }

function getRequestObject() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return(null);
  }
}


function set_headers(request) {
  // request.setRequestHeader('Origin', 'localhost');
  // request.setRequestHeader('Access-Control-Allow-Origin', '*');
  request.setRequestHeader('Authorization', AUTH_TOKEN);
  // request.setRequestHeader('Access-Control-Allow-Headers', 'Content-Type, Last-Modified, If-Modified-Since, Content-Length, Accept-Encoding, Authorization, X-Requested-With, X-Ratelimit-Limit, X-Ratelimit-Remaining');
  // request.setRequestHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  return request;
}

function score_sentiments(text) {
  get_tags(text, process_sentiments);
}

function get_tags(text, callback) {
  var request = getRequestObject();
  var url = TAG_URL + "?text=" + text;
  request.onreadystatechange = function(response) {
    if (response.state !== 4) {
      return;
    }
    if (!(response.code >= 200 && response.code < 300)) {
      alert('WHOOPS! Something went wrong getting the tags. Response code:' + response.code);
    }
    console.log(resonse.text);
    // callback(JSON.parse(response.text));
    // process_sentiments(JSON.parse(response.text));
  };
  request.open('GET', url, true);
  set_headers(request);
  request.send(null);
}

function process_sentiments(tags) {
  var words = tags.filter(function(tag) {
    return tag.tag === 'JJ' || tag.tag === 'RB';
  }).map(function(word) {
    return {'text': word.word};
  });
  var body = JSON.stringify(words);
  var request = getRequestObject();
  request.onreadystatechange(function(response) {
    if (response.state !== 4) {
      return;
    }
    if (!(response.code >= 200 && response.code < 300)) {
      alert('WHOOPS! Something went wrong getting the sentiment. Response code:' + response.code);
    }
    var sentiments = JSON.parse(resonse.text);
    sentiments.forEach(function(sentiment) {
      TOTAL_WORDS_SEEN += 1;
      TOTAL_SCORE += sentiment.pos;
      TOTAL_SCORE -= sentiment.neg;
    });
    AVERAGE_SCORE = TOTAL_WORDS_SEEN > 0 ? TOTAL_SCORE / TOTAL_WORDS_SEEN : 0;
  });
  request.open('POST', SENTIMENT_URL, true);
  set_headers(request);
  requenst.setRequestHeader('content-type', JSON_HEADER);
  requenst.send(body);
}

function respond(event) {
  switch (event.keyCode) {
    case 38:
      back();
      break;
    case 40:
      forward();
      break;
    case 13:
      play_the_game(event);
      break;
    default:
      return;
  }
}

function back() {
  if (BACK_STACK.length <= 0) {
    return;
  }
  var previous = BACK_STACK.pop();
  var input = document.getElementById("input");
  FORWARD_STACK.push(input.value);
  input.value = previous;
}

function forward() {
  if (FORWARD_STACK.length <= 0) {
    return;
  }
  var previous = FORWARD_STACK.pop();
  var input = document.getElementById("input");
  BACK_STACK.push(input.value);
  input.value = previous;
}

function play_the_game(event) {
  var input = event.srcElement.value;
  paint(input, USER);
  if (input === "clear") {
    clear();
    return;
  }
  try {
    learn(input);
    alert(LEARNED);
  } catch (e) {
    score_sentiments(input);
    if (input !== "") {
      BACK_STACK.push(input);
    }
    var response = process(input);
    paint(response, ELIZA);
  }
  reset_impatience_prompt();
  event.srcElement.value = "";
}

function process(input) {
  var tokens = tokenize(input.toLowerCase());
  var winner = select_winner(tokens, input.length);
  var phrase = select_phrase(winner);
  return phrase;
}

function tokenize(input) {
  tokens = [];
  for (var i=0; i < input.length; i++) {
    for (var j=i+2; j < input.length + 1; j++) {
      tokens.push(input.slice(i, j));
    }
  }
  return tokens;
}

function similarity(token, key) {
  var score = 0;
  for (var i=0; i < token.length; i++) {
    score += token[i] === key[i] ? 1 : 0;
    score += token[i] === key[i+1] ? 0.5 : 0;
    score += token[i] === key[i-1] ? 0.5 : 0;
    score += token[i] === key[i+2] ? 0.25 : 0;
    score += token[i] === key[i-2] ? 0.25 : 0;
  }
  return score;
}

function select_winner(tokens, input_length) {
  var high_score = LOW_SCORE_THRESHOLD;
  var winner = -1;
  for (var i=0; i < DICTIONARY.length; i++) {
    var keys = DICTIONARY[i].key;
    var key_score = 0;
    var key_length = 0;
    for (var key=0; key < keys.length; key++) {
      key_length += keys[key].length;
      for (var token=0; token < tokens.length; token++) {
        var token_score = similarity(tokens[token], keys[key]);
        token_score *= token_score >= 1 ? keys[key].length : 1;
        token_score *= tokens[token].length / input_length;
        key_score += token_score;
      }
    }
    key_score /= key_length;
    console.log(key_score + ": " + keys);
    if (key_score >= high_score) {
      high_score = key_score;
      winner = i;
    }
  }
  return winner;
}

var select_phrase = function() {
  var been_said = new Set();
  return function(winner) {
    if (winner < 0) {
      return FIZZLE;
    }
    var phrases = DICTIONARY[winner].phrase;
    shuffle(phrases);
    for (var i=0; i < phrases.length; i++) {
      var phrase = phrases[i];
      if (been_said.has(phrase)) {
        continue;
      }
      been_said.add(phrase);
      return phrase;
    }
    for (var i=0; i < phrases.length; i++) {
      been_said.delete(phrases[i]);
    }
    return select_phrase(winner);
  };
}();

function learn(input) {
  var obj = JSON.parse(input);
  if (obj.constructor === Array) {
    addArray(obj);
  } else {
    addObject(obj);
  }
}

function addArray(array) {
  for (var i=0; i < array.length; i++) {
    addObject(array[i]);
  }
}

function addObject(obj) {
  if (obj.constructor !== Object) {
    throw "Not an object.";
  }
  if (obj.key === undefined || obj.phrase === undefined) {
    throw "Key or Phrase is undefined.";
  }
  if (obj.key.constructor !== Array || obj.phrase.constructor !== Array) {
    throw "Key or Phrase are not arrays.";
  }
  if (obj.key.length === 0 || obj.phrase.length === 0) {
    alert("Eliza cannot learn from empty key sets or phrases!");
    throw "Empty keys or phrases";
  }
  obj.key = obj.key.map(function(key) {
    return key.constructor !== String ? JSON.stringify(key).toLowerCase() : key.toLowerCase();
  });
  obj.phrase = obj.phrase.map(function(phrase) {
    return phrase.constructor !== String ? JSON.stringify(phrase).toLowerCase() : phrase.toLowerCase();
  });
  DICTIONARY.push(obj);
}

function applyTimeStamp(string) {
  return Date().toString() + ": " + string;
}

function getName(actor) {
  switch (actor) {
    case ELIZA:
      return "Eliza";
    case USER:
      return username;
    default:
      return "Anonymous";
  }
}

function paint(text, actor) {
  formatted_text = getName(actor) + ": " + applyTimeStamp(text);
  element = document.createElement("li");
  element.innerHTML = formatted_text;
  var conversation = document.getElementById("conversation");
  conversation.appendChild(element);
}

function build_dictionary() {
    DICTIONARY = [
    {
      "key": [
        "bored",
        "waiting",
        "taking forever"
      ],
      "phrase": [
        username + ", I'm waiting here!",
        "Whatsa matter, " + username + ". Cat got your tongue?"
      ]
    },
    {
      "key": [
        "hello",
        "hi",
        "how are you"
      ],
      "phrase": [
        "How is your day going, " + username + "?",
        "Is something troubling you, " + username + "?",
        "You seem happy, " + username + ", why is that?"
      ]
    },
    {
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
    },
    {
      "key": [
        "unattractive",
        "hideous",
        "ugly"
      ],
      "phrase": [
        "I don't need to look good to be an AI.",
        "Beauty is in the eye of the beholder."
      ]
    },
    {
      "key": [
        "old",
        "gray-haired"
      ],
      "phrase": [
        "I'm like a fine wine. I get better as I age.",
        "As time goes by, you give me more phrases to learn. What's not to like about that?"
      ]
    },
    {
      "key": [
        "smelly",
        "stinky"
      ],
      "phrase": [
        "I can't smell, I'm a computer program.",
        "Have you smelled yourself recently?"
      ]
    },
    {
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
    }
  ]
}

function shuffle(array) {
  for (var shuffles=0; shuffles < array.length * 10; shuffles++) {
    var i = Math.floor(Math.random() * array.length);
    var j = Math.floor(Math.random() * array.length);
    var tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

var reset_impatience_prompt = function() {
  var currentID;
  return function() {
    if (currentID !== undefined) {
        window.clearTimeout(currentID);
    }
    currentID = window.setTimeout(function() {
      paint(select_phrase(0), ELIZA),
      reset_impatience_prompt();
    }, 20 * 1000);
  };
}();

function clear() {
  username = prompt("What is your name?");
  build_dictionary();
  var conversation = document.getElementById("conversation");
  while (conversation.hasChildNodes()) {
    conversation.removeChild(conversation.lastChild);
  }
  select_phrase.been_said = new Set();
  paint("Hello " + username + ".", ELIZA);
  paint(select_phrase(1), ELIZA);
  reset_impatience_prompt();
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('input').onkeyup = respond;
  clear();
}, true);
