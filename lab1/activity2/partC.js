var postfixCalculator = function() {
  top = 0

  var calculate = function(number, operation) {
    if (operation === "add") {
      return top + number;
    } else if (operation === "subtract") {
      return top - number;
    } else {
      console.log(operation + " not a supported operation.");
      return top;
    }
  }

  var evaluateExpression = function(expr) {
    stack = []
    while (expr["expr"] !== undefined) {
      stack.push(expr["operation"]);
      expr = expr["expr"];
    }
    stack.push(expr["operation"]);
    value = expr["number"];
    length = stack.length;
    for (var i = 0; i < length; i++) {
      var op = stack.pop();
      top = 
    }
  }
  return function(obj) {
    expression = JSON.parse(obj);
    evaluateExpression(expression)
  }
}
