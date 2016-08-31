var postfixCalculator = function() {
  var top = 0;
  var calculate = function(expression) {
    operation = expression["operation"];
    number = expression["number"] || 0;
    if (operation === "add") {
      return top + number;
    } else if (operation === "subtract") {
      return top - number;
    } else {
      console.log(operation + " not a supported operation.");
      return top;
    }
  }
  var evaluateExpression = function(expression) {
    if (expression["expr"] !== undefined) {
      top = evaluateExpression(expression["expr"]);
      return calculate({"number": top, "operation": expression["operation"]});
    }
    return calculate(expression);
  };
  return function(obj) {
    var expression = JSON.parse(obj);
    top = evaluateExpression(expression);
    return top;
  }
}()

expressions = [
  '{"number" : 5, "operation" : "add"}', // returns 5 (assumes a starting init value of 0)
  '{"number" : 2, "operation" :  "subtract"}', // returns 3 (5-2)
  '{"number" : 19, "operation" : "add"}', // returns 22 (19+3)
  '{"expr": {"number" : 15, "operation" : "subtract"}, "operation" : "add"}', // returns 14 (22-15 = 7, then 7+7=14)
  // '{"expr": {"expr": {"number" : 3, "operation" :  "add"}, "operation" : "add"}, "operation" : "subtract"}' // returns 0 (14+3=17, 17+17=34, 34-34=0)
]

for (var i = 0; i < expressions.length; i+=1) {
  console.log(postfixCalculator(expressions[i]));
}
