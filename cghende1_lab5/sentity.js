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
      alert('WHOOPS! Something went wrong getting the tags. Response code:' + response.status);
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
      alert('WHOOPS! Something went wrong getting the sentiments. Response code:' + response.status);
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
  }

};
