export default {
  id: 9,
  intro:
    "In sloppy mode — the default — assigning to a name that was never declared creates a property on the global object. A typo becomes a working global and nothing points at the mistake. \"use strict\" changes that trade: the same assignment throws at its own line, per file or per function.",
  concepts: [
    {
      heading: "The typo becomes a real global",
      text: "greetign = {} (misspelled) runs without complaint: with no var anywhere, the assignment walks out and creates a property on the global object. The intended greeting stays undefined, and nothing points at the mistake.",
      purpose: "Watch a typo succeed quietly — and the real name stay empty.",
      code: `var greeting; // the intended name
greetign = {}; // the typo — no var anywhere

console.log(typeof greeting); // -> undefined — never assigned
console.log(typeof greetign); // -> object — the typo became a real global
console.log(greetign === globalThis.greetign); // -> true — it landed on the global object`,
    },
    {
      heading: "\"use strict\" turns the silent global into an error",
      text: "\"use strict\" at the top of a file or function changes the rules: assigning to an undeclared name throws a ReferenceError at that line instead of creating a global. The mistake is caught where it happens.",
      purpose: "Watch strict mode stop the typo before it lands.",
      code: `"use strict";

var greeting;
try {
  greetign = {}; // undeclared — strict mode refuses
} catch (err) {
  greeting = {}; // the fix: declare what you meant
  console.log(err.name); // -> ReferenceError
}

console.log(typeof greeting); // -> object — declared this time
console.log(typeof globalThis.greetign); // -> undefined — no global was created`,
      check: {
        q: 'Under "use strict", what does greetign = {} do?',
        options: [
          "Creates a global object like before",
          "Throws a ReferenceError at that line",
          "Assigns to the nearest declared name",
          "Silently does nothing",
        ],
        answer: 1,
        why: "Strict mode forbids implicit globals: the assignment throws immediately, so the typo is caught where it happens instead of polluting the run.",
      },
    },
    {
      heading: "Strict mode is per file or per function",
      text: "\"use strict\" is a directive, not a global switch: at the top of a file it governs that file's code; at the top of a function body it governs just that function. Sloppy code around it stays sloppy.",
      purpose: "Watch one function run strict while its neighbor stays sloppy.",
      code: `function sloppy() {
  leaked = "sloppy"; // creates a global
  return leaked;
}

function strict() {
  "use strict";
  var contained = "strict"; // declared — no leak possible
  return contained;
}

console.log(sloppy() === globalThis.leaked); // -> true — the leak is real
console.log(strict()); // -> strict — declared with var, nothing leaked`,
    },
    {
      heading: "delete removes own properties — with strict limits",
      text: "delete removes a property from an object. Configurable properties delete cleanly; non-configurable ones (like defineProperty without configurable: true) refuse — silently in sloppy mode, with a TypeError in strict mode.",
      purpose: "Watch delete succeed on a configurable property and refuse a non-configurable one.",
      code: `var box = {};
Object.defineProperty(box, "fixed", {
  value: 1,
  configurable: false,
  enumerable: true,
  writable: true,
});

box.own = 2;
delete box.own;
console.log(box.own); // -> undefined — own properties delete fine

console.log(delete box.fixed); // -> false — refused, no throw in sloppy
console.log(box.fixed); // -> 1 — still there`,
    },
  ],
  quizTags: [
    "The typo becomes a real global",
    "\"use strict\" turns the silent global into an error",
    "delete removes own properties — with strict limits",
  ],
  extraQuiz: [
    {
      q: "function warm() { var heat = 40; } — what does globalThis.heat read afterwards?",
      options: [
        "undefined — var inside a function stays in the function",
        "40 — var always creates globals",
        "40 until the function runs again",
        "An error",
      ],
      answer: 0,
      why: "var gives heat to the function scope only. The lesson 1 leak needs a missing var — with var declared, nothing reaches the global object.",
      tests: "Only functions create a scope for var",
    },
  ],
};
