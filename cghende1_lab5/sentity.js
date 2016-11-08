SENTITY = {

  DEBUG: true,

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
    console.log(avg_positive);
    console.log(avg_negative);
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
    if (SENTITY.DEBUG) {
      console.log(obj);
    }
  },

  get_request_object: function() {
    if (window.XMLHttpRequest) {
      SENTITY.log("Creating AJAX object.");
      return new XMLHttpRequest();
    } else {
      SENTITY.log("AJAX not supported.");
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
    var request = SENTITY.get_request_object();
    var url = SENTITY.TAG_URL + "?text=" + text;
    SENTITY.log("Sending: " + url);
    request.onreadystatechange = SENTITY.handle_tags;
    request.open(SENTITY.GET, url, true);
    request.setRequestHeader('Authorization', SENTITY.AUTH_TOKEN);
    request.send(null);
    SENTITY.log("Sent: " + url);
  },

  handle_tags: function(request) {
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
    var request = SENTITY.get_request_object();
    request.onreadystatechange = SENTITY.handle_sentiments;
    request.open('POST', SENTITY.SENTIMENT_URL, true);
    request.setRequestHeader('Authorization', SENTITY.AUTH_TOKEN);
    request.setRequestHeader('content-type', SENTITY.JSON_HEADER);
    request.send(body);
  },

  handle_sentiments: function(request) {
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
      SENTITY.log("Found sentity object in memory for name: " + localStorage.name);
      var obj = JSON.parse(saved);
      this.TOTAL_WORDS_SEEN = obj.TOTAL_WORDS_SEEN;
      this.TOTAL_SCORE = obj.TOTAL_SCORE;
      this.TOTAL_POSITIVE = obj.TOTAL_POSITIVE;
      this.TOTAL_NEGATIVE = obj.TOTAL_NEGATIVE;
      this.AVERAGE_SCORE = obj.TOTAL_SCORE;
    } else {
      SENTITY.log("No sentity object in memory for name: " + localStorage.name);
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
