function tokenize(input) {
  tokens = [];
  for (var i=0; i < input.length; i++) {
    for (var j=i+2; j < input.length; i++) {
      tokens.push(input.slice(i, j));
    }
  }
  return tokens;
}
