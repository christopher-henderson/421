shouldBeFive = postfixCalculator('{"number" : 5, "operation" : "add"}')
console.log(shouldBeFive);

calc = new PostfixCalculator();
shouldBeFive = calc.evaluate('{"number" : 5, "operation" : "add"}')
console.log(shouldBeFive);
