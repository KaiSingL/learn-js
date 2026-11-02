// Every rule the linter can report. `real` is the replacement the course
// wants you to write instead, and `why` is the one-line reason.
// `tier`: 2 = banned sugar (linter error, blocks run in exercises),
//         1 = allowed but explicit (linter note, runs fine — teaches the hidden default).
export const RULES = {
  // ---------------- Tier 2: sugar, banned in exercises ----------------
  arrow: {
    id: "arrow",
    tier: 2,
    label: "Arrow function",
    real: "var add = function (a, b) { return a + b; };",
    why: "Arrows capture this lexically and have no prototype.",
    category: "function",
    severity: "error",
  },
  template: {
    id: "template",
    tier: 2,
    label: "Template literal",
    real: 'var s = name + " is " + age;',
    why: "A template is string concatenation plus hidden coercion.",
    category: "string",
    severity: "error",
  },
  class: {
    id: "class",
    tier: 2,
    label: "class / extends / super",
    real: "function Dog() {} Dog.prototype.bark = function () {};",
    why: "A class is a constructor function plus prototype assignments.",
    category: "prototype",
    severity: "error",
  },
  destructure: {
    id: "destructure",
    tier: 2,
    label: "Destructuring",
    real: "var x = obj.x; var y = obj.y;",
    why: "Destructuring is property (or index) access in disguise.",
    category: "object",
    severity: "error",
  },
  spread: {
    id: "spread",
    tier: 2,
    label: "Spread / rest ...",
    real: "var copy = []; for (var i = 0; i < a.length; i = i + 1) copy[copy.length] = a[i];",
    why: "Spread is a hidden loop copying values.",
    category: "array",
    severity: "error",
  },
  "default-param": {
    id: "default-param",
    tier: 2,
    label: "Default parameter",
    real: 'function f(a) { if (a === undefined) { a = 5; } }',
    why: "A default is an explicit undefined check at the top of the body.",
    category: "function",
    severity: "error",
  },
  "shorthand-prop": {
    id: "shorthand-prop",
    tier: 2,
    label: "Shorthand property",
    real: "var obj = { x: x };",
    why: "The shorthand hides the key/value pair.",
    category: "object",
    severity: "error",
  },
  "shorthand-method": {
    id: "shorthand-method",
    tier: 2,
    label: "Shorthand method",
    real: "var obj = { say: function () {} };",
    why: "A method shorthand is just a function property.",
    category: "object",
    severity: "error",
  },
  increment: {
    id: "increment",
    tier: 2,
    label: "++ / --",
    real: "i = i + 1;",
    why: "Increment hides an assignment and its evaluation order.",
    category: "operator",
    severity: "error",
  },
  compound: {
    id: "compound",
    tier: 2,
    label: "Compound assignment",
    real: "a = a + b;",
    why: "Compound assignment hides a read, an operation and a write.",
    category: "operator",
    severity: "error",
  },
  optional: {
    id: "optional",
    tier: 2,
    label: "Optional chaining ?.",
    real: "if (obj !== null && obj !== undefined) { obj.prop; }",
    why: "Optional chaining hides an explicit null check.",
    category: "safe",
    severity: "error",
  },
  nullish: {
    id: "nullish",
    tier: 2,
    label: "Nullish coalescing ??",
    real: "var out = a !== null && a !== undefined ? a : b;",
    why: "Nullish coalescing hides a two-part null check.",
    category: "safe",
    severity: "error",
  },
  "for-of-in": {
    id: "for-of-in",
    tier: 2,
    label: "for...of / for...in",
    real: "for (var i = 0; i < arr.length; i = i + 1) { var x = arr[i]; }",
    why: "Both hide the index loop (and for...in also visits inherited keys).",
    category: "loop",
    severity: "error",
  },
  async: {
    id: "async",
    tier: 2,
    label: "async / await",
    real: "function f() { return new Promise(function (resolve) { resolve(1); }); }",
    why: "async and await are promise construction and then chains.",
    category: "async",
    severity: "error",
  },
  modules: {
    id: "modules",
    tier: 2,
    label: "import / export",
    real: "var api = (function () { return { x: 1 }; })();",
    why: "A module is an IIFE that returns its public surface.",
    category: "module",
    severity: "error",
  },
  exponent: {
    id: "exponent",
    tier: 2,
    label: "Exponent operator **",
    real: "Math.pow(a, b)",
    why: "The operator is a Math.pow call with a hidden coercion.",
    category: "operator",
    severity: "error",
  },
  blackbox: {
    id: "blackbox",
    tier: 2,
    label: "Black-box array method",
    real: "for (var i = 0; i < arr.length; i = i + 1) { out[out.length] = fn(arr[i]); }",
    why: "map, filter and friends are loops hidden behind a callback.",
    category: "array",
    severity: "advice",
  },

  // ---------------- Tier 1: allowed but explicit (notes) ----------------
  declaration: {
    id: "declaration",
    tier: 1,
    label: "let / const",
    real: "var count = 0;",
    why: "let and const are block-scoped and throw in the temporal dead zone before their line. var hoists as undefined.",
    category: "declaration",
    severity: "note",
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

// Tier 0 — primitives you must master. These are the only constructs exercises use.
export const TIER0 = [
  { code: "var", label: "Variable declaration", note: "Function-scoped, hoists as undefined before assignment" },
  { code: "function", label: "Function declaration / expression", note: "Real this, arguments and prototype; no lexical capture" },
  { code: "if / else", label: "Explicit branching", note: "No truthiness shortcuts; use === checks" },
  { code: "for (;;) / while", label: "Real loops", note: "Visible index, condition and increment" },
  { code: "new", label: "Object construction", note: "Creates an object, links its prototype, calls the constructor" },
  { code: "this", label: "Call-site binding", note: "Decided by how the function is called, not where it is written" },
  { code: "prototype", label: "Shared methods", note: "One copy on the constructor, found through the chain" },
];

// Tier 1 — real ES5+, allowed but explicit. New semantics, not sugar.
export const TIER1 = [
  { code: "let", label: "Block-scoped declaration", note: "Throws in the temporal dead zone before its line" },
  { code: "const", label: "Block-scoped constant", note: "Throws in TDZ; binding cannot be reassigned" },
  { code: "Object.defineProperty", label: "Property descriptors", note: "Missing flags default to false — enumerable:false hides from Object.keys" },
  { code: "Object.create", label: "Prototype link", note: "Links directly without running a constructor" },
  { code: '"use strict"', label: "Strict mode", note: "Fails fast: undeclared assignment throws, delete of non-configurable fails" },
  { code: "arguments", label: "Arguments object", note: "Array-like, not a real Array — no map/filter/forEach" },
];

// Tier 2 — sugar. Banned in exercises, shown only in translation.
export const TIER2 = Object.keys(RULES)
  .filter((id) => RULES[id].tier === 2)
  .map((id) => {
    const rule = RULES[id];
    return {
      code: rule.label,
      label: rule.label,
      replaces: rule.real,
      why: rule.why,
      category: rule.category,
    };
  });

// Backward-compatible flat lists used by existing components and tests.
export const FORBIDDEN = TIER2;
export const ALLOWED = TIER0.concat(TIER1);

export const CHECK_RULE =
  "If you cannot write it with var + function + prototype, you do not understand it yet.";
