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
// Lessons not yet migrated still use the legacy shape (longDesc + realCode +
// extraReal) and render exactly as before. Lesson 1 is the reference example
// of the migrated shape.

export const LESSONS = [
  {
    id: 1,
    title: "Variables, Types & Reference vs Value",
    goal: "Understand primitives vs objects, reference equality, typeof, and explicit undefined checks.",
    tier: 0,
    sugarReplaces: "let / const, ??, truthy coercion",
    intro:
      "A variable is a name bound to a value. Primitives — numbers, strings, booleans, null, undefined — are carried by the binding itself. Objects and arrays are reached through a reference. Every surprise in this course traces back to what = actually copies: the value, or the reference.",
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
      "Use var for every binding",
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
    ],
  },
  {
    id: 2,
    title: "Scope, Hoisting & TDZ",
    goal: "See var hoisting, function scope, the temporal dead zone, and why let throws where var gives undefined.",
    tier: 1,
    sugarReplaces: "let block scope, arrow closure sugar",
    longDesc:
      "var is function-scoped. The binding is created when the function starts, so reading it before the assignment gives undefined, not a ReferenceError. Only functions create a new scope. let and const are block-scoped, and they live in the temporal dead zone (TDZ) from the start of the block until their declaration runs — reading them early throws a ReferenceError. That is the difference between var and let.",
    realCode: `var counter = function () {
  var count = 0;
  return function () {
    count = count + 1;
    return count;
  };
};

var inc = counter();
console.log(inc()); // -> 1
console.log(inc()); // -> 2

function buildFunctions() {
  var funcs = [];
  for (var i = 0; i < 3; i = i + 1) {
    funcs[i] = (function (j) {
      return function () { return j; };
    })(i);
  }
  return funcs;
}

var fns = buildFunctions();
console.log(fns[0](), fns[1](), fns[2]()); // -> 0 1 2`,

    extraReal: `var early;
console.log(early); // undefined — hoisted, not assigned

var later = 99;
console.log(later); // -> 99

// let version — uncomment to see the TDZ throw:
// console.log(earlyLet); // ReferenceError: Cannot access 'earlyLet' before initialization
// let earlyLet = 99;`,

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
      },
      {
        q: "What happens when you read let before its line?",
        options: ["undefined", "null", "A ReferenceError (TDZ)", "The previous value"],
        answer: 2,
        why: "let lives in the temporal dead zone from the start of its block until the declaration runs.",
      },
      {
        q: "Which construct creates a new variable scope with var?",
        options: ["An if block", "A for loop", "A function call", "A return statement"],
        answer: 2,
        why: "With var, only a function creates a scope. Blocks do not.",
      },
    ],
  },
  {
    id: 3,
    title: "Functions Are Objects + arguments",
    goal: "A function is a callable object with properties, arguments and return semantics.",
    tier: 0,
    sugarReplaces: "arrow functions, rest parameters, default parameters",
    longDesc:
      "A function is an object with a special internal method that lets you call it. That is why you can attach properties to it, pass it around and store it. Inside every real function there is an arguments object containing the actual values passed. Function declarations hoist; function expressions only hoist their variable, as undefined. Arrow functions have none of this — no own this, no arguments, no prototype.",
    realCode: `function add(a, b) {
  return a + b;
}

var multiply = function (a, b) {
  return a * b;
};

function showArgs() {
  var args = arguments;
  var result = "";
  for (var i = 0; i < args.length; i = i + 1) {
    result = result + args[i] + " ";
  }
  return result;
}

add.description = "adds two numbers";
console.log(add.description); // -> adds two numbers
console.log(typeof add); // -> function
console.log(showArgs("a", "b", "c")); // -> a b c 
console.log(multiply(3, 4)); // -> 12`,

    extraReal: `var Counter = function () {
  var fn = function () {
    fn.count = fn.count + 1;
    return fn.count;
  };
  fn.count = 0;
  return fn;
};

var next = Counter();
console.log(next()); // -> 1
console.log(next()); // -> 2
console.log(next.count); // -> 2`,

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
        why: "typeof has a special case for callable objects and reports \"function\".",
      },
      {
        q: "What is available before a function expression is assigned?",
        options: ["The function body", "The whole expression", "Only the variable, as undefined", "A syntax error"],
        answer: 2,
        why: "The var binding hoists, but the assignment happens in place. Calling it early throws a TypeError.",
      },
      {
        q: "What is arguments?",
        options: ["A real Array", "An array-like object", "A string", "A copy of the parameters"],
        answer: 1,
        why: "It has length and numeric indexes but no array methods. Use Array.prototype.slice.call to convert it.",
      },
    ],
  },
  {
    id: 4,
    title: "this, call, apply, bind",
    goal: "See that this is decided by the call site, then control it explicitly.",
    tier: 0,
    sugarReplaces: "arrow lexical this, hidden receiver tricks",
    longDesc:
      "this is not lexical in a real function. It is determined when the function is called: a method call uses the object before the dot, a plain call uses undefined in strict mode, and call, apply and bind let you set it yourself. call takes arguments one by one, apply takes an array-like, and bind returns a new function with this locked in.",
    realCode: `function greet(greeting) {
  return greeting + " " + this.name;
}

var person = { name: "Alex" };

var r1 = greet.call(person, "Hello");
var r2 = greet.apply(person, ["Hi"]);
var bound = greet.bind(person);
var r3 = bound("Hey");

console.log(r1); // -> Hello Alex
console.log(r2); // -> Hi Alex
console.log(r3); // -> Hey Alex

function Counter() {
  this.count = 0;
  var self = this;
  this.inc = function () {
    self.count = self.count + 1;
  };
}
var counter = new Counter();
counter.inc();
counter.inc();
console.log(counter.count); // -> 2`,

    extraReal: `Function.prototype.myBind = function (ctx) {
  var fn = this;
  var preset = Array.prototype.slice.call(arguments, 1);
  return function () {
    var args = preset.concat(Array.prototype.slice.call(arguments));
    return fn.apply(ctx, args);
  };
};

function greet(greeting) {
  return greeting + " " + this.name;
}
var bound = greet.myBind({ name: "Alex" }, "Hello");
console.log(bound("!")); // -> Hello Alex`,

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
      },
      {
        q: "What is the second argument of apply?",
        options: ["A single value", "An array-like of arguments", "The this object", "A callback"],
        answer: 1,
        why: "apply(thisArg, argsArray) spreads the array-like into the parameter list.",
      },
      {
        q: "What does bind return?",
        options: ["The result of calling the function", "A new function with this fixed", "The this object", "undefined"],
        answer: 1,
        why: "bind returns a new function. The call happens later, when you invoke that new function.",
      },
    ],
  },
  {
    id: 5,
    title: "Objects & Prototype — The Real Class",
    goal: "Replace the class keyword with a constructor function, prototype methods and prototype-chain walking.",
    tier: 0,
    sugarReplaces: "class, extends, constructor, super",
    longDesc:
      "A class is syntax sugar for a constructor function plus assignments on its prototype. new does four things: create an empty object, link it to the constructor's prototype, call the constructor with this set to that object, and return the object. Methods belong on the prototype so every instance shares one copy instead of allocating a new function per object. Every object has an internal [[Prototype]] link; property lookup walks that link until it finds the key or reaches null.",
    realCode: `function Dog(name) {
  this.name = name;
  this.tricks = [];
}

Dog.prototype.bark = function () {
  return "Woof " + this.name;
};

Dog.prototype.learn = function (trick) {
  this.tricks[this.tricks.length] = trick;
  return this;
};

var rex = new Dog("Rex");
console.log(rex.bark()); // -> Woof Rex
console.log(rex.learn("sit").learn("roll").tricks); // -> ["sit", "roll"]
console.log(rex.hasOwnProperty("name")); // -> true
console.log(rex.hasOwnProperty("bark")); // -> false`,

    extraReal: `function Person(name) { this.name = name; }
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
console.log(s instanceof Person); // -> true
console.log(s instanceof Student); // -> true`,

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
      },
      {
        q: "Where does rex.bark live?",
        options: ["On rex", "On Dog.prototype", "On Object.prototype", "In a closure"],
        answer: 1,
        why: "The method is assigned once to Dog.prototype and found through the prototype chain.",
      },
      {
        q: "Why put methods on the prototype?",
        options: ["They run faster", "One shared copy instead of one per instance", "They become private", "They can use new"],
        answer: 1,
        why: "Prototype methods are allocated once. Methods inside the constructor create a new function for every instance.",
      },
    ],
  },
  {
    id: 6,
    title: "Property Descriptors — defineProperty",
    goal: "Control property flags: writable, enumerable, configurable.",
    tier: 1,
    sugarReplaces: "obj.age = 21 (sugar for defineProperty with all flags true)",
    longDesc:
      "A normal assignment like obj.age = 21 is sugar for Object.defineProperty with writable, enumerable and configurable all set to true. When you call Object.defineProperty directly and only pass value, every missing flag defaults to false. That is why a non-enumerable property disappears from Object.keys and for-in loops, why a non-writable property silently ignores assignment in sloppy mode, and why a non-configurable property cannot be deleted or redefined. The classic trap is that the default is enumerable:false. Descriptors come in two shapes: data descriptors carry value and writable; accessor descriptors carry get and set — the machinery behind getters and setters.",
    realCode: `var person = new Object();
person.name = "Lydia";

Object.defineProperty(person, "age", {
  value: 21,
  writable: false,
  enumerable: false,
  configurable: false
});

console.log(person.name); // -> Lydia
console.log(person.age); // -> 21

var descriptor = Object.getOwnPropertyDescriptor(person, "age");
console.log(descriptor.value); // -> 21
console.log(descriptor.writable); // -> false
console.log(descriptor.enumerable); // -> false
console.log(descriptor.configurable); // -> false

console.log(Object.keys(person)); // -> ["name"]
console.log(person.hasOwnProperty("age")); // -> true
console.log(person.propertyIsEnumerable("age")); // -> false`,

    extraReal: `var person2 = new Object();
person2.name = "Lydia";
Object.defineProperty(person2, "age", {
  value: 21,
  writable: true,
  enumerable: true,
  configurable: true
});
console.log(Object.keys(person2)); // -> ["name", "age"]

// Accessor descriptors — get/set is the machinery behind the property syntax
var account = new Object();
account.balance = 100;
Object.defineProperty(account, "cents", {
  get: function () {
    return Math.round(this.balance * 100);
  },
  set: function (value) {
    this.balance = value / 100;
  }
});
account.cents = 250;
console.log(account.balance); // 2.5
console.log(account.cents); // 250`,

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
      },
      {
        q: "What happens when you omit writable in defineProperty?",
        options: ["It defaults to true", "It defaults to false", "It throws an error", "It copies from the prototype"],
        answer: 1,
        why: "Every missing descriptor flag defaults to false, including writable.",
      },
      {
        q: "What does an accessor descriptor carry instead of value and writable?",
        options: ["get and set", "read and write", "open and closed", "has and gives"],
        answer: 0,
        why: "Accessor properties are defined with get and set functions; a single descriptor cannot mix them with value and writable.",
      },
    ],
  },
  {
    id: 7,
    title: "Coercion & Equality",
    goal: "Understand +, == vs ===, and how Object keys always become strings.",
    tier: 0,
    sugarReplaces: "== vs ===, implicit coercion, template coercion",
    longDesc:
      "JavaScript coerces values in more places than you notice. The + operator concatenates strings but adds numbers, and it coerces operands to primitive first. == coerces both sides before comparing; === does not. Object property keys are always strings (or Symbols), so a[b] = 123 with b an object stores under the key \"[object Object]\". The mechanism is ToPrimitive: with a number hint the engine calls valueOf first; with a string hint it calls toString first.",
    realCode: `var a = 5;
var b = "5";

console.log(a == b);   // true — == coerces "5" to 5
console.log(a === b);  // false — === compares type and value
console.log(a + b);    // "55" — string concatenation
console.log(b + a);    // "55"
console.log(1 + true); // 2 — true coerces to 1
console.log("10" - 5); // 5 — subtraction coerces to number

var obj = {};
var key = { name: "secret" };
obj[key] = 123;
console.log(obj["[object Object]"]); // 123 — the object key became a string`,

    extraReal: `function same(x, y) {
  if (x === y) { return "strict equal"; }
  if (x == y) { return "loose equal"; }
  return "not equal";
}

console.log(same(1, 1)); // -> strict equal
console.log(same(1, "1")); // -> loose equal
console.log(same(null, undefined)); // -> loose equal
console.log(same(0, false)); // -> loose equal

// ToPrimitive: the default hint (+) calls valueOf first; String() hints string, so toString first
var wallet = {
  dollars: 2,
  valueOf: function () {
    return this.dollars;
  },
  toString: function () {
    return this.dollars + " dollars";
  }
};
console.log(wallet + 1); // 3 — valueOf already returned a primitive
console.log(wallet + ""); // "2" — same reason
console.log(String(wallet)); // "2 dollars" — string hint, toString runs

var plain = new Object();
console.log("" + plain); // "[object Object]" — valueOf returns the object, so toString runs instead

// == unwraps a wrapper object when the other side is a primitive
var wrapped = new String("");
console.log("" == wrapped);             // true — == unwraps the wrapper to ""
console.log("" === wrapped);            // false — === never converts
console.log(wrapped == new String("")); // false — both sides are objects: references compared`,

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
      },
      {
        q: "What does 5 === \"5\" return?",
        options: ["true", "false", "undefined", "A syntax error"],
        answer: 1,
        why: "=== does not coerce. Number and string are different types, so the result is false.",
      },
      {
        q: "What key does obj[{ name: \"x\" }] = 1 store under?",
        options: ["\"[object Object]\"", "\"name\"", "42", "The object itself"],
        answer: 0,
        why: "Object keys are strings. The object key is converted to \"[object Object]\" via ToPrimitive.",
      },
      {
        q: "What does wallet + \"\" return when wallet.valueOf() returns 2?",
        options: ["\"2\"", "\"[object Object]\"", "\"2 dollars\"", "2"],
        answer: 0,
        why: "The + operator uses the default hint, which tries valueOf first. It returns the primitive 2, so the concatenation gives \"2\".",
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
      },
    ],
  },
  {
    id: 8,
    title: "Arrays Without Magic",
    goal: "Write the loops that map, filter and reduce hide.",
    tier: 0,
    sugarReplaces: ".map .filter .find .reduce, spread [...]",
    longDesc:
      "Array methods are loops with a callback. When you write the loop yourself you can see the allocation, the index, the early return and the accumulator. Writing arr[arr.length] = value is the real push. Returning a new array instead of mutating the input is a decision you make explicitly, not something a method does for you.",
    realCode: `var arr = [1, 2, 3, 4];
var doubled = [];
for (var i = 0; i < arr.length; i = i + 1) {
  var x = arr[i];
  doubled[doubled.length] = x * 2;
}

var filtered = [];
for (var j = 0; j < arr.length; j = j + 1) {
  if (arr[j] > 2) {
    filtered[filtered.length] = arr[j];
  }
}

function manualPush(array, value) {
  array[array.length] = value;
  return array.length;
}

manualPush(doubled, 10);
console.log(doubled); // -> [2, 4, 6, 8, 10]
console.log(filtered); // -> [3, 4]`,

    extraReal: `function map(array, fn) {
  var out = [];
  for (var i = 0; i < array.length; i = i + 1) {
    out[out.length] = fn(array[i], i, array);
  }
  return out;
}

var names = ["ada", "grace", "alan"];
console.log(map(names, function (name, index) {
  return index + ":" + name;
}));`,

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
      },
      {
        q: "What does arr[arr.length] = x do?",
        options: ["Overwrites the last item", "Appends x", "Throws an error", "Removes the last item"],
        answer: 1,
        why: "The length is one past the last index, so assigning there appends and grows length.",
      },
      {
        q: "Why write the loop manually?",
        options: ["It is always faster", "You can see the allocation and control the exit", "It makes code shorter", "Built-in methods are deprecated"],
        answer: 1,
        why: "The loop makes the work visible: how many passes, what is allocated, and when you stop.",
      },
    ],
  },
  {
    id: 9,
    title: "Global Pollution & Strict Mode",
    goal: "See how accidental globals are created, and how \"use strict\" fails fast.",
    tier: 1,
    sugarReplaces: "implicit global assignment, non-strict delete",
    longDesc:
      "In sloppy mode, assigning to an undeclared identifier creates a property on the global object (window.y = 10). A typo like greetign = {} silently creates a global instead of throwing. delete on a plain property works in sloppy mode but throws in strict mode when the property is non-configurable. \"use strict\" at the top of a file or function makes these mistakes throw immediately instead of silently corrupting the global object.",
    realCode: `'use strict';

var greetign = {}; // typo: intended greeting
console.log(typeof greetign); // -> object

// In strict mode, this would throw:
// y = 10; // ReferenceError: Cannot assign to undeclared variable y

var obj = { x: 1 };
delete obj.x; // OK — deleting own property
console.log(obj.x); // undefined

// In strict mode, deleting a non-configurable property throws:
// Object.defineProperty(obj, "y", { value: 2, configurable: false });
// delete obj.y; // TypeError`,

    extraReal: `function sloppy() {
  z = 10; // creates window.z in sloppy mode
  return z;
}

function strict() {
  'use strict';
  // z = 10; // ReferenceError — fails fast instead of polluting globals
  return 0;
}

console.log(sloppy()); // -> 10
console.log(typeof window.z); // -> number
console.log(strict()); // -> 0`,

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
      },
      {
        q: "What does \"use strict\" do to undeclared assignments?",
        options: ["Allows them", "Throws a ReferenceError", "Ignores them", "Creates a local variable"],
        answer: 1,
        why: "Strict mode forbids implicit globals — the assignment throws immediately.",
      },
      {
        q: "What happens when you delete a non-configurable property in strict mode?",
        options: ["Returns true", "Returns false", "Throws a TypeError", "Does nothing"],
        answer: 2,
        why: "Strict mode makes delete throw on non-configurable properties instead of silently failing.",
      },
    ],
  },
  {
    id: 10,
    title: "Event Loop — Stack, WebAPI, Queue",
    goal: "Understand why setTimeout in a for(var) loop prints 3 3 3, and why First Third Second is the right order.",
    tier: 0,
    sugarReplaces: "setTimeout, promise microtasks (concept only)",
    longDesc:
      "JavaScript is single-threaded. There is a call stack, Web APIs (timers, DOM events, fetch) that run outside the engine, and a task queue. When setTimeout fires, its callback does not run immediately — it goes to the queue and waits until the stack is empty. var in a for loop is function-scoped, so by the time the timer callback runs, the loop has finished and i is 3. The queue order explains why the classic loop prints 3 3 3, and why \"First Third Second\" logs in that order.",
    realCode: `console.log("First"); // -> First

setTimeout(function () {
  console.log("Second"); // -> Second
}, 0);

console.log("Third"); // -> Third`,

    extraReal: `for (var i = 0; i < 3; i = i + 1) {
  setTimeout(function () {
    console.log("i = " + i); // -> i = 3 (x3) ...
  }, 0);
}

// After the stack clears, all three callbacks read the same i: 3
// Prints:
// i = 3
// i = 3
// i = 3`,

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
      },
      {
        q: "Why do all three setTimeout callbacks in for(var i) print 3?",
        options: ["Each captures its own i", "var i is one shared binding, finished at 3", "setTimeout delays them differently", "The engine optimizes them away"],
        answer: 1,
        why: "var is function-scoped. All three closures read the same i, which is 3 when the loop ends.",
      },
      {
        q: "When does a setTimeout(..., 0) callback run?",
        options: ["Immediately", "After 0ms exactly", "After the stack empties", "Never"],
        answer: 2,
        why: "The callback is queued and runs when the call stack is empty — not at a precise time.",
      },
    ],
  },
  {
    id: 11,
    title: "Async Without Sugar",
    goal: "Use callbacks first, then raw Promises, with no async or await.",
    tier: 0,
    sugarReplaces: "async/await, implicit promise wrapping",
    longDesc:
      "Asynchronous code is a callback that runs later. A Promise is an object that holds a state and a list of callbacks; the executor function runs immediately with resolve and reject. then returns a new promise, which is what makes chaining work. catch is just then with a null success handler. async/await hides all of this behind syntactic sugar.",
    realCode: `function fetchData(callback) {
  setTimeout(function () {
    callback(null, { data: "hello" });
  }, 100);
}

fetchData(function (err, result) {
  if (err) { console.log("error"); return; }
  console.log(result.data); // -> hello
});

var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve("done");
  }, 100);
});

p.then(function (value) {
  console.log(value); // -> done
  return value + "!";
}).then(function (v2) {
  console.log(v2); // -> done!
}).catch(function (e) {
  console.log("fail", e);
});`,

    extraReal: `function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(ms); }, ms);
  });
}

delay(30).then(function (ms) {
  console.log("waited " + ms); // -> waited 30
  return delay(20);
}).then(function (ms) {
  console.log("then " + ms); // -> then 20
  return "finished";
}).then(function (value) {
  console.log(value); // -> finished
});`,

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
      },
      {
        q: "What is catch(fn) equivalent to?",
        options: ["then(fn, fn)", "then(null, fn)", "new Promise(fn)", "finally(fn)"],
        answer: 1,
        why: "catch is a convenience wrapper around a rejected handler in then.",
      },
      {
        q: "What does async/await actually do?",
        options: ["Runs code on another thread", "Wraps a promise and awaits then callbacks", "Removes callbacks from the engine", "Creates a callback queue"],
        answer: 1,
        why: "async makes the function return a promise; await pauses that async function until the promise settles.",
      },
    ],
  },
  {
    id: 12,
    title: "Generators & Iterators — Manual State Machines",
    goal: "See that function* hides a state machine, yield suspends execution, and .next() returns { value, done }.",
    tier: 0,
    sugarReplaces: "function*, yield, .next(), for...of iterator protocol",
    longDesc:
      "A generator function is syntax sugar for a closure-based state machine. function* does not run its body when called; it returns an iterator object. Calling .next() on that object runs the body up to the next yield, then suspends and returns { value, done }. The state (which yield to resume from, all local variables) lives inside the closure between calls. for...of is just a loop that calls .next() until done is true. All of this can be written by hand with var, function, and an object that has a next method. The protocol even has a name: Symbol.iterator. Attach that key — a function returning the iterator — and for...of can consume your object.",
    realCode: `function makeCounter() {
  var state = "start";
  var value = 0;
  return {
    next: function () {
      if (state === "start") {
        state = "yielded";
        return { value: 0, done: false };
      }
      if (state === "yielded") {
        state = "done";
        return { value: 1, done: false };
      }
      return { value: undefined, done: true };
    }
  };
}

var it = makeCounter();
console.log(it.next()); // -> { value: 0, done: false }
console.log(it.next()); // -> { value: 1, done: false }
console.log(it.next()); // -> { value: undefined, done: true }
console.log(it.next()); // -> { value: undefined, done: true }

// Symbol.iterator is the well-known key loops look for — attach it and the object is iterable
it[Symbol.iterator] = function () {
  return this;
};
console.log(typeof it[Symbol.iterator]); // "function"`,

    extraReal: `function idGenerator() {
  var state = "start";
  var n = 0;
  return {
    next: function () {
      if (state === "start") {
        state = "running";
        return { value: n, done: false };
      }
      n = n + 1;
      return { value: n, done: false };
    }
  };
}

var ids = idGenerator();
console.log(ids.next()); // -> { value: 0, done: false }
console.log(ids.next()); // -> { value: 1, done: false }
console.log(ids.next()); // -> { value: 2, done: false }`,

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
      },
      {
        q: "When does a generator function body start running?",
        options: ["When the function is called", "When .next() is first called", "When for...of starts", "Immediately on definition"],
        answer: 1,
        why: "Calling a generator function only creates the iterator. The body runs on the first .next().",
      },
      {
        q: "What does done: true mean?",
        options: ["The generator threw an error", "The generator has no more values", "The generator is paused", "The generator is infinite"],
        answer: 1,
        why: "done: true signals the end of iteration; value is typically undefined then.",
      },
      {
        q: "Which property makes an object consumable by for...of?",
        options: ["next", "done", "Symbol.iterator", "for"],
        answer: 2,
        why: "for...of looks up the well-known Symbol.iterator key and calls it to get an iterator — the object with a next method you built by hand.",
      },
    ],
  },
  {
    id: 13,
    title: "Building Real Things — EventEmitter, Manual Promise, IIFE Module",
    goal: "Build an EventEmitter with prototype methods, a Promise from scratch, and an IIFE module — all without class or import.",
    tier: 0,
    sugarReplaces: "class EventEmitter, extends, async/await, import/export",
    longDesc:
      "This is the capstone. The EventEmitter is the core of Node's EventEmitter written with the primitives from the whole course: constructor owns the storage, methods live on the prototype, emit forwards arguments with apply, and off rebuilds the listener array. A manual Promise shows the executor/resolve/reject machinery without async/await. The IIFE module shows private state with a public API — the pattern import/export compiles to. Its Manual Promise leans on throw, try, catch and finally — the error machinery every real library uses.",
    realCode: `function EventEmitter() {
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

var ee = new EventEmitter();
ee.on("data", function (x) { console.log(x); });
ee.emit("data", "hello");`,

    extraReal: `EventEmitter.prototype.once = function (event, listener) {
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
ee.emit("ready", 2);`,

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
        code: `EventEmitter.prototype.once = function (event, listener) {
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
      },
      {
        q: "Why does off build a new array?",
        options: ["It is required by the engine", "To avoid mutating while iterating and keep the logic explicit", "To sort listeners", "To clear all events"],
        answer: 1,
        why: "Rebuilding keeps the removal visible and avoids index-shifting bugs while looping.",
      },
      {
        q: "What does once register?",
        options: ["The original listener", "A wrapper that removes itself then calls the listener", "A copy of the emitter", "A promise"],
        answer: 1,
        why: "The wrapper has a reference to the emitter and to itself, so it can off(event, wrapper) before the real call.",
      },
      {
        q: "Which block runs no matter how the try block exits?",
        options: ["catch", "finally", "throw", "then"],
        answer: 1,
        why: "finally always runs — on success, on a caught error, and even while a return is in flight.",
      },
    ],
  },
  {
    id: 14,
    title: "Shallow Copy & Deep Copy — Same Shell vs New Shell",
    goal: "See that = shares the shell, shallow copy copies only the shell, and deep copy clones every branch.",
    tier: 0,
    sugarReplaces: "let b = a, {...a}, structuredClone(a)",
    longDesc:
      "Assigning an object does not copy it — both variables point to the same shell. A shallow copy builds a new shell but copies the references inside, so nested arrays and objects are still shared. A deep copy builds a new shell and recursively clones every nested plain object and array, so nothing is shared. The shell analogy makes it permanent: = is two names for one shell, {...a} is a new shell with the same branches inside, and structuredClone is a new shell with brand-new branches. The popular shortcut JSON.parse(JSON.stringify(value)) is not a deep copy — it drops undefined and function values, turns Dates into strings, and throws on circular references.",
    realCode: `var original = { name: "Ada", tags: ["dev", "js"] };\n\n// = shares the shell — both names point to the same object\nvar alias = original;\nalias.name = "Grace";\nconsole.log(original.name); // "Grace" — same shell, changed through either name\n\n// Shallow copy — new shell, same branches inside\nvar shallow = new Object();\nvar keys = Object.keys(original);\nfor (var i = 0; i < keys.length; i = i + 1) {\n  var key = keys[i];\n  shallow[key] = original[key];\n}\nshallow.name = "Alan";\nconsole.log(original.name); // "Grace" — top-level copy, original untouched\nconsole.log(shallow.tags === original.tags); // true — nested array still shared\nshallow.tags[shallow.tags.length] = "copy";\nconsole.log(original.tags); // ["dev", "js", "copy"] — shared branch mutated\n\n// Deep copy — new shell, new branches, fully disconnected\nfunction deepCopy(value) {\n  if (value === null || typeof value !== "object") {\n    return value;\n  }\n  if (Array.isArray(value)) {\n    var copy = [];\n    for (var j = 0; j < value.length; j = j + 1) {\n      copy[copy.length] = deepCopy(value[j]);\n    }\n    return copy;\n  }\n  var copy = new Object();\n  var objKeys = Object.keys(value);\n  for (var k = 0; k < objKeys.length; k = k + 1) {\n    var objKey = objKeys[k];\n    copy[objKey] = deepCopy(value[objKey]);\n  }\n  return copy;\n}\n\nvar deep = deepCopy(original);\ndeep.name = "Deep";\ndeep.tags[deep.tags.length] = "deep";\nconsole.log(original.name); // "Grace" — disconnected\nconsole.log(original.tags); // ["dev", "js", "copy"] — deep copy did not touch original`,
    extraReal: `function deepCopy(value) {\n  if (value === null || typeof value !== "object") {\n    return value;\n  }\n  if (Array.isArray(value)) {\n    var copy = [];\n    for (var i = 0; i < value.length; i = i + 1) {\n      copy[copy.length] = deepCopy(value[i]);\n    }\n    return copy;\n  }\n  var copy = new Object();\n  var keys = Object.keys(value);\n  for (var i = 0; i < keys.length; i = i + 1) {\n    copy[keys[i]] = deepCopy(value[keys[i]]);\n  }\n  return copy;\n}\n\nvar nested = { a: 1, b: { c: 2, d: [3, 4] } };\nvar cloned = deepCopy(nested);\ncloned.b.c = 99;\ncloned.b.d[cloned.b.d.length] = 5;\nconsole.log(nested.b.c); // 2 — untouched\nconsole.log(nested.b.d); // [3, 4] — untouched`,
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
        code: `var source = {
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
      },
      {
        q: "What does JSON.parse(JSON.stringify(obj)) do to a Date property?",
        options: ["Keeps it a Date", "Turns it into an ISO string", "Drops the key", "Throws on any Date"],
        answer: 1,
        why: "Dates stringify to ISO strings and parsing never rebuilds them — the copy silently changes the type.",
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
