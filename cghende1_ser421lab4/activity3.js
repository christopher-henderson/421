USER = 1;
ELIZA = 2;

LOW_SCORE_THRESHOLD = 0.1;

FIZZLE = "Sorry, I didn't understand that.";
LEARNED = "I just got smarter!";

BACK_STACK = [];
FORWARD_STACK = [];

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
    if (input !== "") {
      BACK_STACK.push(input);
    }
    var response = process(input);
    paint(response, ELIZA);
  }
  reset_impatience_prompt();
  save();
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
  ];
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
  localStorage.setItem(username, null);
  document.getElementById("input").value = "";
  init();
}

function init() {
  username = prompt("What is your name?");
  build_dictionary();
  var conversation = document.getElementById("conversation");
  var previous_state = deserialize();
  if (previous_state) {
    conversation.children = [];
    for (var i=0; i < previous_state.conversation.length; i++) {
      var li = document.createElement("li");
      li.innerHTML = previous_state.conversation[i];
      conversation.appendChild(li);
    }
    var been_said = new Set();
    for (var i=0; i < previous_state.been_said.length; i++) {
      been_said.add(item);
    }
    select_phrase.been_said = been_said;
    DICTIONARY = previous_state.dictionary;
  } else {
    while (conversation.hasChildNodes()) {
      conversation.removeChild(conversation.lastChild);
    }
    select_phrase.been_said = new Set();
    paint("Hello " + username + ".", ELIZA);
    paint(select_phrase(1), ELIZA);
  }
  reset_impatience_prompt();
}

function save() {
  localStorage.setItem(username, serialize());
}

function serialize() {
  var conversation = [];
  var node = document.getElementById("conversation");
  for (var i=0; i < node.children.length; i++) {
    conversation.push(node.children[i].innerHTML);
  }
  var been_said = [];
  select_phrase.been_said.forEach(function(item) {
    been_said.push(item);
  });
  return JSON.stringify({
    "conversation": conversation,
    "been_said": been_said,
    "dictionary": DICTIONARY
  });
}

function deserialize() {
  var obj = localStorage.getItem(username);
  if (obj === null) {
    return null;
  }
  return JSON.parse(obj);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('input').onkeyup = respond;
  init();
}, true);
