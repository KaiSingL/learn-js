export default {
  id: 2,
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
        options: [
          "Nothing — the binding was created by the assignment",
          "It already existed, holding undefined",
          "It held 5 from a previous line",
          "It threw a ReferenceError",
        ],
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
        options: [
          "Inside the if block only",
          "In the check function's scope",
          "On the global object",
          "In a new scope per condition",
        ],
        answer: 1,
        why: "var ignores blocks. The binding belongs to the function, so it exists on every call — assigned or not (undefined when the if never ran).",
      },
    },
    {
      heading: "Closures keep the binding alive",
      text: "When a function is returned, it carries its birthplace's bindings with it. The inner function does not get a copy of the value — it keeps a live link to the binding, so changes made through one call are visible to the next.",
      purpose: "Watch one private count survive between calls — and two counters stay independent.",
      code: `function makeCounter() {
  var count = 0; // lives in makeCounter's scope
  return function () {
    count = count + 1; // the same binding on every call
    return count;
  };
}

var first = makeCounter();
var second = makeCounter();
console.log(first());  // -> 1
console.log(first());  // -> 2 — the binding survived the return
console.log(second()); // -> 1 — a new binding per makeCounter call`,
      check: {
        q: "What does a second call to makeCounter() create?",
        options: [
          "A copy of count with the current value",
          "A fresh count binding — the counters are independent",
          "A reference to the first counter's count",
          "An error — count no longer exists",
        ],
        answer: 1,
        why: "Each call to makeCounter runs the body again, creating a new count binding. first and second close over different bindings — that is why second() starts at 1.",
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
    },
    {
      heading: "An IIFE gives each callback its own binding",
      text: "An immediately invoked function expression runs once per iteration, and each run creates a fresh binding holding that iteration's value. Hand i to the IIFE as j, and every callback closes over its own j instead of the shared i.",
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
      check: {
        q: "What makes the IIFE version print 0 1 2 instead of 3 3 3?",
        options: [
          "The IIFE copies i into a fresh j binding per iteration",
          "The loop runs slower, giving the callbacks time",
          "j is a reference to i, resolved at call time",
          "The returned function is called immediately",
        ],
        answer: 0,
        why: "Each IIFE call creates a new j holding that iteration's value. The callbacks close over their own j instead of the single shared i.",
      },
    },
    {
      heading: "let is block-scoped and throws in the TDZ",
      text: "let draws its scope around any block — and from the start of that block until the declaration line, the binding sits in the temporal dead zone: reading it throws a ReferenceError instead of giving undefined. That is the real difference between var and let: when the binding exists, and what an early read does.",
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
  quizTags: [
    "A hoisted var exists before its line",
    "let is block-scoped and throws in the TDZ",
    "Only functions create a scope for var",
  ],
  extraQuiz: [
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
      q: "Inside a closure, two counters each hold a number count. count = count + 1 in one counter changes the other's count because...",
      options: [
        "Numbers are primitives and = copies the value — so it does NOT change the other",
        "Closures always share bindings across factories",
        "Numbers are stored by reference",
        "The bindings merge on the global object",
      ],
      answer: 0,
      why: "= copies the value for primitives, and each makeCounter call created a fresh binding. Neither counter can reach the other's count — value copying plus separate bindings.",
      tests: "= copies the value for primitives",
    },
  ],
};
