Parts A and B are closures so you immediately have a callable calculator that you
can use as follows:

shouldBeFive = postfixCalculator('{"number" : 5, "operation" : "add"}')
console.log(shouldBeFive);

However, Part C is a class that you need to new up and call its 'evaluate'
method on.

calc = new PostfixCalculator();
shouldBeFive = calc.evaluate('{"number" : 5, "operation" : "add"}')
console.log(shouldBeFive);
