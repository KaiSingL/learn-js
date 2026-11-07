// The lessons. Code fields are plain strings so they can be linted,
// highlighted, copied and loaded into the playground without transformation.
//
// Each lesson teaches through short interleaved segments ("concepts"):
//   intro        — 1-3 sentences that frame the lesson's one big idea
//   concepts[]   — one idea each: heading, short text, a purpose line that
//                  says where to look, and a small self-contained snippet
//   check        — optional inline prediction question on a concept
//   tests        — quiz items name the concept heading they draw from, so
//                  every question is answerable from taught content only
//
// Every lesson follows this shape; lesson 1 is the reference example.

export const LESSONS = [
  {
    id: 1,
    title: "Variables, Types & Reference vs Value",
    goal: "Understand primitives vs objects, reference equality, typeof, and explicit undefined checks.",
    tier: 0,
    sugarReplaces: "types, typeof, assignment semantics",
    intro:
      "A variable is a name bound to a value. Primitives — numbers, strings, booleans, null, undefined — are carried by the binding itself. Objects and arrays are reached through a reference. Every surprise in this course traces back to two questions: what does = actually copy — the value, or the reference — and where does the binding live — this function, or the global object? Syntax is the small part; these two questions are the lesson.",
    concepts: [
      {
        heading: "var gives a name, = gives it a value",
        text: "var declares a name; = stores a value under that name. The name is not the value — it points at whatever was last assigned, and re-assignment simply re-points it.",
        purpose: "Watch the same name hold two values, one after the other.",
        code: `var age = 25;
console.log(age); // -> 25

age = 26;
console.log(age); // -> 26 — the same name, a new value

var name = "Lydia";
console.log(name); // -> Lydia — a name can hold any type`,
      },
      {
        heading: "typeof reads the type — with one famous bug",
        text: "typeof is the built-in way to ask what kind of value a name holds. It answers correctly for every primitive — but it has one bug from 1995 that cannot be fixed without breaking the web: typeof null returns \"object\".",
        purpose: "Watch typeof answer for every primitive — and lie about null.",
        code: `console.log(typeof 5);         // -> number
console.log(typeof "hello");   // -> string
console.log(typeof true);      // -> boolean
console.log(typeof undefined); // -> undefined
console.log(typeof { x: 1 });  // -> object

console.log(typeof null);      // -> object — the bug. null is not an object`,
        check: {
          q: "What does typeof null return?",
          options: ["\"null\"", "\"object\"", "\"undefined\"", "It throws an error"],
          answer: 1,
          why: "A historical bug: typeof null is \"object\". null is still a primitive, so test for it with === null, never with typeof.",
        },
      },
      {
        heading: "= without var creates a global",
        text: "Names live in scopes, and assignment never creates one. When = cannot find the name anywhere, it does not fail — it drops the name in the widest scope there is: as a property on the global object (globalThis). The code runs without complaint, which is exactly why this is dangerous: a typo becomes a real, working global.",
        purpose: "Watch bare assignment succeed with no declaration — and see where the name landed.",
        code: `a = 1; // no var anywhere — this still runs
console.log(a); // -> 1

// = never declares. With no name to assign to, the engine
// created one: a is now a property of the global object.
console.log(a === globalThis.a); // -> true — the name landed on the global object

// Under "use strict" the same line fails fast instead:
// ReferenceError: a is not defined (lesson 9 covers the cure)`,
        check: {
          q: "Why does a = 1 work when a was never declared?",
          options: [
            "The engine creates a as a property on the global object, then assigns 1 to it",
            "Primitive values do not need declarations",
            "a is hoisted from a var declaration further down the file",
            "The engine silently inserts var a before the assignment",
          ],
          answer: 0,
          why: "= never declares. In sloppy mode, assigning to a name that exists nowhere resolves to the global object and creates the property there. \"use strict\" turns the same line into a ReferenceError.",
        },
      },
      {
        heading: "var is function-scoped — bare assignment is not",
        text: "var is the opposite of loose assignment: it puts the binding exactly where you wrote it — inside the current function. Nothing outside can see it, even after the function returns. Loose assignment ignores function walls, walks outward, and lands on the global object. Two names written side by side — two completely different homes.",
        purpose: "Watch one name stay inside the function while the other escapes to the top.",
        code: `function run() {
  var inside = "declared with var"; // function-scoped
  leaked = "no var at all";         // no declaration — escapes the function
}

run();
console.log(typeof inside); // -> undefined — var never left the function
console.log(leaked);        // -> no var at all — the bare assignment escaped
console.log(leaked === globalThis.leaked); // -> true — leaked is a global property`,
        diagram: "scope",
        check: {
          q: "After run() finishes, which name is a property of the global object?",
          options: [
            "inside — var bindings are global",
            "leaked — the loose assignment escaped the function",
            "Both names end up on the global object",
            "Neither — both die with the function",
          ],
          answer: 1,
          why: "var scoped inside to the function — outside it, typeof inside is undefined. leaked was never declared, so the assignment dropped it on the global object, where it survives after run() returns.",
        },
      },
      {
        heading: "There is always a global object",
        text: "The global object is not something your code creates: the engine builds it before the first line runs, and it lives for the entire run of the program. It is the widest scope there is — the last stop when a name is not found anywhere else. Loose assignments land on it as properties, and every function in the program shares this one object. In a browser page it is called window, in a worker self — globalThis is the one name that works everywhere.",
        purpose: "Watch one object that already exists, holds loose names, and is reachable from any function.",
        code: `// The global object is there before your first line runs —
// and it stays for the whole run of the program.
console.log(typeof globalThis); // -> object

// Names without a home land on it, as properties:
score = 10; // no var — loose assignment
console.log(globalThis.score); // -> 10

// Every function in the program shares this one object:
function readScore() {
  return globalThis.score; // no passing, no import — it is just there
}
console.log(readScore()); // -> 10`,
        check: {
          q: "Where does the global object come from?",
          options: [
            "The engine creates it before your code runs, and it lives for the whole program",
            "Your code creates it the first time it assigns without var",
            "Each function call creates a fresh one",
            "It exists only in browsers, as window",
          ],
          answer: 0,
          why: "The global object is built before the first line runs — loose names land on it because it is already there. window and self are its per-runtime names; globalThis is the one that works everywhere.",
        },
      },
      {
        heading: "One global object, three names",
        text: "The object is always the same — only the name changes with where the code runs. globalThis is the ECMAScript standard and exists in every runtime: browsers, Node.js, workers. window is the browser's name for it; global is Node's name. Each per-runtime name exists only in its own home — window in Node is undefined, and so is global in a browser. Make globalThis your default and the other two stop being surprises: when you meet them in someone else's code, they are just local names for the object you already know.",
        purpose: "Watch the same object answer to globalThis — and window and global stay undefined outside their homes.",
        code: `score = 10;

// globalThis: the standard name — exists in every runtime.
console.log(typeof globalThis); // -> object
console.log(globalThis.score);  // -> 10

// window: the browser name. global: the Node.js name.
// This sandbox is a worker — neither one lives here:
console.log(typeof window); // -> undefined
console.log(typeof global); // -> undefined

// Same object, different local names per runtime:
// browser:  window -> object,  global -> undefined
// Node.js:  global -> object,  window -> undefined`,
        check: {
          q: "Code runs on Node.js and reads window. What is typeof window?",
          options: [
            "undefined — window is the browser's name",
            "The global object — window works in every runtime",
            "The same object as global — they are identical in Node",
            "A permission error",
          ],
          answer: 0,
          why: "window only exists in browsers and global only exists in Node. The one name guaranteed everywhere is globalThis — which is why it is the default choice.",
        },
      },
      {
        heading: "undefined and null are two kinds of nothing",
        text: "undefined means \"never assigned\" — a declared name with no value yet. null means \"intentionally empty\" — a value you set on purpose. They are different values, so check each with ===, never with truthiness: 0, \"\" and false are real values too.",
        purpose: "Watch the explicit === checks separate the two kinds of nothing.",
        code: `var missing;
if (missing === undefined) {
  console.log("missing was never assigned"); // -> missing was never assigned
}

var empty = null;
if (empty === null) {
  console.log("empty is intentionally nothing"); // -> empty is intentionally nothing
}

if (empty !== undefined) {
  console.log("null and undefined are different values"); // -> null and undefined are different values
}`,
      },
      {
        heading: "NaN is the number that is not equal to itself",
        text: "NaN is what a failed number operation produces, like 0 / 0. Its type is still \"number\". It is the only value in JavaScript that is not equal to itself, so the reliable test is value !== value.",
        purpose: "Watch NaN fail every equality check, even against itself.",
        code: `var broken = 0 / 0;
console.log(broken);            // -> NaN
console.log(typeof broken);     // -> number — NaN is a number type

console.log(broken === NaN);    // -> false
console.log(broken === broken); // -> false — the only value unequal to itself

if (broken !== broken) {
  console.log("this branch only runs for NaN"); // -> this branch only runs for NaN
}`,
      },
      {
        heading: "= copies the value for primitives",
        text: "When the right side is a primitive, = stores a copy of that value under the new name. Two names, two independent boxes: changing one never touches the other.",
        purpose: "Watch that re-pointing b never changes a.",
        code: `var a = 5;
var b = a; // copies the value 5 into a second box
b = 10;    // rewrites only b's box

console.log(a); // -> 5 — a is untouched
console.log(b); // -> 10

var text = "hi";
var copy = text;
copy = "bye";
console.log(text); // -> hi — strings behave the same way`,
        diagram: "value",
        check: {
          q: "var x = \"hi\"; var y = x; y = \"bye\"; What is x?",
          options: ["\"hi\"", "\"bye\"", "undefined", "NaN"],
          answer: 0,
          why: "Strings are primitives. = copied the value, so y is an independent copy — re-pointing y never touches x.",
        },
      },
      {
        heading: "= copies the reference for objects and arrays",
        text: "When the right side is an object or array, = does not copy the object — it copies the reference: the address where the object lives. Both names then point at the same object, so a change through either name is visible through both.",
        purpose: "Watch one object change through its alias — and the original see it.",
        code: `var user = { name: "Lydia" };
var alias = user; // copies the reference — the address, not the object

alias.name = "Changed";
console.log(user.name);      // -> Changed — one object, changed through either name
console.log(alias === user); // -> true — still one object behind two names

var letters = ["a", "b"];
var copy = letters; // arrays are objects: the same rule applies
copy[copy.length] = "c";
console.log(letters); // -> ["a", "b", "c"] — the original array grew too`,
        diagram: "reference",
        check: {
          q: "var obj = { n: 1 }; var alias = obj; alias.n = 7; What is obj.n?",
          options: ["1", "7", "undefined", "null"],
          answer: 1,
          why: "= copied the reference, so obj and alias are two names for one object. Setting alias.n changed that one object, and obj sees it.",
        },
      },
      {
        heading: "=== on objects compares references, not contents",
        text: "=== on primitives compares values. On objects it compares references: two separately created objects are never equal, even when every property matches. Same reference, equal; different references, not equal — contents are irrelevant.",
        purpose: "Watch identical contents fail === while a shared reference passes.",
        code: `var obj1 = { x: 1 };
var obj2 = { x: 1 };

console.log(obj1 === obj2);     // -> false — two objects, two references
console.log(obj1.x === obj2.x); // -> true — the values inside DO compare by value

var alias = obj1;
console.log(alias === obj1);    // -> true — the same single reference`,
      },
    ],

    starter: `// Exercise: isFalsy(value)
// Return true only for false, 0, "", null, undefined and NaN.
// Only === comparisons and value !== value are allowed.

function isFalsy(value) {
  // your code here
  return false;
}

var samples = [false, 0, "", null, undefined, NaN, true, 1, "a"];
for (var i = 0; i < samples.length; i = i + 1) {
  console.log(String(samples[i]) + " -> " + isFalsy(samples[i]));
}`,

    exercise:
      "Write isFalsy(v) that returns true only for false, 0, \"\", null, undefined and NaN. Use === and the self-check v !== v. Do not call Boolean().",
    solutions: [
      {
        title: "The six explicit checks",
        note: "NaN is the only value that is not equal to itself, which makes v !== v the real NaN test.",
        code: `function isFalsy(value) {
  if (value === false) { return true; }
  if (value === 0) { return true; }
  if (value === "") { return true; }
  if (value === null) { return true; }
  if (value === undefined) { return true; }
  if (value !== value) { return true; }
  return false;
}

var samples = [false, 0, "", null, undefined, NaN, true, 1, "a", {}, []];
for (var i = 0; i < samples.length; i = i + 1) {
  console.log(String(samples[i]) + " -> " + isFalsy(samples[i])); // -> false -> true / 0 -> true /  -> true ...
}`,
      },
      {
        title: "A typeof classifier",
        note: "Every special value is checked with === before typeof gets a turn — truthiness would have misclassified 0 and \"\".",
        code: `function describe(value) {
  if (value === undefined) { return "undefined"; }
  if (value === null) { return "null"; }
  if (value !== value) { return "NaN"; }
  if (Array.isArray(value)) { return "array"; }
  return typeof value;
}

console.log(describe(undefined)); // -> undefined
console.log(describe(null)); // -> null
console.log(describe(NaN)); // -> NaN
console.log(describe([1, 2])); // -> array
console.log(describe({ name: "Ada" })); // -> object
console.log(describe("hi")); // -> string`,
      },
    ],
    checklist: [
      "Use var for every binding — a = 1 instead creates a global",
      "Check === undefined instead of relying on truthiness",
      "Check === null separately from undefined",
      "Use value !== value to detect NaN",
      "= copies the value for primitives — two independent names",
      "= copies the reference for objects and arrays — two names, one object",
      "Two objects with identical contents are never ===",
    ],
    realTalk:
      "typeof null returning \"object\" is a bug from 1995 that cannot be fixed without breaking the web — every real codebase checks null explicitly. And = never copies an object: it copies the reference. Two names, one object; two objects, never ===.",
    quiz: [
      {
        q: "What does typeof null return?",
        options: ["\"null\"", "\"object\"", "\"undefined\"", "\"number\""],
        answer: 1,
        why: "It returns \"object\" because of a historical bug. null is still a primitive, so check it with === null.",
        tests: "typeof reads the type — with one famous bug",
      },
      {
        q: "Which expression detects NaN?",
        options: ["value === NaN", "typeof value === \"NaN\"", "value !== value", "value === null"],
        answer: 2,
        why: "NaN is the only value not equal to itself, so value !== value is the reliable test.",
        tests: "NaN is the number that is not equal to itself",
      },
      {
        q: "var user = { name: \"Lydia\" }; var alias = user; alias.name = \"Changed\"; What is user.name?",
        options: [
          "\"Lydia\" — alias received a copy of the object",
          "\"Changed\" — both names reference the same object",
          "undefined — user keeps its original value",
          "A TypeError",
        ],
        answer: 1,
        why: "= with an object copies the reference. user and alias are two names for one object, so a change through either name is visible through both.",
        tests: "= copies the reference for objects and arrays",
      },
      {
        q: "What is { x: 1 } === { x: 1 }?",
        options: [
          "true — the contents match",
          "false — two separately created objects are different references",
          "undefined",
          "A syntax error",
        ],
        answer: 1,
        why: "=== on objects compares references, not contents. Two separately created objects are never strictly equal.",
        tests: "=== on objects compares references, not contents",
      },
      {
        q: "a = 1 runs with no var in sight. What did the engine do?",
        options: [
          "Created a as a property on the global object, then stored 1 in it",
          "Ignored the assignment because a is undeclared",
          "Hoisted var a from somewhere later in the code",
          "Declared a in the nearest function scope instead",
        ],
        answer: 0,
        why: "= never declares. In sloppy mode, assigning to a name that exists nowhere creates it as a global property first, then assigns. \"use strict\" makes the same line throw a ReferenceError — that is lesson 9's subject.",
        tests: "= without var creates a global",
      },
      {
        q: "When does the global object come into existence?",
        options: [
          "The engine creates it before your code runs, and it lives for the whole program",
          "Your code creates it the first time it assigns without var",
          "Each function call creates a fresh one",
          "It exists only in browsers, as window",
        ],
        answer: 0,
        why: "The global object is built before the first line runs — loose names land on it because it is already there. window and self are its per-runtime names; globalThis is the one that works everywhere.",
        tests: "There is always a global object",
      },
      {
        q: "Which name for the global object is guaranteed to work in every runtime?",
        options: ["globalThis", "window", "global", "self"],
        answer: 0,
        why: "globalThis is the ECMAScript standard — browsers, Node.js and workers all define it. window is browser-only, global is Node-only, self is the worker-side name.",
        tests: "One global object, three names",
      },
    ],
  },
  {
    id: 2,
    title: "Scope, Hoisting & TDZ",
    goal: "See var hoisting, function scope, the temporal dead zone, and why let throws where var gives undefined.",
    tier: 1,
    sugarReplaces: "var vs let — function scope, TDZ",
    intro:
      "A binding lives inside the function that declares it, and it exists from the moment the function starts — not from the line where it is written. Only functions create that home; blocks do nothing for var. let draws the same boundary around any block and punishes reads that come too early.",
    concepts: [
      {
        heading: "A hoisted var exists before its line",
        text: "var is registered when the function starts, before any line runs. Reading the name that early does not fail: it yields undefined — the default state of a declared-but-unassigned binding. Only the assignment waits for its line.",
        purpose: "Watch a name answer before its own line has run.",
        code: `function demo() {
  console.log(early); // -> undefined — the binding already exists
  var early = 99;
  console.log(early); // -> 99 — the assignment happened here
}

demo();`,
        check: {
          q: "var x = 5 runs. What did the binding for x do before the assignment line?",
          options: ["Nothing — the binding was created by the assignment","It already existed, holding undefined","It held 5 from a previous line","It threw a ReferenceError"],
          answer: 1,
          why: "var bindings are created at function entry. Assignment is a separate step that waits for its line — before that, the binding reads as undefined.",
        },
      },
      {
        heading: "Only functions create a scope for var",
        text: "if, for and bare blocks wrap lines, but they do not give var a new home. A var declared inside a block belongs to the function around it, so code after the block still sees it. var has exactly one scope level: the function.",
        purpose: "Watch a var declared inside an if remain visible outside it.",
        code: `function check(weather) {
  if (weather === "rain") {
    var item = "umbrella";
  }
  return item; // the if did not contain it
}

console.log(check("rain")); // -> umbrella
console.log(check("sun"));  // -> undefined — never assigned this call`,
        check: {
          q: "Where does the var item inside the if block live?",
          options: ["Inside the if block only","In the check function's scope","On the global object","In a new scope per condition"],
          answer: 1,
          why: "var ignores blocks. The binding belongs to the function, so it exists on every call — assigned or not (undefined when the if never ran).",
        },
      },
      {
        heading: "Closures keep the binding alive",
        text: "Normally, when a function returns, its local bindings become unreachable and the garbage collector frees that memory. A closure changes the reachability graph: the returned function holds a reference to its birthplace scope, so the collector — which frees only what nothing points at — must keep that scope alive in memory. Every call then resolves count by walking the scope chain: the function's own scope first, then the birthplace scope that stayed alive. The variable is never copied into the function — it is found, live, through that chain. The memory is freed only when every function holding the scope becomes unreachable; only then does the collector finally take it.",
        purpose: "Watch two functions reach the same kept-alive binding — one counts it up, the other resets it.",
        code: `function makeCounter() {
  var count = 0;

  function increment() {
    count = count + 1;
    return count;
  }

  function reset() {
    count = 0;
    return count;
  }

  return [increment, reset];
}

var pair = makeCounter();
var increment = pair[0];
var reset = pair[1];

increment();
increment();
console.log(increment()); // -> 3 — the scope is still alive in memory

reset();
console.log(increment()); // -> 1 — reset through the other function, same binding`,
        diagram: "closure",
        check: {
          q: "reset() changed count to 0 — why does increment() see that change?",
          options: ["Both functions resolve the same kept-alive scope binding","reset redefined increment","count is a global variable","The functions share a copy of count"],
          answer: 0,
          why: "increment and reset both reference makeCounter's scope — the one the GC kept alive. Resetting through one function is visible through the other: one binding, two doors.",
        },
      },
      {
        heading: "One var in a loop is one shared binding",
        text: "The loop's var is created once — not once per iteration. Every function created inside the loop closes over that same binding, so when the callbacks finally run, they all read the value the loop finished with: 3.",
        purpose: "Watch three functions all report the same number.",
        code: `function build() {
  var funcs = [];
  for (var i = 0; i < 3; i = i + 1) {
    funcs[funcs.length] = function () {
      return i;
    };
  }
  return funcs;
}

var fns = build();
console.log(fns[0]()); // -> 3
console.log(fns[1]()); // -> 3 — the same binding, read after the loop
console.log(fns[2]()); // -> 3`,
        diagram: "loop-var",
      },
      {
        heading: "An IIFE gives each callback its own binding",
        text: "An immediately invoked function expression (IIFE) runs once per iteration, and each run creates a fresh binding holding that iteration's value. Hand i to the IIFE as j, and every callback closes over its own j instead of the shared i.",
        purpose: "Watch three callbacks each keep the number from their own iteration.",
        code: `function build() {
  var funcs = [];
  for (var i = 0; i < 3; i = i + 1) {
    funcs[funcs.length] = (function (j) {
      return function () {
        return j; // each callback owns this j
      };
    })(i);
  }
  return funcs;
}

var fns = build();
console.log(fns[0](), fns[1](), fns[2]()); // -> 0 1 2`,
        diagram: "iife",
        check: {
          q: "What makes the IIFE version print 0 1 2 instead of 3 3 3?",
          options: ["The IIFE copies i into a fresh j binding per iteration","The loop runs slower, giving the callbacks time","j is a reference to i, resolved at call time","The returned function is called immediately"],
          answer: 0,
          why: "Each IIFE call creates a new j holding that iteration's value. The callbacks close over their own j instead of the single shared i.",
        },
      },
      {
        heading: "let is block-scoped and throws in the TDZ",
        text: "let draws its scope around any block — and from the start of that block until the declaration line, the binding sits in the temporal dead zone (TDZ): reading it throws a ReferenceError instead of giving undefined. That is the real difference between var and let: when the binding exists, and what an early read does.",
        purpose: "Watch let work after its line — and note the two commented lines that would throw.",
        code: `function demo() {
  // console.log(later); // ReferenceError: Cannot access 'later' before initialization
  let later = 99;
  console.log(later); // -> 99

  {
    let inner = "block only";
    console.log(inner); // -> block only
  }
  // console.log(inner); // ReferenceError: inner is not defined
}

demo();`,
      },
    ],

    starter: `// Exercise: fix the loop so each function keeps its own number.
// Right now all three print 3.

function build() {
  var funcs = [];
  for (var i = 0; i < 3; i = i + 1) {
    funcs[i] = function () {
      return i;
    };
  }
  return funcs;
}

var fns = build();
console.log(fns[0]());
console.log(fns[1]());
console.log(fns[2]());`,

    exercise:
      "Fix the classic for(var i) closure bug without let: create three functions that each return their own number. Capture the value with an IIFE.",

    solutions: [
      {
        title: "The IIFE capture",
        note: "Each call to the IIFE creates a fresh j binding. The returned function closes over that binding, not over i.",
        code: `function build() {
  var funcs = [];
  for (var i = 0; i < 3; i = i + 1) {
    funcs[i] = (function (j) {
      return function () { return j; };
    })(i);
  }
  return funcs;
}

var fns = build();
console.log(fns[0]()); // -> 0
console.log(fns[1]()); // -> 1
console.log(fns[2]()); // -> 2`,
      },
      {
        title: "A private counter with get and inc",
        note: "count is not a property of the returned object. The only way in is through the functions that closed over it.",
        code: `function makeCounter() {
  var count = 0;
  return {
    inc: function () {
      count = count + 1;
      return count;
    },
    get: function () { return count; }
  };
}

var a = makeCounter();
var b = makeCounter();
console.log(a.inc(), a.inc(), b.inc(), a.get()); // -> 1 2 1 2
console.log(typeof a.count); // -> undefined`,
      },
    ],
    checklist: [
      "Remember var hoists as undefined",
      "Only functions create a new scope",
      "Use an IIFE to capture a loop value",
      "let throws in the temporal dead zone before its line",
      "Closures keep live bindings, not copies",
    ],
    realTalk:
      "Hoisting is not the engine moving your code around. It is the environment record creating every var binding at function entry, before the first line runs. let does not hoist in the same way — it stays in the TDZ until its line executes.",
    quiz: [
      {
        q: "What is a hoisted var before its assignment?",
        options: ["null", "undefined", "A ReferenceError", "The previous value"],
        answer: 1,
        why: "The binding exists from function entry but has not been assigned, so it reads as undefined.",
        tests: "A hoisted var exists before its line",
      },
      {
        q: "What happens when you read let before its line?",
        options: ["undefined", "null", "A ReferenceError (TDZ)", "The previous value"],
        answer: 2,
        why: "let lives in the temporal dead zone from the start of its block until the declaration runs.",
        tests: "let is block-scoped and throws in the TDZ",
      },
      {
        q: "Which construct creates a new variable scope with var?",
        options: ["An if block", "A for loop", "A function call", "A return statement"],
        answer: 2,
        why: "With var, only a function creates a scope. Blocks do not.",
        tests: "Only functions create a scope for var",
      },
      {
        q: "function warm() { heat = 40; } runs in sloppy mode. Where does heat end up?",
        options: [
          "On the global object — warm never declared it",
          "Inside warm's scope",
          "On window only in browsers",
          "Nowhere — the assignment fails",
        ],
        answer: 0,
        why: "No var, no function binding: the assignment walks out of warm and creates heat on the global object. Combines lesson 1's implicit global with lesson 2's scoping.",
        tests: "= without var creates a global",
      },
      {
        q: "Two closures come from two separate makeCounter() calls. After the calls below, what does the last line log?",
        code: [
          "function makeCounter() {",
          "  var count = 0;",
          "  return function () {",
          "    count = count + 1;",
          "    return count;",
          "  };",
          "}",
          "",
          "var first = makeCounter();",
          "var second = makeCounter();",
          "",
          "first();",
          "first();",
          "console.log(second()); // ?",
        ].join("\n"),
        options: ["1", "3", "undefined", "NaN"],
        answer: 0,
        why: "Each makeCounter() call created a fresh count binding. first's two calls only add to the first scope's count; second reads its own count, still 0, so the last call logs 1. Numbers are primitives: = copies the value, and nothing shares a binding — value copying plus separate bindings.",
        tests: "= copies the value for primitives",
      },
      {
        q: "Why does count survive after makeCounter returns?",
        options: [
          "The returned function still references the scope, so the garbage collector cannot collect it",
          "count was copied into the function's body",
          "count moved to the global object",
          "The engine never frees memory",
        ],
        answer: 0,
        why: "The GC frees only unreachable memory. The returned function references its birthplace scope, so count stays reachable — and every call finds it through the scope chain.",
        tests: "Closures keep the binding alive",
      },
    ],
  },
  {
    id: 3,
    title: "Functions Are Objects + arguments",
    goal: "A function is a callable object with properties, arguments and return semantics.",
    tier: 0,
    sugarReplaces: "arrow functions, rest parameters, default parameters",
    intro:
      "A function is an object with one extra ability: it can be called. The object half explains why functions can carry properties, live in variables and travel as values — everything { a: 1 } does too. The callable half explains the () — and why every real function carries an arguments object holding the values that actually arrived.",
    concepts: [
      {
        heading: "A function is a callable object",
        text: "typeof answers \"function\" for functions — a special case for callable objects. Being an object means a function can do everything objects can: carry properties, be stored in variables, passed around, returned.",
        purpose: "Watch typeof name the type, and a property live on the function itself.",
        code: `function add(a, b) {
  return a + b;
}

console.log(typeof add); // -> function — callable, and still an object

add.description = "adds two numbers"; // functions carry properties
console.log(add.description); // -> adds two numbers`,
      },
      {
        heading: "Callability is not a property",
        text: "Every property a function owns is visible: length, name, prototype, anything you attach. Callability is not among them — it is an internal engine trait, created at function birth and impossible to list, copy or inherit. Copy every property onto a plain object and typeof still says object.",
        purpose: "Watch every own property travel with Object.assign — while callability stays behind.",
        code: `function add(a, b) {
  return a + b;
}
add.description = "adds two numbers";

console.log(Object.getOwnPropertyNames(add).sort().join(", "));
// -> description, length, name, prototype — callability is not listed

var copy = Object.assign({}, add); // copy every own property to a plain object
console.log(copy.description); // -> adds two numbers — the properties traveled
console.log(typeof copy); // -> object — callability did not make the trip`,
        check: {
          q: "var copy = Object.assign({}, add) copies a function's own properties. What does copy(1, 2) do?",
          options: ["Returns 3 — callability was copied with the rest","TypeError — callability is an internal trait, not a property","undefined — the copy lost its body","3, but only the first time"],
          answer: 1,
          why: "Object.assign moves visible properties only. Callability lives in the engine's internal [[Call]] slot — typeof's \"function\" answer is the only way to ask about it — so the copy is a dead object.",
        },
      },
      {
        heading: "Declarations hoist; expressions do not",
        text: "A function declaration registers the whole function at function entry, so it is callable from the first line. A function expression only hoists the variable — the body arrives when the line runs. Calling the variable before that throws a TypeError.",
        purpose: "Watch the declaration work above its own line, and note the commented expression that would fail.",
        code: `console.log(declared(2, 3)); // -> 5 — the whole function hoisted

function declared(a, b) {
  return a + b;
}

// console.log(early(2, 3)); // TypeError: early is not a function
var early = function (a, b) {
  return a * b;
};
console.log(early(2, 3)); // -> 6 — callable only after its line`,
        check: {
          q: "var double = function (n) { return n * 2; } — what exists before this line runs?",
          options: ["The whole function","Only the variable double, as undefined","Nothing — expressions do not hoist at all","The function without a name"],
          answer: 1,
          why: "The var binding hoists as undefined; the function body arrives when the line runs. Calling double early throws a TypeError.",
        },
      },
      {
        heading: "arguments holds the actual values passed",
        text: "Every real function has an arguments object: the values that actually arrived, whether or not they match the parameter list. Extra arguments are not lost — they are right there. arguments.length counts what arrived; the function's own length counts what was declared.",
        purpose: "Watch a function read more values than it declared parameters for.",
        code: `function show() {
  var result = "";
  for (var i = 0; i < arguments.length; i = i + 1) {
    result = result + arguments[i] + " ";
  }
  return result;
}

console.log(show("a", "b", "c")); // -> a b c
console.log(show.length); // -> 0 — declared parameters, not received values`,
      },
      {
        heading: "arguments is array-like, not an Array",
        text: "arguments has length and numeric indexes, which makes it array-like — but it is not an Array, so none of the array methods hang off it. The real conversion is borrowed slicing: Array.prototype.slice.call(arguments) runs slice with arguments as its target.",
        purpose: "Watch slice borrowed from Array.prototype collect arguments into a true array.",
        code: `function collect() {
  return Array.prototype.slice.call(arguments);
}

var list = collect("x", "y");
console.log(list.length); // -> 2
console.log(list[1]); // -> y — a real array, not just array-like`,
      },
      {
        heading: "State can live on the function object",
        text: "A function's properties persist between calls, which makes the function itself a place for state. The classic counter: increment fn.count on every call. Any code that can reach the function can also read — and overwrite — that state, because it is an ordinary property.",
        purpose: "Watch a count climb across calls — and survive an outside overwrite.",
        code: `function makeCounter() {
  function counter() {
    counter.count = counter.count + 1;
    return counter.count;
  }
  counter.count = 0;
  return counter;
}

var next = makeCounter();
console.log(next()); // -> 1
console.log(next()); // -> 2
next.count = 100;
console.log(next()); // -> 101 — the state is public property, not a secret`,
        check: {
          q: "next.count = 100 runs between two calls. What does the next call return?",
          options: ["3 — the internal count is protected","101 — count is an ordinary property anyone can change","100 — the call resets it","undefined — the function broke"],
          answer: 1,
          why: "Properties on a function are as public as on any object. Nothing hides them — which is why closures (lesson 2) are the privacy mechanism when you need one.",
        },
      },
    ],

    starter: `// Exercise: makeCounter
// Return a function that increments its own count property on every call.

function makeCounter() {
  function counter() {
    // your code here
    return 0;
  }
  // set the starting count here
  return counter;
}

var c = makeCounter();
console.log(c());
console.log(c());
console.log(c.count);`,

    exercise:
      "Create makeCounter() that returns a function storing its call count on itself as fn.count and incrementing it each call. Use a function declaration only.",
    solutions: [
      {
        title: "Count stored on the function object",
        note: "The count is a normal property, so outside code can read and even overwrite it. That is what being an object means.",
        code: `function makeCounter() {
  function counter() {
    counter.count = counter.count + 1;
    return counter.count;
  }
  counter.count = 0;
  return counter;
}

var c = makeCounter();
console.log(c()); // -> 1
console.log(c()); // -> 2
console.log(c.count); // -> 2
c.count = 100;
console.log(c()); // -> 101`,
      },
      {
        title: "Read every argument with arguments",
        note: "arguments is array-like: it has length and indexes, but it is not an Array. Convert it with Array.prototype.slice.call when you need array methods.",
        code: `function sum() {
  var total = 0;
  for (var i = 0; i < arguments.length; i = i + 1) {
    total = total + arguments[i];
  }
  return total;
}

console.log(sum(1, 2, 3, 4)); // -> 10
console.log(sum()); // -> 0

var toArray = function () {
  return Array.prototype.slice.call(arguments);
};
console.log(toArray("a", "b").length); // -> 2`,
      },
    ],
    checklist: [
      "Declare functions with the function keyword",
      "Use arguments instead of rest parameters",
      "Remember a function is an object you can annotate",
      "Return explicitly; a bare return gives undefined",
      "Know that declarations hoist and expressions do not",
    ],
    realTalk:
      "Arrow functions do not have their own this, arguments or prototype. A real function has all three. That is the difference the syntax was hiding.",
    quiz: [
      {
        q: "What does typeof function () {} return?",
        options: ["\"object\"", "\"function\"", "\"callable\"", "\"undefined\""],
        answer: 1,
        why: "typeof has a special case for callable objects and reports \"function\". It is the only way to ask about callability — the trait Object.getOwnPropertyNames never lists and Object.assign can never copy.",
        tests: "A function is a callable object",
      },
      {
        q: "What is available before a function expression is assigned?",
        options: ["The function body", "The whole expression", "Only the variable, as undefined", "A syntax error"],
        answer: 2,
        why: "The var binding hoists, but the assignment happens in place. Calling it early throws a TypeError.",
        tests: "Declarations hoist; expressions do not",
      },
      {
        q: "What is arguments?",
        options: ["A real Array", "An array-like object", "A string", "A copy of the parameters"],
        answer: 1,
        why: "It has length and numeric indexes but no array methods. Use Array.prototype.slice.call to convert it.",
        tests: "arguments is array-like, not an Array",
      },
      {
        q: "var copy = Object.assign({}, next) copies every own property of a function. What is true of copy?",
        options: [
          "It is callable — all the data traveled",
          "It carries the properties but typeof says \"object\" — callability stayed behind",
          "It is an array-like object with a length property",
          "The assignment throws — functions cannot be copied",
        ],
        answer: 1,
        why: "Properties are visible slots; callability is an internal engine trait no copy operation reaches. The copy proves the split: object side traveled, callable side did not.",
        tests: "Callability is not a property",
      },
      {
        q: "var alias = next; (next is a counter function). alias.count = 50; What is next.count?",
        options: [
          "50 — both names are one function object",
          "The old count — alias received a copy",
          "undefined — alias has its own count",
          "An error — functions cannot be aliased",
        ],
        answer: 0,
        why: "Functions are objects, so = copied the reference: alias and next are two names for one function. Writing through either name changes the single shared object.",
        tests: "= copies the reference for objects and arrays",
      },
    ],
  },
  {
    id: 4,
    title: "this, call, apply, bind",
    goal: "See that this is decided by the call site, then control it explicitly.",
    tier: 0,
    sugarReplaces: "arrow lexical this, hidden receiver tricks",
    intro:
      "A real function does not own this — every call supplies it. The object before the dot, call, apply or bind: four ways to set it, each with a different way of passing the rest of the arguments. And when a nested call would lose the right this, an ordinary variable holds onto it.",
    concepts: [
      {
        heading: "this is decided by the call site",
        text: "A real function does not own its this. Calling through an object sets this to that object; calling the function on its own leaves this without a home (undefined in strict mode). Same function, different call sites, different this.",
        purpose: "Watch one function answer with two different verdicts, depending on how it was called.",
        code: `function whoami() {
  return this === speaker; // in strict mode a plain call makes this undefined
}

var speaker = { greet: whoami };

console.log(speaker.greet()); // -> true — called through the object
console.log(whoami());        // -> false — called on its own`,
      },
      {
        heading: "call sets this and lists arguments one by one",
        text: "call borrows the function for one invocation: the first argument becomes this, and the rest are passed on as normal comma-separated arguments.",
        purpose: "Watch greet run twice with two different this objects, arguments passed one by one.",
        code: `function greet(greeting) {
  return greeting + " " + this.name;
}

var alex = { name: "Alex" };
var kai = { name: "Kai" };

console.log(greet.call(alex, "Hello")); // -> Hello Alex
console.log(greet.call(kai, "Hey"));    // -> Hey Kai`,
      },
      {
        heading: "apply sets this and takes the arguments as an array",
        text: "apply is call with a different signature: this first, then an array-like of arguments. Same result, different packing — exactly what you need when the arguments are already collected in an array or in arguments itself.",
        purpose: "Watch the same call run through apply with its arguments packed in an array.",
        code: `function greet(greeting, punctuation) {
  return greeting + " " + this.name + punctuation;
}

var alex = { name: "Alex" };

console.log(greet.apply(alex, ["Hi", "!"])); // -> Hi Alex!
console.log(greet.call(alex, "Hi", "!"));    // -> Hi Alex! — same result, other packing`,
      },
      {
        heading: "bind returns a new function with this locked",
        text: "bind does not call anything. It returns a new function whose this is permanently the first argument; the call happens later, whenever — and however many times — the bound function is invoked.",
        purpose: "Watch the bound function stay reusable — same lock, many calls.",
        code: `function greet(greeting) {
  return greeting + " " + this.name;
}

var alex = { name: "Alex" };
var helloAlex = greet.bind(alex);

console.log(helloAlex("Hi"));    // -> Hi Alex
console.log(helloAlex("Hello")); // -> Hello Alex — the lock holds
console.log(typeof helloAlex);   // -> function — a new function, not a result`,
      },
      {
        heading: "var self = this keeps the call site's this",
        text: "An inner function called on its own does not inherit the outer call's this — the call site decides, and a plain call supplies none. The fix is to capture this in an ordinary variable while it is still correct, and use that variable inside.",
        purpose: "Watch the count climb through a callback that would otherwise lose this.",
        code: `function Counter() {
  this.count = 0;
  var self = this;
  this.inc = function () {
    self.count = self.count + 1;
  };
}

var counter = new Counter();
counter.inc();
counter.inc();
console.log(counter.count); // -> 2 — self kept the call site's this`,
        check: {
          q: "Why capture var self = this inside the constructor?",
          options: ["An inner plain call would not inherit this from the method call","this is undefined inside every function body","self becomes a private property of the object","It copies the whole object for safety"],
          answer: 0,
          why: "this is decided per call. Inside this.inc it still points at the object, but a nested plain call would not — self freezes the value while it is correct.",
        },
      },
      {
        heading: "Borrowing a method with call",
        text: "A method is just a function stored on an object — any object with a matching shape can lend itself as this. call lets a different object run someone else's method without copying the code.",
        purpose: "Watch a quiet object borrow a speaker's method — no copying, just call.",
        code: `var speaker = {
  name: "Nova",
  speak: function (line) {
    return this.name + ": " + line;
  }
};

var quiet = { name: "Echo" };

console.log(speaker.speak.call(quiet, "hello")); // -> Echo: hello
console.log(speaker.speak("hi")); // -> Nova: hi — the original is untouched`,
      },
    ],

    starter: `// Exercise: myBind(fn, ctx, ...presetArgs)
// Return a function that calls fn with ctx as this.
// Use apply and the arguments object, never call the built-in bind.

function myBind(fn, ctx) {
  // your code here
  return fn;
}

function greet(greeting, punct) {
  return greeting + " " + this.name + punct;
}

var helloKai = myBind(greet, { name: "Kai" }, "Hello");
console.log(helloKai("!"));
console.log(helloKai("?"));`,

    exercise:
      "Implement bind manually as myBind(fn, ctx, ...preset). Return a function that calls fn.apply(ctx, args). Then borrow a method from one object to another with call.",
    solutions: [
      {
        title: "myBind with preset arguments",
        note: "arguments is array-like, so Array.prototype.slice.call is the real conversion. concat merges preset and call-time values.",
        code: `function myBind(fn, ctx) {
  var preset = Array.prototype.slice.call(arguments, 2);
  return function () {
    var args = preset.concat(Array.prototype.slice.call(arguments));
    return fn.apply(ctx, args);
  };
}

function greet(greeting, punct) {
  return greeting + " " + this.name + punct;
}

var helloKai = myBind(greet, { name: "Kai" }, "Hello");
console.log(helloKai("!")); // -> Hello Kai
console.log(helloKai("?")); // -> Hello Kai
console.log(typeof helloKai); // -> function`,
      },
      {
        title: "Borrowing a method with call",
        note: "speaker.speak is just a function. call lets a different object supply this without copying the method.",
        code: `var speaker = {
  name: "Nova",
  speak: function (line) {
    return this.name + ": " + line;
  }
};

var quiet = { name: "Echo" };
console.log(speaker.speak.call(quiet, "hello")); // -> Echo: hello
console.log(speaker.speak.apply(quiet, ["again"])); // -> Echo: again

var detached = speaker.speak;
console.log(typeof detached); // -> function
console.log(detached.call({ name: "Borrowed" }, "works")); // -> Borrowed: works`,
      },
    ],
    checklist: [
      "this is set by how the function is called",
      "call passes arguments one by one",
      "apply passes an array-like second argument",
      "bind returns a new function and does not call it",
      "Store var self = this before a callback",
    ],
    realTalk:
      "If a function is extracted from an object and called on its own, this is not the object. That is not a bug; it is the call site doing exactly what it was told.",
    quiz: [
      {
        q: "What decides this inside a normal function?",
        options: ["Where the function was written", "How the function is called", "The function name", "The return value"],
        answer: 1,
        why: "A real function receives this from its call site. Only arrow functions capture this lexically.",
        tests: "this is decided by the call site",
      },
      {
        q: "What is the second argument of apply?",
        options: ["A single value", "An array-like of arguments", "The this object", "A callback"],
        answer: 1,
        why: "apply(thisArg, argsArray) spreads the array-like into the parameter list.",
        tests: "apply sets this and takes the arguments as an array",
      },
      {
        q: "What does bind return?",
        options: ["The result of calling the function", "A new function with this fixed", "The this object", "undefined"],
        answer: 1,
        why: "bind returns a new function. The call happens later, when you invoke that new function.",
        tests: "bind returns a new function with this locked",
      },
      {
        q: "var detached = speaker.speak; What does detached hold?",
        options: [
          "A reference to the same function — not a copy",
          "A copy of the function",
          "The result of calling speak",
          "Only the function's name",
        ],
        answer: 0,
        why: "Methods are function objects, so = copied the reference. detached.call(anyObject, line) runs the same code with a different this — lesson 1's reference rule, applied to functions.",
        tests: "= copies the reference for objects and arrays",
      },
      {
        q: "function forward() { return greet.apply(this, arguments); } — why can arguments be passed to apply as-is?",
        options: [
          "arguments is array-like — exactly the shape apply's second argument expects",
          "arguments is a real Array",
          "apply converts strings automatically",
          "It cannot — slice.call is required first",
        ],
        answer: 0,
        why: "apply's second parameter only needs length and indexes, and arguments has both. Forwarding needs no conversion — slice.call is required only when a true array is needed.",
        tests: "arguments is array-like, not an Array",
      },
    ],
  },
  {
    id: 5,
    title: "Objects & Prototype — The Real Class",
    goal: "Replace the class keyword with a constructor function, prototype methods and prototype-chain walking.",
    tier: 0,
    sugarReplaces: "class, extends, constructor, super",
    intro:
      "A class is syntax sugar for two plain moves: a constructor function that fills this, and methods assigned to its prototype so every instance shares one copy. new runs those moves; the prototype chain lets one constructor reuse another's. None of it is hidden — all of it can be written by hand.",
    concepts: [
      {
        heading: "new builds the object in four steps",
        text: "new Dog(\"Rex\") creates a fresh object, links it to Dog.prototype, calls Dog with this set to that object, and — unless the constructor returns its own object — hands the new object back. Everything the constructor writes on this lands on the fresh object.",
        purpose: "Watch the constructor's this become the returned instance.",
        code: `function Dog(name) {
  // new made the object and set this to it:
  this.name = name;
  this.tricks = [];
}

var rex = new Dog("Rex");
console.log(rex.name);   // -> Rex
console.log(rex.tricks); // -> [] — the constructor built this one
console.log(typeof rex); // -> object`,
        check: {
          q: "What does new Dog(\"Rex\") do before running the constructor body?",
          options: ["Creates an empty object linked to Dog.prototype and sets this to it","Copies Dog.prototype onto the new object","Calls Dog once to warm it up","Creates a string with the name"],
          answer: 0,
          why: "Four steps: fresh object, prototype link, constructor call with this bound, and the object returned. The body's writes on this land on that fresh object.",
        },
      },
      {
        heading: "Prototype methods are shared, not copied",
        text: "A method assigned to Dog.prototype exists once. Instances do not own it — reaching rex.bark walks the prototype link and finds it on the prototype. hasOwnProperty makes the split visible: name is on rex, bark is not.",
        purpose: "Watch the instance own its data but borrow its method.",
        code: `function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function () {
  return "Woof " + this.name;
};

var rex = new Dog("Rex");
console.log(rex.bark()); // -> Woof Rex — found through the prototype link
console.log(rex.hasOwnProperty("name")); // -> true — own property
console.log(rex.hasOwnProperty("bark")); // -> false — lives on the prototype`,
      },
      {
        heading: "Inheritance: link prototypes, then repair the constructor",
        text: "Student inherits by calling the parent constructor for its own state (Person.call(this, name)) and replacing its prototype with an object linked to the parent's (Object.create(Person.prototype)). The constructor property is then repaired, because replacing the prototype destroyed it.",
        purpose: "Watch a Student answer both a Person call and its own, through one chain.",
        code: `function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function () {
  return "Hi, " + this.name;
};

function Student(name, subject) {
  Person.call(this, name); // parent state, with this = the new student
  this.subject = subject;
}
Student.prototype = Object.create(Person.prototype); // link the chain
Student.prototype.constructor = Student; // repair the broken pointer
Student.prototype.study = function () {
  return this.name + " studies " + this.subject;
};

var s = new Student("Mira", "math");
console.log(s.sayHi()); // -> Hi, Mira — found up the chain
console.log(s.study()); // -> Mira studies math`,
        check: {
          q: "Why repair Student.prototype.constructor after Object.create?",
          options: ["Replacing the prototype removed the constructor property, so it points at Person","Object.create requires a constructor to work","The repair gives Student new methods","Without it, new Student returns a Person"],
          answer: 0,
          why: "Student.prototype = Object.create(...) wiped the old prototype, including its constructor pointer. Setting it back keeps Student.prototype.constructor answering Student.",
        },
      },
      {
        heading: "instanceof walks the same chain",
        text: "instanceof does not compare constructors — it checks whether the constructor's prototype appears somewhere in the object's prototype chain. A Student is an instance of both Student and Person because both prototypes sit on one chain.",
        purpose: "Watch one object satisfy three instanceof checks through a single chain.",
        code: `function Person(name) {
  this.name = name;
}
function Student(name, subject) {
  Person.call(this, name);
  this.subject = subject;
}
Student.prototype = Object.create(Person.prototype);

var s = new Student("Mira", "math");
console.log(s instanceof Student); // -> true — direct link
console.log(s instanceof Person); // -> true — Person.prototype is up the chain
console.log(s instanceof Object); // -> true — the chain ends there`,
        check: {
          q: "Why is s instanceof Person true even though Student built s?",
          options: ["Student.prototype links to Person.prototype, so the chain passes through it","Person.call copied Person's methods onto s","instanceof compares constructor names","Student extends Person internally"],
          answer: 0,
          why: "instanceof walks s's prototype chain looking for Person.prototype. Object.create(Person.prototype) placed exactly that object one step up the chain.",
        },
      },
      {
        heading: "Methods that return this enable chaining",
        text: "A prototype method that returns this hands the same instance back to the next call, so calls chain on one line. this is the instance — returning it is returning the object the method just worked on.",
        purpose: "Watch two chained calls operate on the same dog.",
        code: `function Dog(name) {
  this.name = name;
  this.tricks = [];
}

Dog.prototype.learn = function (trick) {
  this.tricks[this.tricks.length] = trick;
  return this; // hand the same instance back
};

var rex = new Dog("Rex");
console.log(rex.learn("sit").learn("roll").tricks.length); // -> 2`,
      },
    ],

    starter: `// Exercise: build Cat with a meow method on the prototype.
// new Cat("Tom").meow() should return "Tom says meow".

function Cat(name) {
  // store the name
}

Cat.prototype.meow = function () {
  // return the sentence
};

var tom = new Cat("Tom");
console.log(tom.meow());`,

    exercise:
      "Build Cat(name) with meow() on the prototype. Then build Student(name, subject) that inherits from Person via Object.create and fixes its constructor.",
    solutions: [
      {
        title: "Cat with a shared method",
        note: "hasOwnProperty is the proof: name lives on the instance, meow lives on the prototype.",
        code: `function Cat(name) {
  this.name = name;
  this.lives = 9;
}

Cat.prototype.meow = function () {
  return this.name + " says meow";
};

Cat.prototype.loseLife = function () {
  this.lives = this.lives - 1;
  return this.lives;
};

var tom = new Cat("Tom");
console.log(tom.meow()); // -> Tom says meow
console.log(tom.lives); // -> 9
console.log(tom.loseLife()); // -> 8
console.log(tom.hasOwnProperty("meow")); // -> false
console.log(Cat.prototype.hasOwnProperty("meow")); // -> true`,
      },
      {
        title: "Manual inheritance",
        note: "Object.create(Person.prototype) makes the chain without running Person. The constructor repair keeps Student.prototype.constructor pointing at Student.",
        code: `function Person(name) { this.name = name; }
Person.prototype.sayHi = function () {
  return "Hi, " + this.name;
};

function Student(name, subject) {
  Person.call(this, name);
  this.subject = subject;
}

Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;
Student.prototype.study = function () {
  return this.name + " studies " + this.subject;
};

var s = new Student("Mira", "math");
console.log(s.sayHi()); // -> Hi, Mira
console.log(s.study()); // -> Mira studies math
console.log(s.constructor === Student); // -> true
console.log(s instanceof Person); // -> true`,
      },
    ],
    checklist: [
      "Put methods on the prototype, not in the constructor",
      "Use new to create an instance",
      "Call the parent constructor with Parent.call(this, ...)",
      "Link prototypes with Object.create(Parent.prototype)",
      "Restore constructor after replacing the prototype",
    ],
    realTalk:
      "Log any class instance and open its [[Prototype]]. A class compiles to exactly the constructor and prototype assignments in this lesson. There is no class object at runtime.",
    quiz: [
      {
        q: "What does new Dog(\"Rex\") create first?",
        options: ["A copy of Dog.prototype", "An empty object linked to Dog.prototype", "A global object", "A string"],
        answer: 1,
        why: "new creates a fresh object, links its prototype to Dog.prototype, then runs Dog with this bound to it.",
        tests: "new builds the object in four steps",
      },
      {
        q: "Where does rex.bark live?",
        options: ["On rex", "On Dog.prototype", "On Object.prototype", "In a closure"],
        answer: 1,
        why: "The method is assigned once to Dog.prototype and found through the prototype chain.",
        tests: "Prototype methods are shared, not copied",
      },
      {
        q: "Why put methods on the prototype?",
        options: ["They run faster", "One shared copy instead of one per instance", "They become private", "They can use new"],
        answer: 1,
        why: "Prototype methods are allocated once. Methods inside the constructor create a new function for every instance.",
        tests: "Prototype methods are shared, not copied",
      },
      {
        q: "var alias = rex; alias.name = \"Ace\"; What is rex.name?",
        options: [
          "Ace — = copied the reference, so one object has two names",
          "Rex — alias received a copy",
          "undefined — the rename broke rex",
          "Ace, but only until rex.bark() runs",
        ],
        answer: 0,
        why: "rex is an object, so = copied its reference into alias. Renaming through alias renamed the instance itself — the prototype plays no role in that.",
        tests: "= copies the reference for objects and arrays",
      },
      {
        q: "Dog.prototype.bark = function () { ... }; — what kind of value is stored on the prototype?",
        options: [
          "A function — prototypes store callable properties like any object",
          "A class definition",
          "A copy of the method per future instance",
          "A special method type the engine treats differently",
        ],
        answer: 0,
        why: "Prototype methods are function values stored under keys — exactly like add.description stored a string. The prototype is just an object carrying callable properties.",
        tests: "A function is a callable object",
      },
    ],
  },
  {
    id: 6,
    title: "Property Descriptors — defineProperty",
    goal: "Control property flags: writable, enumerable, configurable.",
    tier: 1,
    sugarReplaces: "obj.age = 21 (sugar for defineProperty with all flags true)",
    intro:
      "Writing obj.age = 21 defines a property with three flags silently set to true. Object.defineProperty is the long form that makes those flags explicit — and every flag you leave out defaults to false. The flags decide who can write, list, or delete the property; accessors swap value for a get/set pair.",
    concepts: [
      {
        heading: "Normal assignment is defineProperty with every flag true",
        text: "obj.age = 21 does more than store a value: it defines the property with writable, enumerable and configurable all true. The long form makes those choices explicit — the descriptor shows what assignment silently picked.",
        purpose: "Watch the descriptor that the short assignment form created.",
        code: `var person = { name: "Lydia" };
person.age = 21;

var descriptor = Object.getOwnPropertyDescriptor(person, "age");
console.log(descriptor.writable); // -> true
console.log(descriptor.enumerable); // -> true
console.log(descriptor.configurable); // -> true`,
      },
      {
        heading: "Missing flags default to false",
        text: "defineProperty with only a value leaves every flag false. The property exists and reads fine — but it cannot be written, it hides from Object.keys and for-in, and it cannot be deleted or redefined.",
        purpose: "Watch a defined property exist, read — and stay invisible to Object.keys.",
        code: `var person = { name: "Lydia" };
Object.defineProperty(person, "age", { value: 21 });

console.log(person.age); // -> 21 — the property exists
console.log(person.hasOwnProperty("age")); // -> true — it is own
console.log(Object.keys(person)); // -> ["name"] — age is not enumerable`,
        check: {
          q: "defineProperty(obj, \"bar\", { value: 2 }) — what did bar NOT get?",
          options: ["A value — that was provided","writable, enumerable and configurable — all default to false","Its spot in memory","A prototype link"],
          answer: 1,
          why: "Every missing descriptor flag defaults to false: not writable, not enumerable, not configurable. The classic trap is expecting assignment-like behavior from the long form.",
        },
      },
      {
        heading: "writable: false makes assignment silently fail",
        text: "A non-writable property keeps its value: assigning to it does nothing in sloppy mode — no error, no change. Reading it back proves the write was refused, not lost.",
        purpose: "Watch a write land nowhere at all.",
        code: `var config = { version: 1 };
Object.defineProperty(config, "version", {
  value: 2,
  writable: false,
  enumerable: true,
  configurable: true,
});

config.version = 3;
console.log(config.version); // -> 2 — the write was ignored
console.log(Object.keys(config)); // -> ["version"] — enumerable this time`,
      },
      {
        heading: "Object.keys lists enumerable own properties only",
        text: "Object.keys walks the object's own properties and keeps exactly the enumerable ones. Enumerable is a property flag, not a judgment: defineProperty controls it, and inherited properties never leak in — only own properties qualify.",
        purpose: "Watch one flag decide whether a property appears.",
        code: `var visible = { a: 1 };
Object.defineProperty(visible, "b", { value: 2, enumerable: true });
Object.defineProperty(visible, "c", { value: 3, enumerable: false });

console.log(Object.keys(visible)); // -> ["a","b"] — c exists but hides
console.log(visible.c); // -> 3 — still there when read directly`,
      },
      {
        heading: "Accessors are get and set instead of value and writable",
        text: "A descriptor describes either a data property (value, writable) or an accessor property (get, set). An accessor has no stored value of its own: reading runs get, writing runs set — the machinery behind getter and setter syntax.",
        purpose: "Watch cents convert through get and set with nothing stored in between.",
        code: `var account = { balance: 100 };
Object.defineProperty(account, "cents", {
  get: function () {
    return Math.round(this.balance * 100);
  },
  set: function (value) {
    this.balance = value / 100;
  },
});

account.cents = 250;
console.log(account.balance); // -> 2.5 — set ran
console.log(account.cents); // -> 250 — get ran`,
      },
    ],

    starter: `// Exercise: Make Object.keys return both properties.
// Define age with enumerable: true so Object.keys sees it.

var person = new Object();
person.name = "Lydia";

// your defineProperty call here

console.log(Object.keys(person).length); // should be 2`,

    exercise:
      "Use Object.defineProperty to add an age property to person with enumerable: true so Object.keys(person) returns [\"name\", \"age\"]. Without enumerable: true it defaults to false and disappears from Object.keys.",
    solutions: [
      {
        title: "Both properties visible",
        note: "With enumerable: true, Object.keys lists the defineProperty-created property alongside the normally assigned one.",
        code: `var person = new Object();
person.name = "Lydia";

Object.defineProperty(person, "age", {
  value: 21,
  writable: true,
  enumerable: true,
  configurable: true
});

console.log(Object.keys(person).length); // 2
console.log(Object.keys(person)); // ["name", "age"]`,

      },
      {
        title: "Read-only property",
        note: "With writable: false, assignment in sloppy mode does nothing and the value stays put.",
        code: `var config = new Object();
config.version = 1;

Object.defineProperty(config, "version", {
  value: 2,
  writable: false,
  enumerable: true,
  configurable: false
});

config.version = 3;
console.log(config.version); // -> 2
console.log(Object.keys(config)); // -> ["version"]

delete config.version;
console.log(config.version); // -> 2`,
      },
    ],
    checklist: [
      "Use Object.defineProperty to set flags explicitly",
      "Remember missing flags default to false",
      "Use Object.getOwnPropertyDescriptor to inspect",
      "Object.keys only lists enumerable own properties",
      "Normal assignment is sugar for all three flags true",
      "Accessors use get and set instead of value and writable",
    ],
    realTalk:
      "obj.age = 21 is not magic. It is Object.defineProperty(obj, \"age\", { value: 21, writable: true, enumerable: true, configurable: true }) written in short form. The long form is what gives you control — and the default for every missing flag is false.",
    quiz: [
      {
        q: "What does Object.keys return for a property defined with enumerable: false?",
        options: ["The property name", "Nothing for that property", "A syntax error", "undefined"],
        answer: 1,
        why: "Object.keys only returns enumerable own properties. A non-enumerable property is invisible to it.",
        tests: "Object.keys lists enumerable own properties only",
      },
      {
        q: "What happens when you omit writable in defineProperty?",
        options: ["It defaults to true", "It defaults to false", "It throws an error", "It copies from the prototype"],
        answer: 1,
        why: "Every missing descriptor flag defaults to false, including writable.",
        tests: "Missing flags default to false",
      },
      {
        q: "What does an accessor descriptor carry instead of value and writable?",
        options: ["get and set", "read and write", "open and closed", "has and gives"],
        answer: 0,
        why: "Accessor properties are defined with get and set functions; a single descriptor cannot mix them with value and writable.",
        tests: "Accessors are get and set instead of value and writable",
      },
      {
        q: "var alias = person; alias.age = 30; What is person.age when age was created by normal assignment?",
        options: [
          "30 — assignment changed the one shared object",
          "21 — alias received a copy",
          "undefined",
          "An error — age is not writable",
        ],
        answer: 0,
        why: "Normal assignment makes age writable, and = copied the reference: person and alias are two names for one object. The flag story and the reference story stack.",
        tests: "= copies the reference for objects and arrays",
      },
      {
        q: "Reading account.cents runs the getter. What is this inside it?",
        options: [
          "account — the accessor is invoked through the object",
          "The cents property itself",
          "undefined, always",
          "The descriptor object",
        ],
        answer: 0,
        why: "Accessors are functions, so the call-site rule applies: reading account.cents calls get with this = account. That is why this.balance reaches the real property.",
        tests: "this is decided by the call site",
      },
    ],
  },
  {
    id: 7,
    title: "Coercion & Equality",
    goal: "Understand +, == vs ===, and how Object keys always become strings.",
    tier: 0,
    sugarReplaces: "== vs ===, implicit coercion, template coercion",
    intro:
      "JavaScript converts types in more places than you notice. + flips between adding and joining, == converts before comparing while === refuses to, and object keys are always strings — so the object you used as a key became \"[object Object]\". The mechanism has a name, ToPrimitive, and objects can control it.",
    concepts: [
      {
        heading: "+ adds numbers, concatenates strings",
        text: "The + operator looks at its operands: if either side is a string, + concatenates; with two numbers it adds. Other operators coerce differently — subtraction always goes numeric. That asymmetry is why \"10\" - 5 is 5 while \"10\" + 5 is \"105\".",
        purpose: "Watch + flip between adding and joining based on one operand.",
        code: `console.log(5 + 5); // -> 10 — two numbers, added
console.log("5" + 5); // -> 55 — one string, concatenated
console.log("10" + 5); // -> 105
console.log("10" - 5); // -> 5 — subtraction forces numeric`,
      },
      {
        heading: "== coerces, === does not",
        text: "== converts the operands to a common type before comparing; === compares type and value with no conversion. Same pair of values, opposite answers — which is why this course writes === everywhere and reaches for == only deliberately.",
        purpose: "Watch one pair split into two answers by the operator alone.",
        code: `var a = 5;
var b = "5";

console.log(a == b); // -> true — == coerced "5" to 5
console.log(a === b); // -> false — === compared type first

console.log(null == undefined); // -> true — the one special pair
console.log(null === undefined); // -> false`,
      },
      {
        heading: "Object keys are always strings",
        text: "Whatever you place inside obj[...] becomes a property key, and keys are strings (or Symbols). An object as a key is converted to its string form first — so every plain object lands on the same key: \"[object Object]\".",
        purpose: "Watch two different object keys collapse into one string key.",
        code: `var box = {};
var first = { id: 1 };
var second = { id: 2 };

box[first] = "first value";
box[second] = "second value"; // overwrote the same key!

console.log(box["[object Object]"]); // -> second value — both collided
console.log(Object.keys(box)); // -> ["[object Object]"] — one key total

box[42] = "answer";
console.log(box["42"]); // -> answer — number keys become strings too`,
        check: {
          q: "obj[{ id: 1 }] = 1; obj[{ id: 2 }] = 2; What does Object.keys(obj) return?",
          options: ["Both object keys, converted","[\"[object Object]\"] — both objects became the same string key","An error — objects cannot be keys","[] — objects are not enumerable"],
          answer: 1,
          why: "Keys are strings: each object converts to \"[object Object]\", so the second write overwrites the first. One key, one value.",
        },
      },
      {
        heading: "ToPrimitive: valueOf first for +, toString first for strings",
        text: "When an object meets + or a string context, the engine converts it to a primitive first — that is ToPrimitive. With a numeric hint (like +) it calls valueOf first; with a string hint (like String()) it calls toString first. An object controls its own conversion by defining these.",
        purpose: "Watch one wallet answer three ways, depending on the hint.",
        code: `var wallet = {
  dollars: 2,
  valueOf: function () {
    return this.dollars;
  },
  toString: function () {
    return this.dollars + " dollars";
  }
};

console.log(wallet + 1); // -> 3 — numeric hint: valueOf ran
console.log(wallet + ""); // -> 2 — valueOf already returned a primitive
console.log(String(wallet)); // -> 2 dollars — string hint: toString ran`,
      },
      {
        heading: "== unwraps wrapper objects against primitives",
        text: "new String(\"\") creates a wrapper object. Against a primitive, == unwraps it and compares the inside — that is why \"\" == new String(\"\") is true. Two wrappers compared to each other are two objects: references compared, no unwrapping, false.",
        purpose: "Watch == unwrap one wrapper but refuse to unwrap two.",
        code: `var wrapped = new String("");

console.log("" == wrapped); // -> true — == unwrapped it to ""
console.log("" === wrapped); // -> false — === never converts
console.log(wrapped == new String("")); // -> false — two objects, references compared`,
      },
    ],

    starter: `// Exercise: classify(value1, value2)
// Return "strict" if === is true, "loose" if only == is true, else "none".
// Use only === and == — no other comparisons.

function classify(value1, value2) {
  // your code here
  return "none";
}

console.log(classify(5, "5"));
console.log(classify(5, 5));
console.log(classify(null, undefined));
console.log(classify(0, false));`,

    exercise:
      "Write classify(v1, v2) that returns \"strict\" when v1 === v2, \"loose\" when v1 == v2 (but not ===), and \"none\" otherwise. Use only == and === comparisons.",

    solutions: [
      {
        title: "Strict vs loose classifier",
        note: "null == undefined is true but null === undefined is false — the classic loose-equality trap.",
        code: `function classify(value1, value2) {
  if (value1 === value2) { return "strict"; }
  if (value1 == value2) { return "loose"; }
  return "none";
}

console.log(classify(5, "5")); // -> loose
console.log(classify(5, 5)); // -> strict
console.log(classify(null, undefined)); // -> loose
console.log(classify(0, false)); // -> loose`,

      },
      {
        title: "Object keys are strings",
        note: "Any object used as a key is converted via ToPrimitive, which for a plain object means String(obj) — \"[object Object]\".",
        code: `var obj = {};
var key = { name: "secret" };
obj[key] = 123;
console.log(obj["[object Object]"]); // 123
console.log(Object.keys(obj)); // ["[object Object]"]

var obj2 = {};
obj2[42] = "answer";
console.log(obj2["42"]); // "answer" — number keys become strings too`,

      },
    ],
    checklist: [
      "Use === instead of == to avoid coercion",
      "Remember + coerces to string when either side is a string",
      "Object keys are always strings (or Symbols)",
      "[] == ![] is true — both sides coerce to 0",
      "A number key like obj[42] is stored as obj[\"42\"]",
      "ToPrimitive calls valueOf first for +, toString for string contexts",
    ],
    realTalk:
      "Coercion is not a bug — it is the spec. The bug is forgetting it happens. === removes the guesswork, and knowing that object keys become strings explains why a[b] = 123 never uses b as the key.",
    quiz: [
      {
        q: "What does 5 == \"5\" return?",
        options: ["true", "false", "undefined", "A syntax error"],
        answer: 0,
        why: "== coerces the string \"5\" to the number 5 before comparing, so the result is true.",
        tests: "== coerces, === does not",
      },
      {
        q: "What does 5 === \"5\" return?",
        options: ["true", "false", "undefined", "A syntax error"],
        answer: 1,
        why: "=== does not coerce. Number and string are different types, so the result is false.",
        tests: "== coerces, === does not",
      },
      {
        q: "What key does obj[{ name: \"x\" }] = 1 store under?",
        options: ["\"[object Object]\"", "\"name\"", "42", "The object itself"],
        answer: 0,
        why: "Object keys are strings. The object key is converted to \"[object Object]\" via ToPrimitive.",
        tests: "Object keys are always strings",
      },
      {
        q: "What does wallet + \"\" return when wallet.valueOf() returns 2?",
        options: ["\"2\"", "\"[object Object]\"", "\"2 dollars\"", "2"],
        answer: 0,
        why: "The + operator uses the default hint, which tries valueOf first. It returns the primitive 2, so the concatenation gives \"2\".",
        tests: "ToPrimitive: valueOf first for +, toString first for strings",
      },
      {
        q: "What is new String(\"\") == new String(\"\")?",
        options: [
          "true — both wrap an empty string",
          "false — two objects are different references",
          "true — == always converts objects to strings",
          "A TypeError",
        ],
        answer: 1,
        why: "== only converts when one side is a primitive. When both sides are objects it compares references, and two separately created wrappers are different objects.",
        tests: "== unwraps wrapper objects against primitives",
      },
      {
        q: "NaN == NaN — what does the loosest comparison say?",
        options: [
          "false — NaN is unequal to everything, even loosely",
          "true — == coerces both sides to the same NaN",
          "undefined — the comparison is meaningless",
          "An error",
        ],
        answer: 0,
        why: "Coercion cannot save a comparison with NaN: the lesson 1 rule applies to == as well. Only value !== value detects it.",
        tests: "NaN is the number that is not equal to itself",
      },
      {
        q: "wallet + 1 runs valueOf. What is this inside valueOf?",
        options: [
          "wallet — the engine calls it as wallet.valueOf()",
          "The number 1",
          "undefined in sloppy mode",
          "The string result",
        ],
        answer: 0,
        why: "ToPrimitive calls the method through the object, so the call-site rule hands this = wallet. That is why this.dollars reads the real property.",
        tests: "this is decided by the call site",
      },
    ],
  },
  {
    id: 8,
    title: "Arrays Without Magic",
    goal: "Write the loops that map, filter and reduce hide.",
    tier: 0,
    sugarReplaces: ".map .filter .find .reduce, spread [...]",
    intro:
      "Every array method you have used is a loop plus a callback. Writing the loop by hand shows the allocation, the index, the early exit and the accumulator that the method hides — and appending is just one honest move: arr[arr.length] = value.",
    concepts: [
      {
        heading: "A new array starts empty and grows by index",
        text: "Building a result array is two moves: create [], then append with arr[arr.length] = value — length is always one past the last index, so assigning there appends. That is the real push, and it is the only append this course needs.",
        purpose: "Watch an empty array grow one honest index at a time.",
        code: `var doubled = [];
var arr = [1, 2, 3, 4];

for (var i = 0; i < arr.length; i = i + 1) {
  doubled[doubled.length] = arr[i] * 2;
}

console.log(doubled); // -> [2, 4, 6, 8]
console.log(doubled.length); // -> 4 — length grew with every write`,
      },
      {
        heading: "map is a loop that allocates a new array",
        text: "map's contract, written by hand: loop over every index, call the function with (value, index, array), and append the result to a new array of the same length. The input is untouched — the allocation is visible because you wrote it.",
        purpose: "Watch the callback receive value and index, and the input stay unchanged.",
        code: `function map(array, fn) {
  var out = [];
  for (var i = 0; i < array.length; i = i + 1) {
    out[out.length] = fn(array[i], i, array);
  }
  return out;
}

var names = ["ada", "grace"];
var tagged = map(names, function (name, index) {
  return index + ":" + name;
});

console.log(tagged); // -> ["0:ada", "1:grace"]
console.log(names); // -> ["ada", "grace"] — untouched`,
      },
      {
        heading: "filter is a loop with an if",
        text: "filter's contract: the same loop, but the callback decides whether the value enters the new array. No magic in what gets kept — the if does it, and skipping is just not appending.",
        purpose: "Watch the if decide membership while both arrays stay independent.",
        code: `function filter(array, fn) {
  var out = [];
  for (var i = 0; i < array.length; i = i + 1) {
    if (fn(array[i], i, array)) {
      out[out.length] = array[i];
    }
  }
  return out;
}

var kept = filter([1, 2, 3, 4], function (n) {
  return n > 2;
});

console.log(kept); // -> [3, 4]`,
      },
      {
        heading: "reduce carries an accumulator",
        text: "reduce's contract: start from an initial value, then for each element the callback receives the accumulator and the value, and returns the next accumulator. The final accumulator is the result — the loop just threads one value through.",
        purpose: "Watch one value travel through the loop, changing at every step.",
        code: `function reduce(array, fn, initial) {
  var acc = initial;
  for (var i = 0; i < array.length; i = i + 1) {
    acc = fn(acc, array[i], i, array);
  }
  return acc;
}

var total = reduce([1, 2, 3, 4], function (acc, n) {
  return acc + n;
}, 0);

console.log(total); // -> 10`,
      },
      {
        heading: "Early return is the exit a method hides",
        text: "A loop can stop the moment it finds what it needs — return from inside. That is how a hand-written indexOf works, and it is exactly the control a method that always walks the whole array never gives you.",
        purpose: "Watch the loop stop at the first match and return the index.",
        code: `function indexOf(array, value) {
  for (var i = 0; i < array.length; i = i + 1) {
    if (array[i] === value) {
      return i; // early exit — nothing after this runs
    }
  }
  return -1;
}

console.log(indexOf(["a", "b", "c"], "b")); // -> 1
console.log(indexOf(["a", "b", "c"], "z")); // -> -1 — the loop finished`,
        check: {
          q: "indexOf([\"a\", \"b\", \"c\"], \"b\") — how many comparisons run before the return?",
          options: ["Two — the loop exits at the first match","Three — the array is always fully walked","One — strings compare instantly","Zero — indexOf is built in"],
          answer: 0,
          why: "The early return fires when i is 1, after two comparisons. A full walk would run three — writing the loop makes the exit visible and controllable.",
        },
      },
    ],

    starter: `// Exercise: implement map, filter and reduce with for loops only.
// Do not call the built-in array methods.

function map(array, fn) {
  var out = [];
  // your loop here
  return out;
}

function filter(array, fn) {
  var out = [];
  // your loop here
  return out;
}

function reduce(array, fn, initial) {
  var acc = initial;
  // your loop here
  return acc;
}

console.log(map([1, 2, 3], function (x) { return x * 2; }));
console.log(filter([1, 2, 3, 4], function (x) { return x > 2; }));
console.log(reduce([1, 2, 3], function (acc, x) { return acc + x; }, 0));`,

    exercise:
      "Implement map, filter and reduce from scratch using only for(;;) and var. Pass value, index and the original array to the callbacks. Do not call the built-in higher-order methods.",
    solutions: [
      {
        title: "map, filter and reduce",
        note: "reduce calls the callback with the accumulator first, then the value, index and array, exactly like the built-in.",
        code: `function map(array, fn) {
  var out = [];
  for (var i = 0; i < array.length; i = i + 1) {
    out[out.length] = fn(array[i], i, array);
  }
  return out;
}

function filter(array, fn) {
  var out = [];
  for (var i = 0; i < array.length; i = i + 1) {
    if (fn(array[i], i, array)) {
      out[out.length] = array[i];
    }
  }
  return out;
}

function reduce(array, fn, initial) {
  var acc = initial;
  for (var i = 0; i < array.length; i = i + 1) {
    acc = fn(acc, array[i], i, array);
  }
  return acc;
}

console.log(map([1, 2, 3], function (x) { return x * 2; })); // -> [2, 4, 6]
console.log(filter([1, 2, 3, 4], function (x) { return x > 2; })); // -> [3, 4]
console.log(reduce([1, 2, 3, 4], function (acc, x) { return acc + x; }, 0)); // -> 10`,

      },
      {
        title: "Manual slice and indexOf",
        note: "Both are loops. slice copies a range; indexOf returns on the first match and -1 otherwise.",
        code: `function slice(array, start, end) {
  var out = [];
  var stop = end === undefined ? array.length : end;
  for (var i = start; i < stop; i = i + 1) {
    out[out.length] = array[i];
  }
  return out;
}

function indexOf(array, value) {
  for (var i = 0; i < array.length; i = i + 1) {
    if (array[i] === value) { return i; }
  }
  return -1;
}

console.log(slice([1, 2, 3, 4, 5], 1, 4)); // -> [2, 3, 4]
console.log(indexOf(["a", "b", "c"], "b")); // -> 1
console.log(indexOf(["a", "b", "c"], "z")); // -> -1`,
      },
    ],
    checklist: [
      "Write the loop yourself",
      "Append with array[array.length]",
      "Pass value, index and array to callbacks",
      "Return a new array when the input should not change",
      "Use an accumulator for reduce",
    ],
    realTalk:
      "Every array method you have used is the loop in this lesson plus a callback. Knowing the loop means you can reason about allocation and early exit instead of guessing.",
    quiz: [
      {
        q: "What does map return?",
        options: ["The original array", "A new array of the same length", "The last value", "undefined"],
        answer: 1,
        why: "map allocates a new array and writes the callback result at each index.",
        tests: "map is a loop that allocates a new array",
      },
      {
        q: "What does arr[arr.length] = x do?",
        options: ["Overwrites the last item", "Appends x", "Throws an error", "Removes the last item"],
        answer: 1,
        why: "The length is one past the last index, so assigning there appends and grows length.",
        tests: "A new array starts empty and grows by index",
      },
      {
        q: "Why write the loop manually?",
        options: ["It is always faster", "You can see the allocation and control the exit", "It makes code shorter", "Built-in methods are deprecated"],
        answer: 1,
        why: "The loop makes the work visible: how many passes, what is allocated, and when you stop.",
        tests: "Early return is the exit a method hides",
      },
      {
        q: "var copy = arr; (arr is an array). copy[0] = 99; What is arr[0]?",
        options: [
          "99 — = copied the reference, so two names share one array",
          "The old value — copy received a duplicate",
          "undefined — copy broke arr",
          "An error — arrays cannot be aliased",
        ],
        answer: 0,
        why: "Arrays are objects: = copied the reference, so copy and arr are two names for one array — the lesson 1 rule, now with brackets.",
        tests: "= copies the reference for objects and arrays",
      },
      {
        q: "var arr = []; arr.push(1) — where does push come from?",
        options: [
          "Array.prototype — reached through arr's prototype chain",
          "arr owns its own copy of push",
          "The global object",
          "push is syntax, not a function",
        ],
        answer: 0,
        why: "arr starts empty, yet push works: it lives on Array.prototype, shared by every array — the lesson 5 chain, with Array.prototype as the link.",
        tests: "Prototype methods are shared, not copied",
      },
    ],
  },
  {
    id: 9,
    title: "Global Pollution & Strict Mode",
    goal: "See how accidental globals are created, and how \"use strict\" fails fast.",
    tier: 1,
    sugarReplaces: "implicit global assignment, non-strict delete",
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
          q: "Under \"use strict\", what does greetign = {} do?",
          options: ["Creates a global object like before","Throws a ReferenceError at that line","Assigns to the nearest declared name","Silently does nothing"],
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

    starter: `// Exercise: write a strict-mode function that rejects accidental globals.
// It should assign to a declared variable only, and throw if given an undeclared target.

function safeSet(name, value) {
  'use strict';
  // your code here: assign to a declared variable, not a global
  return value;
}

var target;
safeSet("target", 42);
console.log(target);`,

    exercise:
      "Write safeSet that runs under 'use strict' and only assigns to declared variables. Show that an undeclared assignment would throw a ReferenceError instead of creating window.x.",
    solutions: [
      {
        title: "Strict mode rejects accidental globals",
        note: "With 'use strict', assigning to an undeclared identifier throws ReferenceError instead of silently creating a global.",
        code: `'use strict';

function safeSet(name, value) {
  // name is a string key; we only assign to declared variables below.
  var target;
  target = value;
  return target;
}

var result = safeSet("target", 42);
console.log(result); // -> 42

// This would throw in strict mode:
// undeclared = 99; // ReferenceError`,

      },
      {
        title: "Strict mode and delete",
        note: "In strict mode, delete on a non-configurable property throws; in sloppy mode it silently returns false.",
        code: `'use strict';

var obj = { x: 1 };
console.log(delete obj.x); // true
console.log(obj.x); // undefined

Object.defineProperty(obj, "y", { value: 2, configurable: false });
// delete obj.y; // TypeError in strict mode — cannot delete non-configurable`,

      },
    ],
    checklist: [
      "Put \"use strict\" at the top of files and functions",
      "Never assign to an undeclared identifier",
      "Declare every binding with var before assigning",
      "delete fails in strict mode on non-configurable properties",
      "Strict mode turns silent globals into loud ReferenceErrors",
    ],
    realTalk:
      "A typo like greetign = {} does not fail — it creates a global and your real greeting stays undefined. \"use strict\" makes the engine fail fast so you catch the mistake at the first line, not three screens later.",
    quiz: [
      {
        q: "What does y = 10 do in sloppy mode without var?",
        options: ["Throws an error", "Creates window.y", "Creates a local variable", "Does nothing"],
        answer: 1,
        why: "In sloppy mode, assigning to an undeclared identifier creates a property on the global object.",
        tests: "The typo becomes a real global",
      },
      {
        q: "What does \"use strict\" do to undeclared assignments?",
        options: ["Allows them", "Throws a ReferenceError", "Ignores them", "Creates a local variable"],
        answer: 1,
        why: "Strict mode forbids implicit globals — the assignment throws immediately.",
        tests: "\"use strict\" turns the silent global into an error",
      },
      {
        q: "What happens when you delete a non-configurable property in strict mode?",
        options: ["Returns true", "Returns false", "Throws a TypeError", "Does nothing"],
        answer: 2,
        why: "Strict mode makes delete throw on non-configurable properties instead of silently failing.",
        tests: "delete removes own properties — with strict limits",
      },
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
  },
  {
    id: 10,
    title: "Event Loop — Stack, WebAPI, Queue",
    goal: "Understand why setTimeout in a for(var) loop prints 3 3 3, and why First Third Second is the right order.",
    tier: 0,
    sugarReplaces: "setTimeout, promise microtasks (concept only)",
    intro:
      "JavaScript executes one stack at a time. Statements run in order, functions push and pop — and setTimeout never jumps the line: its callback is queued and waits until the stack is empty. The loop-and-timer surprises are all one rule plus one shared var binding.",
    concepts: [
      {
        heading: "JavaScript runs one stack at a time",
        text: "The engine executes one thing at a time: the call stack. Statements run top to bottom, functions push and pop, and nothing interleaves. Two console.log lines run in the order they appear, no matter what timers sit between them.",
        purpose: "Watch the timer's position in the code fail to change the print order.",
        code: `console.log("First");

setTimeout(function () {
  console.log("Second"); // queued, not run here
}, 0);

console.log("Third"); // runs before the queued callback`,
      },
      {
        heading: "setTimeout queues work for when the stack is empty",
        text: "setTimeout does not run the function after exactly 0ms. It hands the callback to the timer system, and when the stack empties, the event loop moves the callback onto the stack. The wait is until the stack is free — not a precise delay.",
        purpose: "Watch the queued callback land after all synchronous code, whatever the delay.",
        code: `console.log("start");

setTimeout(function () {
  console.log("queued — the stack was empty");
}, 0);

console.log("end");
// -> start
// -> end
// -> queued — the stack was empty`,
        check: {
          q: "When does a setTimeout(fn, 0) callback actually run?",
          options: ["After 0 milliseconds, precisely","When the call stack is empty","In parallel with the stack","Only on the next user click"],
          answer: 1,
          why: "The callback is queued and waits for the stack to empty. 0 is a minimum suggestion, not a precise schedule.",
        },
      },
      {
        heading: "var in a loop is one binding for every timer",
        text: "The for loop's var is created once, and the loop finishes before any timer runs. By queue time, i is 3 — and all three queued callbacks share that one binding, so they all print 3.",
        purpose: "Watch three queued callbacks all read the loop's final value.",
        code: `for (var i = 0; i < 3; i = i + 1) {
  setTimeout(function () {
    console.log("i = " + i);
  }, 0);
}
console.log("done");
// -> done
// -> i = 3
// -> i = 3
// -> i = 3 — one binding, read after the loop`,
      },
      {
        heading: "An IIFE freezes the value before queueing",
        text: "Capturing i with an immediately invoked function creates a fresh binding per iteration while the loop is still running. The timer's callback closes over its own j, so each queued print gets its own number.",
        purpose: "Watch three timers each deliver their own number.",
        code: `for (var i = 0; i < 3; i = i + 1) {
  (function (j) {
    setTimeout(function () {
      console.log("j = " + j);
    }, 0);
  })(i);
}
console.log("done");
// -> done
// -> j = 0
// -> j = 1
// -> j = 2`,
        check: {
          q: "Why does the IIFE version print 0, 1, 2 from the queue?",
          options: ["Each iteration froze its own j while the loop was still running","The timers fire in value order by luck","j re-reads i when the callback runs","setTimeout copies the closure"],
          answer: 0,
          why: "The IIFE runs during the loop, creating a fresh j per iteration. By queue time each callback has its own binding — the lesson 2 capture, applied to timers.",
        },
      },
    ],

    starter: `// Exercise: predict the order, then explain it.
// These three statements run in what order?

console.log("A");
setTimeout(function () { console.log("B"); }, 0);
console.log("C");

// Write your predicted order below:
// 1. ?
// 2. ?
// 3. ?`,

    exercise:
      "Predict the output order of the starter code. Then wrap a setTimeout in a for(var i) loop and explain why all three callbacks print the same i.",
    solutions: [
      {
        title: "Event loop order",
        note: "Synchronous code runs first, then macrotasks (timers) from the queue once the stack is empty.",
        code: `console.log("First"); // -> First

setTimeout(function () {
  console.log("Second"); // -> Second
}, 0);

console.log("Third"); // -> Third`,

      },
      {
        title: "setTimeout in for(var) — capture with IIFE",
        note: "Each IIFE call creates a fresh j binding, so each timer closure reads its own number instead of the shared i.",
        code: `for (var i = 0; i < 3; i = i + 1) {
  (function (j) {
    setTimeout(function () {
      console.log("i = " + j); // -> i = 0 / i = 1 / i = 2
    }, 0);
  })(i);
}

console.log("done"); // -> done
// Prints: done, then i = 0, i = 1, i = 2`,

      },
    ],
    checklist: [
      "JavaScript is single-threaded — one call stack",
      "setTimeout callbacks go to the task queue, not the stack",
      "The queue drains only when the stack is empty",
      "var in a for loop is one binding shared by all iterations",
      "Capture loop values with an IIFE when using timers",
    ],
    realTalk:
      "The timer does not \"fire after 0ms\". It fires when the stack is empty and the queue turns it into a task. By then the loop is long finished and var i is already 3. The same principle explains First Third Second: synchronous first, queued second.",
    quiz: [
      {
        q: "What prints first: console.log before or after setTimeout?",
        options: ["setTimeout callback first", "Synchronous console.log first", "They print together", "Random order"],
        answer: 1,
        why: "Synchronous code always runs before queued timer callbacks.",
        tests: "JavaScript runs one stack at a time",
      },
      {
        q: "Why do all three setTimeout callbacks in for(var i) print 3?",
        options: ["Each captures its own i", "var i is one shared binding, finished at 3", "setTimeout delays them differently", "The engine optimizes them away"],
        answer: 1,
        why: "var is function-scoped. All three closures read the same i, which is 3 when the loop ends.",
        tests: "var in a loop is one binding for every timer",
      },
      {
        q: "When does a setTimeout(..., 0) callback run?",
        options: ["Immediately", "After 0ms exactly", "After the stack empties", "Never"],
        answer: 2,
        why: "The callback is queued and runs when the call stack is empty — not at a precise time.",
        tests: "setTimeout queues work for when the stack is empty",
      },
      {
        q: "If a queued callback assigns summary = i (no var anywhere), where does summary land?",
        options: [
          "On the global object — assignments walk out of any function, queued or not",
          "Inside the timer's private scope",
          "Into the task queue",
          "Nowhere — queued code cannot assign",
        ],
        answer: 0,
        why: "Queued or not, the callback is a function and the assignment rule from lesson 1 applies: no var means the global object.",
        tests: "= without var creates a global",
      },
    ],
  },
  {
    id: 11,
    title: "Async Without Sugar",
    goal: "Use callbacks first, then raw Promises, with no async or await.",
    tier: 0,
    sugarReplaces: "async/await, implicit promise wrapping",
    intro:
      "Asynchronous code is a function you hand to code that runs later. A promise makes that hand-off composable: an object holding a state and a list of reactions, built by an executor that runs immediately. then chains those reactions — and async/await is a different spelling of exactly that.",
    concepts: [
      {
        heading: "A callback is the function you hand to later code",
        text: "Before promises, async meant a callback argument: the function runs later, when the operation finishes. The convention is (err, value) — err carries the failure, and the callback checks it first.",
        purpose: "Watch the callback fire after the sync code, carrying err and value.",
        code: `function fetchName(callback) {
  setTimeout(function () {
    callback(null, "ada");
  }, 20);
}

console.log("before");
fetchName(function (err, value) {
  if (err) {
    console.log("failed");
    return;
  }
  console.log("got " + value);
});
console.log("after");
// -> before
// -> after
// -> got ada`,
      },
      {
        heading: "A promise is an object with a state machine inside",
        text: "new Promise(executor) runs the executor immediately with two functions: resolve marks the state fulfilled and remembers the value; reject marks it rejected. Nothing else happens yet — the promise just holds a state and waits.",
        purpose: "Watch the executor run right away, and the reaction run after the sync code.",
        code: `var p = new Promise(function (resolve, reject) {
  console.log("executor runs now"); // synchronous — not later
  resolve("ready");
});

console.log("after construction");

p.then(function (value) {
  console.log("resolved with " + value);
});
// -> executor runs now
// -> after construction
// -> resolved with ready — the reaction ran after the sync code`,
        check: {
          q: "When does the promise executor run?",
          options: ["Immediately, during new Promise","When then is first called","When resolve is defined","After the microtask queue drains"],
          answer: 0,
          why: "The executor is called synchronously by the constructor — the logging order proves it. Only the reactions (then callbacks) wait.",
        },
      },
      {
        heading: "then returns a new promise",
        text: "then registers a reaction and returns a NEW promise — never the same one. The returned promise settles when the callback finishes: with the returned value, or with a returned promise's outcome. That hand-off is the entire chaining mechanism.",
        purpose: "Watch two different promises pass one value down a chain.",
        code: `var p1 = Promise.resolve("done");
var p2 = p1.then(function (value) {
  return value + "!";
});

console.log(p1 === p2); // -> false — then built a new promise
p2.then(function (value) {
  console.log(value); // -> done!
});
// -> false
// -> done!`,
      },
      {
        heading: "catch is then with only a failure handler",
        text: "promise.catch(fn) is exactly promise.then(null, fn): a rejection reaction with no success reaction. Either spelling returns a new promise, so a chain can end with catch and still be built on then.",
        purpose: "Watch a rejected promise land in catch — spelled both ways.",
        code: `var broken = new Promise(function (resolve, reject) {
  reject("boom");
});

broken.then(null, function (reason) {
  console.log("then caught: " + reason);
});

broken.catch(function (reason) {
  console.log("catch caught: " + reason);
});
// -> then caught: boom
// -> catch caught: boom`,
      },
      {
        heading: "Returning a promise from then makes the chain wait",
        text: "If a then callback returns a promise, the chain's next step waits for that promise to settle before running. This is how sequential async steps are built without async/await — each return hands the waiting job to the next then.",
        purpose: "Watch two delays run in order, one per then.",
        code: `function delay(ms, label) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(label);
    }, ms);
  });
}

delay(20, "first").then(function (value) {
  console.log(value + " finished");
  return delay(10, "second");
}).then(function (value) {
  console.log(value + " finished");
});
// -> first finished
// -> second finished`,
        check: {
          q: "What makes the second then wait for the second delay?",
          options: ["The first callback returned delay's promise, so the chain settles with it","then adds a fixed 10ms wait","The second then polls the first promise","Delays always run in declaration order"],
          answer: 0,
          why: "A then callback that returns a promise hands that promise's outcome to the next then. The chain waits — that is the whole mechanism await was built on.",
        },
      },
    ],

    starter: `// Exercise: promisify a callback-style function.
// read(name, callback) calls callback(err, value).

function promisify(fn) {
  return function () {
    // your code here: return a new Promise
  };
}

function read(name, callback) {
  setTimeout(function () {
    if (name === "missing") {
      callback(new Error("not found"));
      return;
    }
    callback(null, name + "=on");
  }, 40);
}

var readPromise = promisify(read);
readPromise("theme").then(function (value) {
  console.log(value);
});`,

    exercise:
      "Build promisify: it takes an (arg, callback) function and returns a function that returns a Promise. Then chain two Promises without async/await.",
    solutions: [
      {
        title: "promisify",
        note: "The callback appended to the argument list is the bridge between the callback world and the promise world.",
        code: `function promisify(fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
      args[args.length] = function (err, value) {
        if (err) { reject(err); return; }
        resolve(value);
      };
      fn.apply(null, args);
    });
  };
}

function read(name, callback) {
  setTimeout(function () {
    if (name === "missing") { callback(new Error("not found")); return; }
    callback(null, name + "=on");
  }, 40);
}

var readPromise = promisify(read);
readPromise("theme").then(function (value) {
  console.log(value); // -> theme=on
  return readPromise("missing");
}).then(function (value) {
  console.log(value);
}).catch(function (err) {
  console.log("caught: " + err.message); // -> caught: not found
});`,

      },
      {
        title: "Chain two promises",
        note: "Returning a promise from then makes the next then wait for it. That is the whole mechanism await was built on.",
        code: `function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(ms); }, ms);
  });
}

delay(30).then(function (ms) {
  console.log("first " + ms); // -> first 30
  return delay(20);
}).then(function (ms) {
  console.log("second " + ms); // -> second 20
  return "done";
}).then(function (value) {
  console.log(value); // -> done
});`,

      },
    ],
    checklist: [
      "Start with a callback signature (err, value)",
      "Construct promises with new Promise(executor)",
      "Return a value from then to keep the chain alive",
      "Use catch instead of a second then handler",
      "Never use async or await in this course",
    ],
    realTalk:
      "A promise is not magic and it is not a thread. It is an object with a state (pending, fulfilled, rejected) and a list of reactions that run as microtasks. async/await is just a different spelling of .then chains.",
    quiz: [
      {
        q: "What does then return?",
        options: ["The resolved value", "A new promise", "The original promise", "undefined"],
        answer: 1,
        why: "then always returns a new promise, which is what allows chaining.",
        tests: "then returns a new promise",
      },
      {
        q: "What is catch(fn) equivalent to?",
        options: ["then(fn, fn)", "then(null, fn)", "new Promise(fn)", "finally(fn)"],
        answer: 1,
        why: "catch is a convenience wrapper around a rejected handler in then.",
        tests: "catch is then with only a failure handler",
      },
      {
        q: "What does async/await actually do?",
        options: ["Runs code on another thread", "Wraps a promise and awaits then callbacks", "Removes callbacks from the engine", "Creates a callback queue"],
        answer: 1,
        why: "async makes the function return a promise; await pauses that async function until the promise settles.",
        tests: "Returning a promise from then makes the chain wait",
      },
      {
        q: "Sync code queues a promise reaction and a setTimeout callback. Which runs first?",
        options: [
          "The promise reaction — reactions wait closer to the stack than timer tasks",
          "The timer — setTimeout has priority",
          "Whichever was queued first",
          "They run together",
        ],
        answer: 0,
        why: "Both wait for the stack to empty, but promise reactions are microtasks and run before timer tasks. The stack-first rule stands; the queue has layers.",
        tests: "setTimeout queues work for when the stack is empty",
      },
    ],
  },
  {
    id: 12,
    title: "Generators & Iterators — Manual State Machines",
    goal: "See that function* hides a state machine, yield suspends execution, and .next() returns { value, done }.",
    tier: 0,
    sugarReplaces: "function*, yield, .next(), for...of iterator protocol",
    intro:
      "An iterator is the smallest possible protocol: an object with a next method returning { value, done }. Everything called iteration — generators, for...of, spread — compiles down to that method being called until done. Writing the machine by hand shows there is nothing hidden: a closure remembers the position, and Symbol.iterator is the door loop syntax knocks on.",
    concepts: [
      {
        heading: "An iterator is an object with a next method",
        text: "The whole protocol is one method: next() returns { value, done }. value is the current item; done signals the end. Any object with such a next is an iterator — no special class required.",
        purpose: "Watch a hand-written next deliver 0, then 1, then done.",
        code: `var it = {
  index: 0,
  next: function () {
    if (this.index < 2) {
      this.index = this.index + 1;
      return { value: this.index - 1, done: false };
    }
    return { value: undefined, done: true };
  }
};

console.log(it.next()); // -> { value: 0, done: false }
console.log(it.next()); // -> { value: 1, done: false }
console.log(it.next()); // -> { value: undefined, done: true }`,
      },
      {
        heading: "State lives in a closure between calls",
        text: "Between next() calls the iterator must remember where it was. The hand-written way is a closure: the factory creates the state variables, and next reads and writes them. Each factory call produces an independent machine.",
        purpose: "Watch two iterators keep separate positions.",
        code: `function makeIterator() {
  var position = 0;
  return {
    next: function () {
      position = position + 1;
      return { value: position, done: false };
    }
  };
}

var a = makeIterator();
var b = makeIterator();
a.next();
a.next();
console.log(a.next().value); // -> 3 — a's own position
console.log(b.next().value); // -> 1 — b never touched`,
        check: {
          q: "What remembers an iterator's position between .next() calls?",
          options: ["The closure — next reads and writes the factory's variables","The engine suspends the function","A cursor stored on the object's prototype","Nothing — each call restarts"],
          answer: 0,
          why: "position lives in makeIterator's scope; every next() call updates it. A generator's suspended frame replaces the closure, but the remembering job is identical.",
        },
      },
      {
        heading: "function* is sugar for the same machine",
        text: "function* and yield do nothing the hand-written machine cannot: the engine rewrites the body into a state machine, and calling the generator returns exactly such an iterator. .next() runs the body to the next yield, then suspends — the sugar exists so you never write the resume bookkeeping.",
        purpose: "Watch the generator produce the same result shape, with no hand-written state.",
        code: `function* numbers() {
  yield 0;
  yield 1;
}

var it = numbers();
console.log(it.next()); // -> { value: 0, done: false }
console.log(it.next()); // -> { value: 1, done: false }
console.log(it.next()); // -> { value: undefined, done: true }`,
      },
      {
        heading: "Symbol.iterator makes an object for...of-able",
        text: "for...of asks one question: does the object have a method under the well-known key Symbol.iterator? That method must return an iterator — returning this if the object is one itself. It is the only bridge between your objects and loop syntax.",
        purpose: "Watch for...of's lookup key handed to a hand-built iterator.",
        code: `var counter = {
  count: 0,
  next: function () {
    this.count = this.count + 1;
    if (this.count <= 3) {
      return { value: this.count, done: false };
    }
    return { value: undefined, done: true };
  }
};
counter[Symbol.iterator] = function () {
  return this; // the object itself is the iterator
};

// for...of looks up exactly this key, then calls next until done:
var iter = counter[Symbol.iterator]();
console.log(iter.next().value); // -> 1
console.log(iter.next().value); // -> 2
// for (var n of counter) would now collect 1, 2, 3`,
      },
      {
        heading: "An infinite iterator never reaches done",
        text: "Nothing in the protocol requires done: an id generator can hand out values forever. The consumer decides when to stop pulling — which is why infinite generators are safe as long as nothing walks them blindly.",
        purpose: "Watch three pulls from a machine that never says done.",
        code: `function idGenerator() {
  var n = 0;
  return {
    next: function () {
      n = n + 1;
      return { value: n, done: false }; // done never arrives
    }
  };
}

var ids = idGenerator();
console.log(ids.next().value); // -> 1
console.log(ids.next().value); // -> 2
console.log(ids.next().value); // -> 3`,
      },
    ],

    starter: `// Exercise: build a manual generator for 0, 1, 2.
// It should return { value, done } from next() and stop after 2.

function makeThree() {
  // your state machine here
  return {
    next: function () {
      return { value: undefined, done: true };
    }
  };
}

var it = makeThree();
console.log(it.next());
console.log(it.next());
console.log(it.next());
console.log(it.next());`,

    exercise:
      "Build makeThree() that returns an iterator yielding 0, 1, 2 then done. Use only var, function, and a closure-based state machine. Do not use function* or yield.",

    solutions: [
      {
        title: "Manual generator for 0, 1, 2",
        note: "The state variable lives in the closure between .next() calls, exactly like a generator's suspended frame.",
        code: `function makeThree() {
  var state = "start";
  var value = 0;
  return {
    next: function () {
      if (state === "start") {
        state = "running";
        return { value: 0, done: false };
      }
      if (state === "running" && value === 0) {
        value = 1;
        return { value: 1, done: false };
      }
      if (state === "running" && value === 1) {
        value = 2;
        return { value: 2, done: false };
      }
      state = "done";
      return { value: undefined, done: true };
    }
  };
}

var it = makeThree();
console.log(it.next()); // -> { value: 0, done: false }
console.log(it.next()); // -> { value: 1, done: false }
console.log(it.next()); // -> { value: 2, done: false }
console.log(it.next()); // -> { value: undefined, done: true }`,

      },
      {
        title: "Manual id generator (infinite)",
        note: "A while(true) generator is just a state machine that never reaches done.",
        code: `function idGenerator() {
  var state = "start";
  var n = 0;
  return {
    next: function () {
      if (state === "start") {
        state = "running";
      }
      var current = n;
      n = n + 1;
      return { value: current, done: false };
    }
  };
}

var ids = idGenerator();
console.log(ids.next()); // -> { value: 0, done: false }
console.log(ids.next()); // -> { value: 1, done: false }
console.log(ids.next()); // -> { value: 2, done: false }`,

      },
    ],
    checklist: [
      "function* returns an iterator, it does not run the body yet",
      ".next() runs the body up to the next yield, then suspends",
      ".next() always returns { value, done }",
      "for...of calls .next() until done is true",
      "All generator state can be written by hand with a closure and a state variable",
      "Symbol.iterator is the well-known key that for...of looks up",
    ],
    realTalk:
      "Generators look like magic, but they are just a compiler trick: the engine turns function* into a state machine and stores your locals on that machine. Writing it by hand with a closure and a switch shows there is nothing hidden — just variables and an if chain.",
    quiz: [
      {
        q: "What does .next() return from a generator iterator?",
        options: ["The yielded value directly", "{ value, done }", "A promise", "undefined"],
        answer: 1,
        why: "The iterator protocol always returns an object { value, done }, never the bare value.",
        tests: "An iterator is an object with a next method",
      },
      {
        q: "When does a generator function body start running?",
        options: ["When the function is called", "When .next() is first called", "When for...of starts", "Immediately on definition"],
        answer: 1,
        why: "Calling a generator function only creates the iterator. The body runs on the first .next().",
        tests: "function* is sugar for the same machine",
      },
      {
        q: "What does done: true mean?",
        options: ["The generator threw an error", "The generator has no more values", "The generator is paused", "The generator is infinite"],
        answer: 1,
        why: "done: true signals the end of iteration; value is typically undefined then.",
        tests: "An iterator is an object with a next method",
      },
      {
        q: "Which property makes an object consumable by for...of?",
        options: ["next", "done", "Symbol.iterator", "for"],
        answer: 2,
        why: "for...of looks up the well-known Symbol.iterator key and calls it to get an iterator — the object with a next method you built by hand.",
        tests: "Symbol.iterator makes an object for...of-able",
      },
      {
        q: "What lesson 2 mechanism lets the manual iterator remember its position between .next() calls?",
        options: [
          "A closure over the factory's state variables",
          "A global variable",
          "The object's prototype",
          "localStorage",
        ],
        answer: 0,
        why: "makeIterator's scope holds position; each next() closes over it and updates it. The same binding survival as the lesson 2 counter.",
        tests: "Closures keep the binding alive",
      },
      {
        q: "var twin = it; (it is an iterator). twin.next() — what happens to it's position?",
        options: [
          "It advances too — = copied the reference; one iterator, two names",
          "Nothing — twin got a copy",
          "The position resets",
          "An error — iterators cannot be aliased",
        ],
        answer: 0,
        why: "The iterator is an object, so = copied the reference. twin.next() and it.next() pull from the same position — two names cannot make two machines.",
        tests: "= copies the reference for objects and arrays",
      },
    ],
  },
  {
    id: 13,
    title: "Building Real Things — EventEmitter, Manual Promise, IIFE Module",
    goal: "Build an EventEmitter with prototype methods, a Promise from scratch, and an IIFE module — all without class or import.",
    tier: 0,
    sugarReplaces: "class EventEmitter, extends, async/await, import/export",
    intro:
      "The capstone: an EventEmitter and a promise built from the primitives the whole course taught. The constructor owns storage, the prototype owns methods, apply forwards arguments, closures remember state, and a promise is just a one-way state machine with a reaction list. Nothing here is new — it is everything, assembled.",
    concepts: [
      {
        heading: "The constructor owns storage; the prototype owns methods",
        text: "EventEmitter starts with the split every prototype lesson teaches: this.events = {} in the constructor gives each emitter its own listener map, while on, off and emit live on the prototype — one shared copy for all emitters.",
        purpose: "Watch two emitters keep separate listener maps through shared methods.",
        code: `function Emitter() {
  this.events = {};
}
Emitter.prototype.on = function (event, listener) {
  var list = this.events[event];
  if (typeof list !== "object") {
    list = [];
    this.events[event] = list;
  }
  list[list.length] = listener;
  return this;
};

var a = new Emitter();
var b = new Emitter();
a.on("ping", function () {});
console.log(a.events.ping.length); // -> 1
console.log(b.events.ping); // -> undefined — b has its own map`,
      },
      {
        heading: "emit forwards arguments with apply",
        text: "emit receives the extra arguments inside arguments — the array-like from lesson 3. slice.call grabs everything after the event name, and apply spreads it into each listener. apply exists for exactly this job.",
        purpose: "Watch three extra arguments reach a listener intact.",
        code: `function Emitter() {
  this.events = {};
}
Emitter.prototype.on = function (event, listener) {
  var list = this.events[event];
  if (typeof list !== "object") { list = []; this.events[event] = list; }
  list[list.length] = listener;
};
Emitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1); // drop the event name
  var listeners = this.events[event];
  if (typeof listeners !== "object") { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args); // spread into each listener
  }
  return true;
};

var ee = new Emitter();
ee.on("order", function (item, count, note) {
  console.log(item + " x" + count + " (" + note + ")");
});
ee.emit("order", "coffee", 2, "urgent"); // -> coffee x2 (urgent)`,
      },
      {
        heading: "off rebuilds the list instead of splicing",
        text: "Removing while iterating shifts indexes under your feet. off avoids the whole problem by building a next array with every listener that is NOT the one being removed, then swapping it in. Removal becomes one visible pass.",
        purpose: "Watch removal build a new list and leave the original untouched.",
        code: `function keepNot(list, removed) {
  var next = [];
  for (var i = 0; i < list.length; i = i + 1) {
    if (list[i] !== removed) {
      next[next.length] = list[i];
    }
  }
  return next;
}

var listeners = [1, 2, 3];
console.log(keepNot(listeners, 2)); // -> [1, 3]
console.log(listeners); // -> [1, 2, 3] — rebuilt, not mutated`,
      },
      {
        heading: "once registers a wrapper that removes itself",
        text: "once cannot know the future — so it registers a wrapper instead of the listener. The wrapper runs, calls off with its own reference to remove itself, then invokes the real listener. Self-removal needs a reference to itself: the wrapper has one.",
        purpose: "Watch the listener fire exactly once, then the list drain to empty.",
        code: `var bus = {
  listeners: [],
  run: function () {
    for (var i = 0; i < this.listeners.length; i = i + 1) { this.listeners[i](); }
  },
  on: function (fn) { this.listeners[this.listeners.length] = fn; },
  off: function (fn) {
    var next = [];
    for (var i = 0; i < this.listeners.length; i = i + 1) {
      if (this.listeners[i] !== fn) { next[next.length] = this.listeners[i]; }
    }
    this.listeners = next;
  },
  once: function (fn) {
    var self = this;
    var wrapper = function () { self.off(wrapper); fn(); };
    this.on(wrapper); // register the wrapper, not the listener
  }
};

bus.once(function () { console.log("only once"); });
bus.run();
bus.run();
console.log(bus.listeners.length); // -> 0 — the wrapper removed itself
// -> only once`,
        check: {
          q: "Why does once register wrapper instead of fn?",
          options: ["The wrapper can remove itself by name before calling fn — self-removal needs a reference to itself","Wrappers run faster","fn cannot be stored in arrays","To prevent other listeners from being called"],
          answer: 0,
          why: "off needs the exact reference to remove. Since the wrapper holds its own reference, it can take itself off the list and then invoke the real listener — exactly once.",
        },
      },
      {
        heading: "A manual promise: state, reactions, resolve",
        text: "Strip a promise to its engine: a state (\"pending\" or \"fulfilled\"), a stored value, and resolve — a function that flips the state once and remembers the value. then either waits in the reaction list or reads the stored value. Everything else grows from these pieces.",
        purpose: "Watch the state flip exactly once and the reaction read the stored value.",
        code: `function TinyPromise(executor) {
  var state = "pending";
  var value = null;
  var reactions = [];

  function resolve(result) {
    if (state !== "pending") return; // resolve wins once, forever
    state = "fulfilled";
    value = result;
    for (var i = 0; i < reactions.length; i = i + 1) {
      reactions[i](value);
    }
  }

  this.then = function (onFulfilled) {
    if (state === "fulfilled") {
      onFulfilled(value);
    } else {
      reactions[reactions.length] = onFulfilled;
    }
  };

  executor(resolve);
}

var p = new TinyPromise(function (resolve) {
  resolve("tiny");
  resolve("ignored"); // second resolve is a no-op
});

p.then(function (value) {
  console.log(value); // -> tiny
});`,
        check: {
          q: "What does the second resolve(\"ignored\") do?",
          options: ["Nothing — the state already left pending, and resolve wins once","Overwrites the value with \"ignored\"","Throws an error","Re-runs all reactions"],
          answer: 0,
          why: "The guard state !== \"pending\" makes resolve one-way: first call wins. That one-way state is what makes promises predictable.",
        },
      },
      {
        heading: "try marks the risk; catch recovers; finally always runs",
        text: "try wraps the risky call. catch receives whatever was thrown and turns it into a controlled response. finally runs no matter how the try block exited — success, caught error, even a return in flight. Custom error types are plain constructors with Error.prototype as their prototype.",
        purpose: "Watch three inputs take three paths — and finally run on all of them.",
        code: `function ValidationError(message) {
  this.name = "ValidationError";
  this.message = message;
}
ValidationError.prototype = Object.create(Error.prototype);

function parseAge(raw) {
  var value = Number(raw);
  if (value !== value) {
    throw new ValidationError("not a number: " + raw);
  }
  if (value < 0) {
    throw new RangeError("negative: " + value);
  }
  return value;
}

function readAge(raw) {
  try {
    console.log("parsed " + parseAge(raw));
  } catch (err) {
    console.log(err.name + ": " + err.message);
  } finally {
    console.log("finished with " + raw);
  }
}

readAge("42");
readAge("abc");
readAge("-3");
// -> parsed 42
// -> finished with 42
// -> ValidationError: not a number: abc
// -> finished with abc
// -> RangeError: negative: -3
// -> finished with -3`,
      },
    ],

    starter: `// Exercise: add once(event, fn) to EventEmitter.
// The listener runs exactly once, then removes itself.

function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener) {
  if (typeof this.events[event] !== "object") {
    this.events[event] = [];
  }
  this.events[event][this.events[event].length] = listener;
  return this;
};

EventEmitter.prototype.off = function (event, listener) {
  if (typeof this.events[event] !== "object") { return this; }
  var listeners = this.events[event];
  var next = [];
  for (var i = 0; i < listeners.length; i = i + 1) {
    if (listeners[i] !== listener) { next[next.length] = listeners[i]; }
  }
  this.events[event] = next;
  return this;
};

EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.events[event];
  if (typeof listeners !== "object") { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args);
  }
  return true;
};

EventEmitter.prototype.once = function (event, listener) {
  // your wrapper here
  return this;
};

var ee = new EventEmitter();
ee.once("ready", function (value) {
  console.log("once " + value);
});
ee.emit("ready", 1);
ee.emit("ready", 2);`,

    exercise:
      "Extend EventEmitter with once(event, fn) that removes itself after the first call. Use prototypes and a closure wrapper.",
    solutions: [
      {
        title: "once with a self-removing wrapper",
        note: "The wrapper is registered, not the original listener. That is why off can find and remove it before invoking the real function.",
        code: `function EventEmitter() {
  this.events = {};
}
EventEmitter.prototype.on = function (event, listener) {
  var list = this.events[event];
  if (typeof list !== "object") { list = []; this.events[event] = list; }
  list[list.length] = listener;
  return this;
};
EventEmitter.prototype.off = function (event, listener) {
  var current = this.events[event];
  if (typeof current !== "object") { return this; }
  var next = [];
  for (var i = 0; i < current.length; i = i + 1) {
    if (current[i] !== listener) { next[next.length] = current[i]; }
  }
  this.events[event] = next;
  return this;
};
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.events[event];
  if (typeof listeners !== "object") { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args);
  }
  return true;
};

EventEmitter.prototype.once = function (event, listener) {
  var self = this;
  var wrapper = function () {
    self.off(event, wrapper);
    listener.apply(self, arguments);
  };
  this.on(event, wrapper);
  return this;
};

var ee = new EventEmitter();
ee.once("ready", function (value) {
  console.log("once " + value); // -> once 1
});
ee.emit("ready", 1);
ee.emit("ready", 2);
ee.emit("ready", 3);
console.log(ee.events.ready.length); // -> 0`,

      },
      {
        title: "Manual Promise from scratch",
        note: "A Promise is an object with a state and a reaction list. The executor runs immediately; resolve/reject change state and queue reactions.",
        code: `function ManualPromise(executor) {
  var self = this;
  self.state = "pending";
  self.value = undefined;
  self.reactions = [];

  function resolve(value) {
    if (self.state !== "pending") return;
    self.state = "fulfilled";
    self.value = value;
    runReactions();
  }

  function reject(reason) {
    if (self.state !== "pending") return;
    self.state = "rejected";
    self.value = reason;
    runReactions();
  }

  function runReactions() {
    for (var i = 0; i < self.reactions.length; i = i + 1) {
      var reaction = self.reactions[i];
      if (self.state === "fulfilled") {
        reaction.onFulfilled(self.value);
      } else if (self.state === "rejected") {
        reaction.onRejected(self.value);
      }
    }
  }

  this.then = function (onFulfilled, onRejected) {
    return new ManualPromise(function (resolve, reject) {
      if (self.state === "fulfilled") {
        setTimeout(function () { runHandler(onFulfilled, resolve, reject, self.value); }, 0);
      } else if (self.state === "rejected") {
        setTimeout(function () { runHandler(onRejected, resolve, reject, self.value); }, 0);
      } else {
        self.reactions[self.reactions.length] = { onFulfilled: onFulfilled, onRejected: onRejected, resolve: resolve, reject: reject };
      }
    });
  };

  function runHandler(handler, resolve, reject, value) {
    var result;
    try {
      result = handler(value);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  }

  executor(resolve, reject);
}

var p = new ManualPromise(function (resolve) {
  setTimeout(function () { resolve("manual"); }, 20);
});
p.then(function (v) { console.log("got " + v); });`,

      },
      {
        title: "try/catch/finally and custom errors",
        note: "A constructor inheriting from Error.prototype gives typed errors without class syntax; finally runs no matter what.",
        code: `function ValidationError(message) {
  this.name = "ValidationError";
  this.message = message;
}
ValidationError.prototype = Object.create(Error.prototype);

function parseAge(raw) {
  var value = Number(raw);
  if (value !== value) {
    throw new ValidationError("not a number: " + raw);
  }
  if (value < 0) {
    throw new RangeError("age cannot be negative: " + value);
  }
  return value;
}

function readAge(raw) {
  try {
    console.log("parsed " + parseAge(raw)); // -> parsed 42
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log("bad input: " + err.message); // -> bad input: not a number: abc
    } else {
      console.log(err.name + ": " + err.message); // -> RangeError: age cannot be negative: -3
    }
  } finally {
    console.log("finished with " + raw); // -> finished with 42 / finished with abc / finished with -3
  }
}

readAge("42");
readAge("abc");
readAge("-3");`,

      },
    ],
    checklist: [
      "Let the constructor own the storage",
      "Put every method on the prototype",
      "Forward emit arguments with apply",
      "Rebuild the listener array in off",
      "Register the wrapper, not the original, in once",
      "Build a Promise with executor, resolve, reject and reaction list",
      "throw fails fast, catch recovers, finally always runs",
    ],
    realTalk:
      "Node's EventEmitter has more methods and edge cases, but the core is exactly this lesson: an object of arrays and a loop that applies each listener. A Promise is the same machinery — state, reactions, resolve/reject — without the async keyword.",
    quiz: [
      {
        q: "How does emit forward extra arguments?",
        options: ["With arguments.slice", "With Array.prototype.slice.call(arguments, 1) and apply", "With rest parameters", "It cannot"],
        answer: 1,
        why: "arguments is array-like. slice.call converts the tail to an array, and apply spreads it into each listener.",
        tests: "emit forwards arguments with apply",
      },
      {
        q: "Why does off build a new array?",
        options: ["It is required by the engine", "To avoid mutating while iterating and keep the logic explicit", "To sort listeners", "To clear all events"],
        answer: 1,
        why: "Rebuilding keeps the removal visible and avoids index-shifting bugs while looping.",
        tests: "off rebuilds the list instead of splicing",
      },
      {
        q: "What does once register?",
        options: ["The original listener", "A wrapper that removes itself then calls the listener", "A copy of the emitter", "A promise"],
        answer: 1,
        why: "The wrapper has a reference to the emitter and to itself, so it can off(event, wrapper) before the real call.",
        tests: "once registers a wrapper that removes itself",
      },
      {
        q: "Which block runs no matter how the try block exits?",
        options: ["catch", "finally", "throw", "then"],
        answer: 1,
        why: "finally always runs — on success, on a caught error, and even while a return is in flight.",
        tests: "try marks the risk; catch recovers; finally always runs",
      },
      {
        q: "Inside bus.once's wrapper, why call self.off(wrapper) instead of this.off(wrapper)?",
        options: [
          "The wrapper runs as a plain call — this would not be the bus; self was captured while it was correct",
          "this is undefined inside object methods",
          "off only accepts captured references",
          "self is faster than this",
        ],
        answer: 0,
        why: "The wrapper is invoked as a plain function, so its this would have no home. var self = this froze the bus reference while the method call was still active — the lesson 4 capture pattern.",
        tests: "var self = this keeps the call site's this",
      },
      {
        q: "parseAge uses value !== value to detect Number(\"abc\") because...",
        options: [
          "Number(\"abc\") is NaN, and NaN is the only value unequal to itself",
          "value is a string",
          "!== compares more strictly than !=",
          "Number() returns undefined on failure",
        ],
        answer: 0,
        why: "Number(\"abc\") produces NaN, and the lesson 1 rule applies: NaN fails every equality check including against itself. The self-check is the only reliable detector.",
        tests: "NaN is the number that is not equal to itself",
      },
    ],
  },
  {
    id: 14,
    title: "Shallow Copy & Deep Copy — Same Shell vs New Shell",
    goal: "See that = shares the shell, shallow copy copies only the shell, and deep copy clones every branch.",
    tier: 0,
    sugarReplaces: "let b = a, {...a}, structuredClone(a)",
    intro:
      "Assigning an object never copies it — it copies the reference, so both names hold one shell. A shallow copy builds a new shell but shares every branch inside. A deep copy recurses until nothing is shared. The shell analogy makes all three permanent: two names on one shell, a new shell with old branches, or a new shell with new branches.",
    concepts: [
      {
        heading: "= shares the shell",
        text: "Assigning an object copies the reference: both names point at one shell. Change through either name and the other sees it — there is no such thing as a copy until you explicitly build one.",
        purpose: "Watch one rename flow through both names — one shell.",
        code: `var original = { name: "Ada", tags: ["dev", "js"] };
var alias = original;

alias.name = "Grace";
console.log(original.name); // -> Grace — same shell, changed through either name
console.log(alias === original); // -> true — still one object`,
        diagram: "reference",
      },
      {
        heading: "A shallow copy builds a new shell, same branches",
        text: "A shallow copy allocates a new object and copies each top-level property. Primitives copy by value, so the top levels disconnect — but every nested object or array is copied by reference: the new shell holds the SAME branches inside.",
        purpose: "Watch the top level disconnect while the nested array stays shared.",
        code: `var original = { name: "Ada", tags: ["dev", "js"] };

var shallow = { name: original.name, tags: original.tags }; // new shell, same branch
shallow.name = "Alan";
shallow.tags[shallow.tags.length] = "copy";

console.log(original.name); // -> Ada — the primitive copied by value
console.log(original.tags); // -> ["dev", "js", "copy"] — the branch was shared
console.log(shallow.tags === original.tags); // -> true — one array, two shells`,
        check: {
          q: "After a shallow copy, renaming shallow.name to \"Alan\" — what does original.name read?",
          options: ["Ada — primitives copied by value into the new shell","Alan — the names are linked","undefined","An error"],
          answer: 0,
          why: "Top-level primitives were copied by value, so the shells are separate. Only the nested branch (tags) is shared, because that property holds a reference.",
        },
      },
      {
        heading: "A deep copy clones every branch",
        text: "A deep copy recurses: primitives copy as-is, arrays clone element by element, plain objects clone key by key. Nothing is shared afterwards — changing the copy can never reach the original, at any depth.",
        purpose: "Watch the deep clone mutate freely while the original stands still.",
        code: `function deepCopy(value) {
  if (value === null || typeof value !== "object") {
    return value; // primitives: nothing to clone
  }
  if (Array.isArray(value)) {
    var copy = [];
    for (var i = 0; i < value.length; i = i + 1) {
      copy[copy.length] = deepCopy(value[i]);
    }
    return copy;
  }
  var obj = {};
  var keys = Object.keys(value);
  for (var k = 0; k < keys.length; k = k + 1) {
    obj[keys[k]] = deepCopy(value[keys[k]]);
  }
  return obj;
}

var original = { name: "Ada", tags: ["dev"] };
var deep = deepCopy(original);
deep.tags[deep.tags.length] = "deep";

console.log(original.tags); // -> ["dev"] — untouched at depth
console.log(deep.tags === original.tags); // -> false — a brand-new branch`,
      },
      {
        heading: "JSON.parse(JSON.stringify) is not a deep copy",
        text: "The JSON shortcut looks like a deep copy but loses its way: undefined values and functions are dropped, Dates become strings, circular references throw. It copies only what JSON can represent — not what the object holds.",
        purpose: "Watch two properties vanish and a Date degrade through the JSON shortcut.",
        code: `var source = {
  when: new Date("2024-01-01"),
  note: undefined,
  run: function () {}
};

var jsonCopy = JSON.parse(JSON.stringify(source));
console.log(Object.keys(jsonCopy)); // -> ["when"] — note and run silently dropped
console.log(jsonCopy.when); // -> "2024-01-01T00:00:00.000Z" — a string, not a Date
console.log(typeof jsonCopy.when); // -> string`,
        check: {
          q: "Why does the JSON shortcut drop the run function?",
          options: ["JSON.stringify only writes what JSON can represent — functions are not","Functions are private","JSON runs the function first","run was not enumerable"],
          answer: 0,
          why: "JSON has no way to represent a function or undefined, so stringify skips them. A deep copy keeps every key — the JSON shortcut is a format conversion, not a copy.",
        },
      },
    ],
    starter: `// Exercise: write deepCopy(obj)\n// It should clone plain objects and arrays recursively.\n// Primitives are returned as-is.\n\nfunction deepCopy(value) {\n  // your recursive copy here\n  return value;\n}\n\nvar original = { a: 1, b: { c: 2 } };\nvar clone = deepCopy(original);\nclone.b.c = 99;\nconsole.log(original.b.c); // should still be 2`,
    exercise:
      "Write deepCopy(value) that returns a fully disconnected copy of plain objects and arrays. Primitives are returned as-is. Use only var, function, Object.keys, Array.isArray, and for loops. Do not use {...} or structuredClone.",
    solutions: [
      {
        title: "Manual shallow copy",
        note: "Object.keys lists only own enumerable keys, so the loop copies the top-level shell without pulling in prototype properties.",
        code: `function shallowCopy(obj) {\n  var copy = new Object();\n  var keys = Object.keys(obj);\n  for (var i = 0; i < keys.length; i = i + 1) {\n    copy[keys[i]] = obj[keys[i]];\n  }\n  return copy;\n}\n\nvar original = { name: "Ada", tags: ["dev", "js"] };\nvar shallow = shallowCopy(original);\nconsole.log(shallow.tags === original.tags); // true — shared branch`,
      },
      {
        title: "Manual deep copy",
        note: "The function calls itself for nested objects and arrays, so every branch is brand-new and nothing is shared.",
        code: `function deepCopy(value) {\n  if (value === null || typeof value !== "object") {\n    return value;\n  }\n  if (Array.isArray(value)) {\n    var copy = [];\n    for (var i = 0; i < value.length; i = i + 1) {\n      copy[copy.length] = deepCopy(value[i]);\n    }\n    return copy;\n  }\n  var copy = new Object();\n  var keys = Object.keys(value);\n  for (var i = 0; i < keys.length; i = i + 1) {\n    copy[keys[i]] = deepCopy(value[keys[i]]);\n  }\n  return copy;\n}\n\nvar original = { a: 1, b: { c: 2 } };\nvar clone = deepCopy(original);\nclone.b.c = 99;\nconsole.log(original.b.c); // 2 — fully disconnected`,
      },
      {
        title: "Why JSON is not a deep copy",
        note: "JSON.stringify drops undefined and function values, stringifies Dates, and throws on circular references — the hand-rolled copy keeps the shape.",
        code: `function deepCopy(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    var copy = [];
    for (var i = 0; i < value.length; i = i + 1) {
      copy[copy.length] = deepCopy(value[i]);
    }
    return copy;
  }
  var obj = new Object();
  var keys = Object.keys(value);
  for (var i = 0; i < keys.length; i = i + 1) {
    obj[keys[i]] = deepCopy(value[keys[i]]);
  }
  return obj;
}

var source = {
  when: new Date("2024-01-01"),
  note: undefined,
  run: function () {}
};

var jsonCopy = JSON.parse(JSON.stringify(source));
console.log(Object.keys(jsonCopy)); // ["when"] — note and run silently dropped
console.log(jsonCopy.when); // "2024-01-01T00:00:00.000Z" — a string, not a Date

var loop = new Object();
loop.self = loop;
try {
  JSON.stringify(loop);
} catch (err) {
  console.log(err.message); // circular structure error
}

var safe = deepCopy(source);
console.log(Object.keys(safe)); // ["when", "note", "run"] — every key survives
console.log(typeof safe.run); // "function" — the hand-rolled copy keeps it callable`,
      },
    ],
    checklist: [
      "= with an object shares the shell — two names, one object",
      "Shallow copy copies the top-level shell only; nested objects stay shared",
      "Deep copy recurses into every nested object and array",
      "Object.keys lists own enumerable keys for manual copying",
      "structuredClone is the built-in deep copy — know what it replaces",
      "JSON.parse(JSON.stringify()) drops keys and mangles types — not a deep copy",
    ],
    realTalk:
      "The shell analogy never fails. = is two labels on one shell. {...a} paints a new shell but stuffs the same branches inside. structuredClone builds a new shell and new branches. Once you see the shell, you stop confusing \"copy the variable\" with \"copy the thing.\".",
    quiz: [
      {
        q: "What does let b = a do when a is an object?",
        options: [
          "Copies the object completely",
          "Makes b point to the same object",
          "Copies only the top-level properties",
          "Throws an error",
        ],
        answer: 1,
        why: "Assignment copies the reference, not the object. Both names point to the same shell.",
        tests: "= shares the shell",
      },
      {
        q: "What does { ... a } copy?",
        options: [
          "The object and everything inside it",
          "Only the top-level shell; nested objects stay shared",
          "Nothing — it is a syntax error",
          "Only primitive properties",
        ],
        answer: 1,
        why: "Spread creates a new object and copies own enumerable properties. Nested objects are copied by reference, so they are still shared.",
        tests: "A shallow copy builds a new shell, same branches",
      },
      {
        q: "What does structuredClone(a) do that { ... a } does not?",
        options: [
          "It also copies nested objects and arrays recursively",
          "It is faster",
          "It copies prototype methods",
          "It copies only primitives",
        ],
        answer: 0,
        why: "structuredClone recurses into every nested plain object and array, producing a fully disconnected copy.",
        tests: "A deep copy clones every branch",
      },
      {
        q: "What does JSON.parse(JSON.stringify(obj)) do to a Date property?",
        options: ["Keeps it a Date", "Turns it into an ISO string", "Drops the key", "Throws on any Date"],
        answer: 1,
        why: "Dates stringify to ISO strings and parsing never rebuilds them — the copy silently changes the type.",
        tests: "JSON.parse(JSON.stringify) is not a deep copy",
      },
      {
        q: "The manual shallow copy loops Object.keys(original). Which properties make it into the copy?",
        options: [
          "Own enumerable ones — non-enumerable and inherited are skipped",
          "Everything, including the prototype chain",
          "Only primitives",
          "Only functions",
        ],
        answer: 0,
        why: "Object.keys keeps own enumerable keys. A hand-built shallow copy therefore takes exactly what the lesson 6 listing takes — and nested values still go by reference.",
        tests: "Object.keys lists enumerable own properties only",
      },
      {
        q: "deepCopy starts with if (value === null || typeof value !== \"object\") — why is the null check needed first?",
        options: [
          "typeof null is \"object\" — the famous bug would send null down the clone path",
          "null cannot be compared",
          "null is always an object",
          "Order does not matter",
        ],
        answer: 0,
        why: "Lesson 1's bug: typeof null answers \"object\". Without the null check first, deepCopy(null) would try to clone it as an object. Old bugs shape new code.",
        tests: "typeof reads the type — with one famous bug",
      },
    ],
  },
];

export const LESSON_MAP = (function () {
  var map = {};
  for (var i = 0; i < LESSONS.length; i += 1) {
    map[LESSONS[i].id] = LESSONS[i];
  }
  return map;
})();

export function getLesson(id) {
  return LESSON_MAP[Number(id)] || null;
}
