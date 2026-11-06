export default {
  id: 4,
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
        options: [
          "An inner plain call would not inherit this from the method call",
          "this is undefined inside every function body",
          "self becomes a private property of the object",
          "It copies the whole object for safety",
        ],
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
  quizTags: [
    "this is decided by the call site",
    "apply sets this and takes the arguments as an array",
    "bind returns a new function with this locked",
  ],
  extraQuiz: [
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
};
