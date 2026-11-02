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
    defaults: "Shallow: the new array holds the same references, so nested objects are still shared",
  },
  {
    sugar: "const copy = { ...obj }",
    real: "var copy = new Object(); var keys = Object.keys(obj); for (var i = 0; i < keys.length; i = i + 1) { copy[keys[i]] = obj[keys[i]]; }",
    why: "Object spread is a shallow copy built from own enumerable keys.",
    cat: "object",
    defaults: "Shallow: nested objects and arrays are shared — mutating copy.nested mutates obj.nested too",
  },
  {
    sugar: "structuredClone(obj)",
    real: "function deepCopy(value) { if (value === null || typeof value !== \"object\") { return value; } if (Array.isArray(value)) { var copy = []; for (var i = 0; i < value.length; i = i + 1) { copy[copy.length] = deepCopy(value[i]); } return copy; } var copy = new Object(); var keys = Object.keys(value); for (var i = 0; i < keys.length; i = i + 1) { copy[keys[i]] = deepCopy(value[keys[i]]); } return copy; }",
    why: "structuredClone is the built-in recursive deep copy.",
    cat: "object",
    defaults: "Deep: every nested object and array is brand-new, so nothing is shared with the original",
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
    defaults: "let and const throw in the temporal dead zone before their line; var hoists as undefined",
  },
  {
    sugar: "Object.defineProperty(obj, \"age\", { value: 21 })",
    real: 'var ageDescriptor = Object.getOwnPropertyDescriptor(obj, "age");',
    why: "defineProperty lets you set writable, enumerable and configurable explicitly.",
    cat: "object",
    defaults: "Every missing flag defaults to false — including enumerable:false, which hides the property from Object.keys",
  },
  {
    sugar: "Object.create(proto)",
    real: "var child = Object.create(parent);",
    why: "Links directly to a prototype without running a constructor.",
    cat: "prototype",
    defaults: "The new object's [[Prototype]] is exactly proto — no constructor runs, no this binding",
  },
  {
    sugar: '"use strict"',
    real: "'use strict'; var x = 1;",
    why: "Strict mode turns silent mistakes into loud errors.",
    cat: "declaration",
    defaults: "Undeclared assignment throws ReferenceError instead of creating a global; delete throws on non-configurable properties",
  },
  {
    sugar: "arguments",
    real: "var args = arguments;",
    why: "The real argument list inside every function.",
    cat: "function",
    defaults: "Array-like: it has length and indexes, but no map/filter/forEach — use Array.prototype.slice.call",
  },
  {
    sugar: "setTimeout(fn, 0)",
    real: "setTimeout(function () { fn(); }, 0);",
    why: "A timer callback is a task, not an immediate call.",
    cat: "async",
    defaults: "The callback runs after the call stack empties — not at exactly 0ms",
  },
  {
    sugar: "obj.key = value",
    real: "obj.key = value;",
    why: "Normal assignment is sugar for defineProperty with all flags true.",
    cat: "object",
    defaults: "Equivalent to { value, writable: true, enumerable: true, configurable: true }",
  },
  {
    sugar: "a == b",
    real: "if (a === b) {}",
    why: "Strict equality avoids hidden coercion.",
    cat: "operator",
    defaults: "Loose == coerces both sides — \"5\" == 5 is true, [] == ![] is true",
  },
];

export const CHEATSHEET_DEFAULTS = [
  {
    feature: "= with an object",
    default: "same shell (reference copy)",
    bite: "let b = a does not copy the object — b and a point at the same one, so changing one changes the other.",
  },
  {
    feature: "{ ...obj } / [ ...arr ]",
    default: "shallow copy",
    bite: "A new shell is built, but nested objects and arrays are shared — mutating copy.nested still mutates obj.nested.",
  },
  {
    feature: "Object.defineProperty",
    default: "enumerable: false, writable: false, configurable: false",
    bite: "A non-enumerable property vanishes from Object.keys and for-in; a non-writable one silently ignores assignment.",
  },
  {
    feature: "let / const",
    default: "temporal dead zone (TDZ)",
    bite: "Reading before the declaration line throws ReferenceError; var gives undefined instead.",
  },
  {
    feature: "var",
    default: "hoisted as undefined",
    bite: "Reading a var before its assignment gives undefined, not an error, which hides initialization-order bugs.",
  },
  {
    feature: "setTimeout / timers",
    default: "macrotask queue",
    bite: "The callback runs only after the call stack empties, so setTimeout in a for(var) loop shares the final i.",
  },
  {
    feature: "obj[key] = value",
    default: "key becomes a string",
    bite: "Any non-string key is coerced — an object key becomes \"[object Object]\", a number key becomes \"42\".",
  },
  {
    feature: "arguments",
    default: "array-like, not Array",
    bite: "It has length and numeric indexes but no array methods — use Array.prototype.slice.call to convert.",
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
