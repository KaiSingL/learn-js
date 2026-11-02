// Every row is a shortcut and the code the engine actually runs.
// `real` is linted by the test suite, so it must obey the course rules.
export const CHEATSHEET = [
  {
    sugar: "const a = () => {}",
    real: "var a = function () {};",
    why: "Arrow functions capture this lexically and have no prototype.",
    cat: "function",
  },
  {
    sugar: "let s = `${name} is ${age}`",
    real: 'var s = name + " is " + age;',
    why: "A template is string concatenation with hidden coercion.",
    cat: "string",
  },
  {
    sugar: "function f(a = 5)",
    real: "function f(a) { if (a === undefined) { a = 5; } }",
    why: "A default is an explicit undefined check at the top.",
    cat: "function",
  },
  {
    sugar: "const { x, y } = obj",
    real: "var x = obj.x; var y = obj.y;",
    why: "Destructuring is property access with new names.",
    cat: "object",
  },
  {
    sugar: "const [a, b] = arr",
    real: "var a = arr[0]; var b = arr[1];",
    why: "Array destructuring is index access.",
    cat: "array",
  },
  {
    sugar: "let { x: renamed } = obj",
    real: "var renamed = obj.x;",
    why: "A renamed binding is just an alias for the property.",
    cat: "object",
  },
  {
    sugar: "const { ...rest } = obj",
    real: 'var rest = {}; var keys = Object.keys(obj); for (var i = 0; i < keys.length; i = i + 1) { var k = keys[i]; if (k !== "x") { rest[k] = obj[k]; } }',
    why: "Object rest walks enumerable keys and copies them.",
    cat: "object",
  },
  {
    sugar: "const copy = [...arr]",
    real: "var copy = []; for (var i = 0; i < arr.length; i = i + 1) { copy[copy.length] = arr[i]; }",
    why: "Spread is a hidden loop copying each index.",
    cat: "array",
  },
  {
    sugar: "obj = { x }",
    real: "var obj = { x: x };",
    why: "The shorthand hides the key and the value.",
    cat: "object",
  },
  {
    sugar: "obj = { say() {} }",
    real: "var obj = { say: function () {} };",
    why: "A method shorthand is a function property.",
    cat: "object",
  },
  {
    sugar: "class Dog {}",
    real: "function Dog(name) { this.name = name; } Dog.prototype.bark = function () { return \"woof\"; };",
    why: "A class is a constructor plus prototype assignments.",
    cat: "prototype",
  },
  {
    sugar: "class A extends B",
    real: "function A() { B.call(this); } A.prototype = Object.create(B.prototype); A.prototype.constructor = A;",
    why: "Inheritance is a prototype link plus a parent call.",
    cat: "prototype",
  },
  {
    sugar: "a++ / a--",
    real: "a = a + 1; a = a - 1;",
    why: "Increment hides an assignment and its evaluation order.",
    cat: "operator",
  },
  {
    sugar: "a += b / a -= b",
    real: "a = a + b; a = a - b;",
    why: "Compound assignment is a read, an operation and a write.",
    cat: "operator",
  },
  {
    sugar: "a ** b",
    real: "Math.pow(a, b)",
    why: "The operator is a Math.pow call with coercion.",
    cat: "operator",
  },
  {
    sugar: "for (let x of arr)",
    real: "for (var i = 0; i < arr.length; i = i + 1) { var x = arr[i]; }",
    why: "for...of is an index loop with the iterator protocol on top.",
    cat: "loop",
  },
  {
    sugar: "for (let k in obj)",
    real: "var keys = Object.keys(obj); for (var i = 0; i < keys.length; i = i + 1) { var k = keys[i]; }",
    why: "for...in also visits inherited enumerable keys.",
    cat: "loop",
  },
  {
    sugar: "arr.map((x) => x * 2)",
    real: "var out = []; for (var i = 0; i < arr.length; i = i + 1) { out[out.length] = arr[i] * 2; }",
    why: "map is a loop plus a new array.",
    cat: "array",
  },
  {
    sugar: "arr.filter((x) => x > 2)",
    real: "var out = []; for (var i = 0; i < arr.length; i = i + 1) { if (arr[i] > 2) { out[out.length] = arr[i]; } }",
    why: "filter is a loop with a conditional push.",
    cat: "array",
  },
  {
    sugar: "arr.find((x) => x > 2)",
    real: "function find(arr, test) { for (var i = 0; i < arr.length; i = i + 1) { if (test(arr[i])) { return arr[i]; } } return undefined; }",
    why: "find is a loop with an early return.",
    cat: "array",
  },
  {
    sugar: "arr.reduce((acc, x) => acc + x, 0)",
    real: "var total = 0; for (var i = 0; i < arr.length; i = i + 1) { total = total + arr[i]; }",
    why: "reduce is a loop carrying an accumulator.",
    cat: "array",
  },
  {
    sugar: "obj?.prop",
    real: "var out; if (obj !== null && obj !== undefined) { out = obj.prop; }",
    why: "Optional chaining hides an explicit two-part null check.",
    cat: "safe",
  },
  {
    sugar: "obj?.()",
    real: "var out; if (typeof obj === \"function\") { out = obj(); }",
    why: "Optional call is a typeof check before invoking.",
    cat: "safe",
  },
  {
    sugar: "a ?? b",
    real: "var out; if (a !== null && a !== undefined) { out = a; } else { out = b; }",
    why: "Nullish coalescing only falls back for null and undefined.",
    cat: "safe",
  },
  {
    sugar: "a ||= b / a &&= b",
    real: "if (!a) { a = b; } if (a) { a = b; }",
    why: "Logical assignment is a conditional write.",
    cat: "operator",
  },
  {
    sugar: "async function f() { await x; }",
    real: "function f() { return new Promise(function (resolve) { resolve(x); }).then(function (value) { return value; }); }",
    why: "Async is a promise; await is a then callback.",
    cat: "async",
  },
  {
    sugar: "import { x } from 'y' / export",
    real: "var api = (function () { var privateState = 1; return { get: function () { return privateState; } }; })();",
    why: "A module is an IIFE that returns its public surface.",
    cat: "module",
  },
  {
    sugar: "`multiline\\nstring`",
    real: 'var s = "multiline\\nstring";',
    why: "A template is a string; the newline is still a newline.",
    cat: "string",
  },
  {
    sugar: "let / const",
    real: "var count = 0;",
    why: "Only var shows function scoping and hoisting as the engine does it.",
    cat: "declaration",
  },
];

export const CHEATSHEET_CATEGORIES = [
  "all",
  "declaration",
  "function",
  "string",
  "object",
  "array",
  "prototype",
  "operator",
  "loop",
  "safe",
  "async",
  "module",
];

export function filterCheatsheet(query, category) {
  const needle = String(query || "").toLowerCase().trim();
  return CHEATSHEET.filter((row) => {
    if (category && category !== "all" && row.cat !== category) return false;
    if (!needle) return true;
    return (
      row.sugar.toLowerCase().indexOf(needle) !== -1 ||
      row.real.toLowerCase().indexOf(needle) !== -1 ||
      row.why.toLowerCase().indexOf(needle) !== -1 ||
      row.cat.indexOf(needle) !== -1
    );
  });
}
