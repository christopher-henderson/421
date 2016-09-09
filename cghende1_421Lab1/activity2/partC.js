class PostfixCalculator {

  constructor() {
    this.stack = [0];
  }

  evaluate(obj) {
    return Factory(JSON.parse(obj), this.stack).evaluate();
  }
}

function Factory(obj, stack) {
  if (obj["expr"] !== undefined) {
    return new Expression(obj, stack);
  }
  return new Statement(obj, stack);
}

class Expression {
  constructor(obj, stack) {
    this.stack = stack;
    this.expression = Factory(obj["expr"], stack);
    this.operation = obj["operation"];
  }
}

Expression.prototype.evaluate = function () {
  number = this.expression.evaluate();
  return Factory({
    "number": number,
    "operation": this.operation},
    this.stack).evaluate();
};

class Statement {
  constructor(obj, stack) {
    this.stack = stack;
    this.number = obj["number"];
    this.operation = obj["operation"];
  }
}

Statement.prototype.evaluate = function () {
  if (this.operation === "add") {
    return this.stack[this.stack.length - 1] + this.number;
  } else if (this.operation === "subtract") {
    return this.stack[this.stack.length - 1] - this.number;
  } else if (this.operation === "push") {
    this.stack.push(this.number);
    return this.number;
  } else if (this.operation === "pop") {
    top = this.stack.pop();
    if (this.stack.length === 0) {
      this.stack[0] = 0;
    }
    return top;
  } else if (this.operation === "print") {
    print(this.stack)
    return this.stack[this.stack.length - 1]
  }
  return;
};

function print(stack) {
  numbers = "";
  for (var i = stack.length - 1; i >= 0; i--) {
    numbers += (i === stack.length - 1 ? "" : " ") + stack[i];
  }
  console.log(numbers)
}

// a = '{"number" : 5, "operation" : "add"}'
// b = '{"expr": {"number" : 2, "operation" : "subtract"}, "operation" : "push"}'
// c = '{"expr": {"number" : 19, "operation" :  "add"}, "operation" :  "push"}'
// d = '{"operation" :  "pop"}'
// e = '{"operation" :  "print"}'
// f = '{"expr": {"expr": {"operation" :  "pop"}, "operation" :  "add"}, "operation" : "push"}'
// calc = new PostfixCalculator();
// console.log(calc.evaluate(a))
// console.log(calc.evaluate(b))
// console.log(calc.stack)
// console.log(calc.evaluate(c))
// console.log(calc.stack)
// console.log(calc.evaluate(d))
// console.log(calc.stack)
// calc.evaluate(e)
// console.log(calc.evaluate(f))
// console.log(calc.stack)
