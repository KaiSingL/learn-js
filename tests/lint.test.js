import { describe, expect, test } from "bun:test";
import { lintSource, summarize } from "../src/lib/lint.js";

function ids(source) {
  return lintSource(source).map(function (item) {
    return item.ruleId;
  });
}

function has(source, ruleId) {
  return ids(source).indexOf(ruleId) !== -1;
}

describe("lintSource: forbidden syntax", function () {
  test("detects arrow functions", function () {
    expect(has("var a = (x) => x + 1;", "arrow")).toBe(true);
  });

  test("detects template literals", function () {
    expect(has("var s = `hello`;", "template")).toBe(true);
  });

  test("detects class syntax", function () {
    expect(has("class Dog {}", "class")).toBe(true);
    expect(has("var A = class {};", "class")).toBe(true);
    expect(has("class A extends B {}", "class")).toBe(true);
  });

  test("detects let and const", function () {
    expect(has("let x = 1;", "declaration")).toBe(true);
    expect(has("const y = 2;", "declaration")).toBe(true);
  });

  test("detects object and array destructuring", function () {
    expect(has("var { a } = obj;", "destructure")).toBe(true);
    expect(has("var [a] = arr;", "destructure")).toBe(true);
    expect(has("function f({ a }) {}", "destructure")).toBe(true);
  });

  test("detects spread and rest", function () {
    expect(has("var copy = [...arr];", "spread")).toBe(true);
    expect(has("function f(...args) {}", "spread")).toBe(true);
  });

  test("detects default parameters", function () {
    expect(has("function f(a = 5) {}", "default-param")).toBe(true);
    expect(has("var f = function (a = 5) {};", "default-param")).toBe(true);
  });

  test("detects shorthand properties and methods", function () {
    expect(has("var obj = { a, b: 2 };", "shorthand-prop")).toBe(true);
    expect(has("var obj = { say() {} };", "shorthand-method")).toBe(true);
  });

  test("does not flag ordinary object literals", function () {
    expect(has("var obj = { a: 1, say: function () {} };", "shorthand-prop")).toBe(false);
    expect(has("var obj = { a: 1, say: function () {} };", "shorthand-method")).toBe(false);
  });

  test("detects increment and compound assignment", function () {
    expect(has("i++;", "increment")).toBe(true);
    expect(has("i--;", "increment")).toBe(true);
    expect(has("a += 1;", "compound")).toBe(true);
    expect(has("a ??= 1;", "compound")).toBe(true);
  });

  test("detects optional chaining and nullish coalescing", function () {
    expect(has("obj?.a;", "optional")).toBe(true);
    expect(has("fn?.();", "optional")).toBe(true);
    expect(has("var x = a ?? b;", "nullish")).toBe(true);
  });

  test("detects for...of and for...in", function () {
    expect(has("for (var x of arr) {}", "for-of-in")).toBe(true);
    expect(has("for (var k in obj) {}", "for-of-in")).toBe(true);
  });

  test("does not flag a normal for loop", function () {
    expect(has("for (var i = 0; i < 3; i = i + 1) {}", "for-of-in")).toBe(false);
  });

  test("detects async, await, import and export", function () {
    expect(has("async function f() {}", "async")).toBe(true);
    expect(has("function f() { await x; }", "async")).toBe(true);
    expect(has('import x from "y";', "modules")).toBe(true);
    expect(has("export var x = 1;", "modules")).toBe(true);
  });

  test("detects black-box array methods as advice", function () {
    const violations = lintSource("var out = arr.map(fn);");
    expect(violations.length).toBe(1);
    expect(violations[0].ruleId).toBe("blackbox");
    expect(violations[0].severity).toBe("advice");
  });

  test("detects the exponent operator", function () {
    expect(has("var x = a ** b;", "exponent")).toBe(true);
  });
});

describe("lintSource: ignores non-code", function () {
  test("ignores strings and comments", function () {
    expect(ids('var s = "a => b class let"; // a => b')).toEqual([]);
    expect(ids("/* class let const => */ var x = 1;")).toEqual([]);
  });

  test("ignores regular expression literals", function () {
    expect(ids("var r = /a=>b/;")).toEqual([]);
    expect(ids("var r = /[a-z]+/g; var x = 1;")).toEqual([]);
  });

  test("does not treat division as a regex", function () {
    expect(ids("var x = a / b; var y = c / d;")).toEqual([]);
  });

  test("does not flag === as an assignment", function () {
    expect(ids("if (a === b) { c = 1; }")).toEqual([]);
  });
});

describe("lintSource: positions", function () {
  test("reports the line and column of the violation", function () {
    const source = "var a = 1;\nvar b = () => 2;";
    const violations = lintSource(source);
    expect(violations.length).toBe(1);
    expect(violations[0].ruleId).toBe("arrow");
    expect(violations[0].line).toBe(2);
    expect(violations[0].col).toBe(12);
  });

  test("reports multiple violations in source order", function () {
    const violations = lintSource("let a = 1;\nvar b = () => 2;");
    expect(violations.length).toBe(2);
    expect(violations[0].ruleId).toBe("declaration");
    expect(violations[1].ruleId).toBe("arrow");
    expect(violations[0].index).toBeLessThan(violations[1].index);
  });
});

describe("lintSource: clean real code", function () {
  test("a full prototype sample passes", function () {
    const source = `function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function () {
  return "Woof " + this.name;
};
var rex = new Dog("Rex");
for (var i = 0; i < 3; i = i + 1) {
  console.log(rex.bark());
}
var copy = [];
for (var j = 0; j < rex.tricks.length; j = j + 1) {
  copy[copy.length] = rex.tricks[j];
}`;
    expect(lintSource(source)).toEqual([]);
  });
});

describe("summarize", function () {
  test("counts errors and advice separately", function () {
    const violations = lintSource("var a = () => arr.map(fn);");
    const totals = summarize(violations);
    expect(totals.errors).toBe(1);
    expect(totals.advice).toBe(1);
    expect(totals.total).toBe(2);
  });
});
