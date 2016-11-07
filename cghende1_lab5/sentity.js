SENTITY = {

  TAG_URL: 'https://api.sentity.io/v1/tag',
  SENTIMENT_URL: 'https://api.sentity.io/v1/sentiment',
  // Super secret. Do not steal.
  AUTH_TOKEN: 'token 67109a7ab8b2557f122d6c0bad679b481df77eb7',
  JSON_HEADER: 'application/json',
  POST: 'POST',
  GET: 'GET',
  TOTAL_WORDS_SEEN: 0,
  TOTAL_SCORE: 0,
  AVERAGE_SCORE: 0,
  NEUTRAL: 0,

  get_request_object: function() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else {
      return(null);
    }
  },

  handle: function(request, callback) {
    var response = request.srcElement;
    if (response.readyState !== 4) {
      return;
    }
    if (!(response.status >= 200 && response.status < 300)) {
      alert('WHOOPS! Something went wrong getting the tags. Response code:' + response.code);
    }
    callback(response);
  },

  get_tags: function(text) {
    var request = this.get_request_object();
    var url = this.TAG_URL + "?text=" + text;
    request.onreadystatechange = function(request) {
      var response = request.srcElement;
      if (response.readyState !== 4) {
        return;
      }
      if (!(response.status >= 200 && response.status < 300)) {
        alert('WHOOPS! Something went wrong getting the tags. Response code:' + response.code);
      }
      callback(response);
    };
    request.open(this.GET, url, true);
    request.setRequestHeader('Authorization', this.AUTH_TOKEN);
    request.send(null);
  },

  filter_words: function(tags) {
    var words = tags.filter(function(tag) {
      return tag.tag === 'JJ' || tag.tag === 'RB';
    }).map(function(word) {
      return {'text': word.word};
    });
    get_sentiments(words);
  },

  get_sentiments: function(words) {
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
    request.setRequestHeader('Authorization', this.AUTH_TOKEN);
    requenst.setRequestHeader('content-type', JSON_HEADER);
    requenst.send(body);
  },

};
