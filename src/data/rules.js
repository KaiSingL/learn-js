// Every rule the linter can report. `real` is the replacement the course
// wants you to write instead, and `why` is the one-line reason.
export const RULES = {
  arrow: {
    id: "arrow",
    label: "Arrow function",
    real: "var add = function (a, b) { return a + b; };",
    why: "Arrows capture this lexically and have no prototype.",
    category: "function",
    severity: "error",
  },
  template: {
    id: "template",
    label: "Template literal",
    real: 'var s = name + " is " + age;',
    why: "A template is string concatenation plus hidden coercion.",
    category: "string",
    severity: "error",
  },
  class: {
    id: "class",
    label: "class / extends / super",
    real: "function Dog() {} Dog.prototype.bark = function () {};",
    why: "A class is a constructor function plus prototype assignments.",
    category: "prototype",
    severity: "error",
  },
  declaration: {
    id: "declaration",
    label: "let / const",
    real: "var count = 0;",
    why: "Only var shows the function scoping and hoisting the engine uses.",
    category: "declaration",
    severity: "error",
  },
  destructure: {
    id: "destructure",
    label: "Destructuring",
    real: "var x = obj.x; var y = obj.y;",
    why: "Destructuring is property (or index) access in disguise.",
    category: "object",
    severity: "error",
  },
  spread: {
    id: "spread",
    label: "Spread / rest ...",
    real: "var copy = []; for (var i = 0; i < a.length; i = i + 1) copy[copy.length] = a[i];",
    why: "Spread is a hidden loop copying values.",
    category: "array",
    severity: "error",
  },
  "default-param": {
    id: "default-param",
    label: "Default parameter",
    real: 'function f(a) { if (a === undefined) { a = 5; } }',
    why: "A default is an explicit undefined check at the top of the body.",
    category: "function",
    severity: "error",
  },
  "shorthand-prop": {
    id: "shorthand-prop",
    label: "Shorthand property",
    real: "var obj = { x: x };",
    why: "The shorthand hides the key/value pair.",
    category: "object",
    severity: "error",
  },
  "shorthand-method": {
    id: "shorthand-method",
    label: "Shorthand method",
    real: "var obj = { say: function () {} };",
    why: "A method shorthand is just a function property.",
    category: "object",
    severity: "error",
  },
  increment: {
    id: "increment",
    label: "++ / --",
    real: "i = i + 1;",
    why: "Increment hides an assignment and its evaluation order.",
    category: "operator",
    severity: "error",
  },
  compound: {
    id: "compound",
    label: "Compound assignment",
    real: "a = a + b;",
    why: "Compound assignment hides a read, an operation and a write.",
    category: "operator",
    severity: "error",
  },
  optional: {
    id: "optional",
    label: "Optional chaining ?.",
    real: "if (obj !== null && obj !== undefined) { obj.prop; }",
    why: "Optional chaining hides an explicit null check.",
    category: "safe",
    severity: "error",
  },
  nullish: {
    id: "nullish",
    label: "Nullish coalescing ??",
    real: "var out = a !== null && a !== undefined ? a : b;",
    why: "Nullish coalescing hides a two-part null check.",
    category: "safe",
    severity: "error",
  },
  "for-of-in": {
    id: "for-of-in",
    label: "for...of / for...in",
    real: "for (var i = 0; i < arr.length; i = i + 1) { var x = arr[i]; }",
    why: "Both hide the index loop (and for...in also visits inherited keys).",
    category: "loop",
    severity: "error",
  },
  async: {
    id: "async",
    label: "async / await",
    real: "function f() { return new Promise(function (resolve) { resolve(1); }); }",
    why: "async and await are promise construction and then chains.",
    category: "async",
    severity: "error",
  },
  modules: {
    id: "modules",
    label: "import / export",
    real: "var api = (function () { return { x: 1 }; })();",
    why: "A module is an IIFE that returns its public surface.",
    category: "module",
    severity: "error",
  },
  exponent: {
    id: "exponent",
    label: "Exponent operator **",
    real: "Math.pow(a, b)",
    why: "The operator is a Math.pow call with a hidden coercion.",
    category: "operator",
    severity: "error",
  },
  blackbox: {
    id: "blackbox",
    label: "Black-box array method",
    real: "for (var i = 0; i < arr.length; i = i + 1) { out[out.length] = fn(arr[i]); }",
    why: "map, filter and friends are loops hidden behind a callback.",
    category: "array",
    severity: "advice",
  },
};

export const RULE_LIST = Object.keys(RULES).map((id) => RULES[id]);

const CATEGORY_ORDER = [
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

export const RULE_GROUP_ORDER = CATEGORY_ORDER;

export function describeRule(id) {
  return RULES[id] || null;
}

export const FORBIDDEN = [
  { code: "=>", label: "Arrow functions", replaces: "function (a) { return a; }" },
  { code: "`${}`", label: "Template literals", replaces: '"a" + b' },
  { code: "class / extends", label: "Classes", replaces: "function + prototype" },
  { code: "{a, b} / [a, b]", label: "Destructuring", replaces: "obj.a / arr[0]" },
  { code: "...", label: "Spread and rest", replaces: "a for loop copy" },
  { code: "f(a = 5)", label: "Default parameters", replaces: "if (a === undefined) { a = 5; }" },
  { code: "{ a }", label: "Shorthand properties", replaces: "{ a: a }" },
  { code: "{ say() {} }", label: "Shorthand methods", replaces: "{ say: function () {} }" },
  { code: "++  --", label: "Increment and decrement", replaces: "a = a + 1" },
  { code: "+=  -=  **=", label: "Compound assignment", replaces: "a = a + b" },
  { code: "?.  ?.()", label: "Optional chaining", replaces: "an explicit null check" },
  { code: "??  ??=", label: "Nullish coalescing", replaces: "a !== null && a !== undefined" },
  { code: "for...of / for...in", label: "for...of and for...in", replaces: "for (;;)" },
  { code: "async / await", label: "async and await", replaces: "new Promise + .then" },
  { code: "import / export", label: "ES modules", replaces: "IIFE modules" },
  { code: "arr.map / filter", label: "Array methods as black boxes", replaces: "a manual for loop" },
];

export const ALLOWED = [
  { code: "var", label: "The only declaration" },
  { code: "function", label: "Declarations and expressions" },
  { code: "if / else", label: "Explicit branching" },
  { code: "for (;;) / while", label: "Real loops" },
  { code: "return", label: "Explicit values" },
  { code: "new / this", label: "Real construction" },
  { code: "prototype", label: "Shared methods" },
  { code: "Object.create / getPrototypeOf", label: "Explicit chains" },
  { code: "call / apply / bind", label: "Explicit this" },
  { code: "typeof / === / !==", label: "Real comparisons" },
  { code: "arguments", label: "The real argument list" },
  { code: "IIFE", label: "Scope on demand" },
  { code: "closure", label: "Private state" },
  { code: "manual loops", label: "Visible work" },
];

export const CHECK_RULE =
  "If you cannot write it with var + function + prototype, you do not understand it yet.";
