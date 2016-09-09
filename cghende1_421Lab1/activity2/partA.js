var postfixCalculator = function() {
  var top = 0;
  return function(obj) {
    var expression = JSON.parse(obj);
    operation = expression["operation"];
    number = expression["number"] || 0;
    if (operation === "add") {
      top += number;
    } else if (operation === "subtract") {
      top -= number;
    } else {
      console.log(operation + " not a supported operation.");
    }
    return top
  }
}()

// expressions = [
//   '{"number" : 5, "operation" : "add"}', // returns 5 (assumes a starting init value of 0)
//   '{"number" : 2, "operation" :  "subtract"}', // returns 3 (5-2)
//   '{"number" : 19, "operation" : "add"}' // returns 22 (19+3)
// ]
//
// for (var i = 0; i < expressions.length; i+=1) {
//   console.log(postfixCalculator(expressions[i]));
// }
