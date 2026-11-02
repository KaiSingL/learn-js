// The ten lessons. Code fields are plain strings so they can be linted,
// highlighted, copied and loaded into the playground without transformation.

export const LESSONS = [
  {
    id: 1,
    title: "Variables, Types & Truthiness",
    goal: "Understand primitives vs objects, typeof, and explicit undefined checks.",
    sugarReplaces: "let / const, ??, truthy coercion",
    longDesc:
      "Before let and const there was only var. Primitives are compared by value; objects are compared by reference. typeof is the only safe runtime introspection, and it has one famous bug: typeof null is \"object\". Always check === undefined explicitly instead of leaning on falsiness, because 0, \"\" and false are real values too.",
    realCode: `var a = 5;
var b = new String("hello");
var c = new Array();
var d = new Object();
var e = null;
var f;

if (typeof a === "number") {
  console.log("number");
}
if (f === undefined) {
  console.log("missing - explicit check");
}
if (e === null) {
  console.log("null is intentional empty");
}
var isString = typeof b === "string" || b instanceof String;
console.log(a, b, c.length, isString);`,
    extraReal: `function check(value) {
  if (value === undefined) { return "undefined"; }
  if (value === null) { return "null"; }
  if (typeof value === "number" && value !== value) { return "NaN"; }
  return typeof value;
}

console.log(check(undefined));
console.log(check(null));
console.log(check(NaN));
console.log(check(42));`,
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
  console.log(String(samples[i]) + " -> " + isFalsy(samples[i]));
}`,
      },
      {
        title: "A typeof classifier",
        note: "Notice that the object wrapper created by new String is an object, not a primitive.",
        code: `function describe(value) {
  if (value === undefined) { return "undefined"; }
  if (value === null) { return "null"; }
  if (value !== value) { return "NaN"; }
  if (Array.isArray(value)) { return "array"; }
  return typeof value;
}

console.log(describe(undefined));
console.log(describe(null));
console.log(describe(NaN));
console.log(describe(new String("hi")));
console.log(describe("hi"));`,
      },
    ],
    checklist: [
      "Use var for every binding",
      "Check === undefined instead of relying on truthiness",
      "Check === null separately from undefined",
      "Use value !== value to detect NaN",
      "Remember objects compare by reference",
    ],
    realTalk:
      "typeof null returning \"object\" is a bug from 1995 that cannot be fixed without breaking the web. That is why every real codebase checks null explicitly.",
    quiz: [
      {
        q: "What does typeof null return?",
        options: ["\"null\"", "\"object\"", "\"undefined\"", "\"number\""],
        answer: 1,
        why: "It returns \"object\" because of a historical bug. null is still a primitive, so check it with === null.",
      },
      {
        q: "Which expression detects NaN?",
        options: ["value === NaN", "typeof value === \"NaN\"", "value !== value", "value === null"],
        answer: 2,
        why: "NaN is the only value not equal to itself, so value !== value is the reliable test.",
      },
      {
        q: "What is new String(\"hi\")?",
        options: ["A primitive string", "An object wrapper", "null", "A syntax error"],
        answer: 1,
        why: "The new operator always produces an object. typeof reports \"object\"; use String(\"hi\") for a primitive.",
      },
    ],
  },
  {
    id: 2,
    title: "Functions Are Objects",
    goal: "A function is a callable object with properties, arguments and return semantics.",
    sugarReplaces: "arrow functions, rest params, default params",
    longDesc:
      "A function is an object with a special internal method that lets you call it. That is why you can attach properties to it, pass it around and store it. Inside every real function there is an arguments object containing the actual values passed. Function declarations hoist; function expressions only hoist their variable, as undefined.",
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
console.log(add.description);
console.log(typeof add);
console.log(showArgs("a", "b", "c"));
console.log(multiply(3, 4));`,
    extraReal: `var Counter = function () {
  var fn = function () {
    fn.count = fn.count + 1;
    return fn.count;
  };
  fn.count = 0;
  return fn;
};

var next = Counter();
console.log(next());
console.log(next());
console.log(next.count);`,
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
console.log(c());
console.log(c());
console.log(c.count);
c.count = 100;
console.log(c());`,
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

console.log(sum(1, 2, 3, 4));
console.log(sum());

var toArray = function () {
  return Array.prototype.slice.call(arguments);
};
console.log(toArray("a", "b").length);`,
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
    id: 3,
    title: "Objects & Prototypes — The Real Class",
    goal: "Replace the class keyword with a constructor function and prototype methods.",
    sugarReplaces: "class, extends, constructor, super",
    longDesc:
      "A class is syntax sugar for a constructor function plus assignments on its prototype. new does four things: create an empty object, link it to the constructor's prototype, call the constructor with this set to that object, and return the object. Methods belong on the prototype so every instance shares one copy instead of allocating a new function per object.",
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
console.log(rex.bark());
console.log(rex.learn("sit").learn("roll").tricks);
console.log(rex.hasOwnProperty("name"));
console.log(rex.hasOwnProperty("bark"));`,
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
console.log(s.sayHi());
console.log(s.study());
console.log(s instanceof Person);
console.log(s instanceof Student);`,
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
console.log(tom.meow());
console.log(tom.lives);
console.log(tom.loseLife());
console.log(tom.hasOwnProperty("meow"));
console.log(Cat.prototype.hasOwnProperty("meow"));`,
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
console.log(s.sayHi());
console.log(s.study());
console.log(s.constructor === Student);
console.log(s instanceof Person);`,
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
    id: 4,
    title: "this, call, apply, bind",
    goal: "See that this is decided by the call site, then control it explicitly.",
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

console.log(r1);
console.log(r2);
console.log(r3);

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
console.log(counter.count);`,
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
console.log(bound("!"));`,
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
console.log(helloKai("!"));
console.log(helloKai("?"));
console.log(typeof helloKai);`,
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
console.log(speaker.speak.call(quiet, "hello"));
console.log(speaker.speak.apply(quiet, ["again"]));

var detached = speaker.speak;
console.log(typeof detached);
console.log(detached.call({ name: "Borrowed" }, "works"));`,
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
    title: "Scope, Hoisting & Closure",
    goal: "See var hoisting, function scope, and closure factories without let.",
    sugarReplaces: "let block scope, arrow closure sugar",
    longDesc:
      "var is function-scoped. The binding is created when the function starts, so reading it before the assignment gives undefined, not a ReferenceError. Only functions create a new scope. A closure is a function that keeps a live reference to the variables of the scope where it was created, even after that scope has returned.",
    realCode: `var counter = function () {
  var count = 0;
  return function () {
    count = count + 1;
    return count;
  };
};

var inc = counter();
console.log(inc());
console.log(inc());

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
console.log(fns[0](), fns[1](), fns[2]());`,
    extraReal: `var Module = (function () {
  var privateCount = 0;
  return {
    inc: function () {
      privateCount = privateCount + 1;
      return privateCount;
    },
    get: function () { return privateCount; }
  };
})();

console.log(Module.inc());
console.log(Module.inc());
console.log(Module.get());
console.log(typeof Module.privateCount);`,
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
console.log(fns[0]());
console.log(fns[1]());
console.log(fns[2]());`,
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
console.log(a.inc(), a.inc(), b.inc(), a.get());
console.log(typeof a.count);`,
      },
    ],
    checklist: [
      "Remember var hoists as undefined",
      "Only functions create a new scope",
      "Use an IIFE to capture a loop value",
      "Closures keep live bindings, not copies",
      "Keep private state out of the returned object",
    ],
    realTalk:
      "Hoisting is not the engine moving your code around. It is the environment record creating every var binding at function entry, before the first line runs.",
    quiz: [
      {
        q: "What is a hoisted var before its assignment?",
        options: ["null", "undefined", "A ReferenceError", "The previous value"],
        answer: 1,
        why: "The binding exists from function entry but has not been assigned, so it reads as undefined.",
      },
      {
        q: "Which construct creates a new variable scope?",
        options: ["An if block", "A for loop", "A function call", "A return statement"],
        answer: 2,
        why: "With var, only a function creates a scope. Blocks do not.",
      },
      {
        q: "What does a closure capture?",
        options: ["A copy of the values", "A live reference to the outer bindings", "Only global variables", "Nothing after return"],
        answer: 1,
        why: "The inner function keeps the environment record alive, so later writes are visible.",
      },
    ],
  },
  {
    id: 6,
    title: "Arrays Without Magic",
    goal: "Write the loops that map, filter and reduce hide.",
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
console.log(doubled);
console.log(filtered);`,
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

console.log(map([1, 2, 3], function (x) { return x * 2; }));
console.log(filter([1, 2, 3, 4], function (x) { return x > 2; }));
console.log(reduce([1, 2, 3, 4], function (acc, x) { return acc + x; }, 0));`,
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

console.log(slice([1, 2, 3, 4, 5], 1, 4));
console.log(indexOf(["a", "b", "c"], "b"));
console.log(indexOf(["a", "b", "c"], "z"));`,
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
    id: 7,
    title: "Async Without Sugar",
    goal: "Use callbacks first, then raw Promises, with no async or await.",
    sugarReplaces: "async/await, implicit promise wrapping",
    longDesc:
      "Asynchronous code is a callback that runs later. A Promise is an object that holds a state and a list of callbacks; the executor function runs immediately with resolve and reject. then returns a new promise, which is what makes chaining work. catch is just then with a null success handler.",
    realCode: `function fetchData(callback) {
  setTimeout(function () {
    callback(null, { data: "hello" });
  }, 100);
}

fetchData(function (err, result) {
  if (err) { console.log("error"); return; }
  console.log(result.data);
});

var p = new Promise(function (resolve, reject) {
  setTimeout(function () {
    resolve("done");
  }, 100);
});

p.then(function (value) {
  console.log(value);
  return value + "!";
}).then(function (v2) {
  console.log(v2);
}).catch(function (e) {
  console.log("fail", e);
});`,
    extraReal: `function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(ms); }, ms);
  });
}

delay(30).then(function (ms) {
  console.log("waited " + ms);
  return delay(20);
}).then(function (ms) {
  console.log("then " + ms);
  return "finished";
}).then(function (value) {
  console.log(value);
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
  console.log(value);
  return readPromise("missing");
}).then(function (value) {
  console.log(value);
}).catch(function (err) {
  console.log("caught: " + err.message);
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
  console.log("first " + ms);
  return delay(20);
}).then(function (ms) {
  console.log("second " + ms);
  return "done";
}).then(function (value) {
  console.log(value);
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
      "A promise is not magic and it is not a thread. It is an object with a state (pending, fulfilled, rejected) and a list of reactions that run as microtasks.",
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
    id: 8,
    title: "Prototype Chain Deep Dive",
    goal: "Walk the chain by hand, distinguish own from inherited, and build three levels.",
    sugarReplaces: "class extends, super, instanceof sugar",
    longDesc:
      "Every object has an internal [[Prototype]] link. Property lookup walks that link until it finds the key or reaches null. Object.create(proto) makes a new object with exactly that link. hasOwnProperty asks whether the key is on the object itself, and Object.getPrototypeOf moves one step up the chain.",
    realCode: `var animal = {
  speak: function () { return "sound"; }
};

var dog = Object.create(animal);
dog.bark = function () { return "woof"; };

console.log(dog.bark());
console.log(dog.speak());
console.log(dog.hasOwnProperty("bark"));
console.log(dog.hasOwnProperty("speak"));

function walkChain(obj) {
  var current = obj;
  while (current !== null) {
    console.log(Object.keys(current));
    current = Object.getPrototypeOf(current);
  }
}

walkChain(dog);`,
    extraReal: `function isInstance(obj, Ctor) {
  var proto = Ctor.prototype;
  var current = Object.getPrototypeOf(obj);
  while (current !== null) {
    if (current === proto) { return true; }
    current = Object.getPrototypeOf(current);
  }
  return false;
}

function Dog() {}
var rex = new Dog();
console.log(isInstance(rex, Dog));
console.log(isInstance(rex, Object));
console.log(isInstance({}, Dog));`,
    starter: `// Exercise: implement instanceof manually.
// Walk Object.getPrototypeOf(obj) and compare with Ctor.prototype.

function isInstance(obj, Ctor) {
  // your code here
  return false;
}

function Dog() {}
var rex = new Dog();

console.log(isInstance(rex, Dog));
console.log(isInstance(rex, Object));
console.log(isInstance({}, Dog));`,
    exercise:
      "Implement isinstance(obj, Constructor) by walking the prototype chain and comparing === Constructor.prototype. Then build a three-level inheritance chain with Object.create.",
    solutions: [
      {
        title: "isInstance by walking the chain",
        note: "The loop ends at null, which is the one value with no prototype.",
        code: `function isInstance(obj, Ctor) {
  var proto = Ctor.prototype;
  var current = Object.getPrototypeOf(obj);
  while (current !== null) {
    if (current === proto) { return true; }
    current = Object.getPrototypeOf(current);
  }
  return false;
}

function Dog() {}
function Cat() {}
var rex = new Dog();

console.log(isInstance(rex, Dog));
console.log(isInstance(rex, Object));
console.log(isInstance(rex, Cat));
console.log(isInstance({}, Dog));`,
      },
      {
        title: "Three levels with Object.create",
        note: "dog -> animal -> living -> Object.prototype -> null. Each hasOwnProperty check only sees its own level.",
        code: `var living = {
  breathe: function () { return "breathe"; }
};

var animal = Object.create(living);
animal.speak = function () { return "sound"; };

var dog = Object.create(animal);
dog.bark = function () { return "woof"; };

console.log(dog.bark());
console.log(dog.speak());
console.log(dog.breathe());
console.log(dog.hasOwnProperty("bark"));
console.log(dog.hasOwnProperty("breathe"));
console.log(Object.getPrototypeOf(dog) === animal);
console.log(Object.getPrototypeOf(animal) === living);
console.log(Object.getPrototypeOf(living) === Object.prototype);
console.log(Object.getPrototypeOf(Object.prototype) === null);`,
      },
    ],
    checklist: [
      "Use Object.create(proto) to link without calling a constructor",
      "Use hasOwnProperty to separate own from inherited",
      "Walk with Object.getPrototypeOf one level at a time",
      "Remember the chain ends at null",
      "Repair constructor after replacing a prototype",
    ],
    realTalk:
      "Object.prototype is the last object in almost every chain, and its own prototype is null. That null is why reading missing properties gives undefined instead of looping forever.",
    quiz: [
      {
        q: "What is the prototype of Object.create(null)?",
        options: ["Object.prototype", "null", "undefined", "An empty object"],
        answer: 1,
        why: "Object.create(null) makes a dictionary object with no prototype at all.",
      },
      {
        q: "What does hasOwnProperty check?",
        options: ["The whole chain", "Only the object itself", "Only the prototype", "Only enumerable keys"],
        answer: 1,
        why: "It returns true only for properties defined directly on the receiver.",
      },
      {
        q: "How does a prototype chain end?",
        options: ["At Object.prototype", "At a function", "At null", "At undefined"],
        answer: 2,
        why: "Object.getPrototypeOf(Object.prototype) is null, and looking up a property there stops.",
      },
    ],
  },
  {
    id: 9,
    title: "Property Descriptors — defineProperty",
    goal: "Control property flags: writable, enumerable, configurable.",
    sugarReplaces: "obj.age = 21 (sugar for defineProperty with all flags true)",
    longDesc:
      "A normal assignment like obj.age = 21 is sugar for Object.defineProperty with writable, enumerable and configurable all set to true. When you call Object.defineProperty directly and only pass value, every missing flag defaults to false. That is why a non-enumerable property disappears from Object.keys and for-in loops, why a non-writable property silently ignores assignment in sloppy mode, and why a non-configurable property cannot be deleted or redefined.",
    realCode: `var person = new Object();
person.name = "Lydia";

Object.defineProperty(person, "age", {
  value: 21,
  writable: false,
  enumerable: false,
  configurable: false
});

console.log(person.name);
console.log(person.age);

var descriptor = Object.getOwnPropertyDescriptor(person, "age");
console.log(descriptor.value);
console.log(descriptor.writable);
console.log(descriptor.enumerable);
console.log(descriptor.configurable);

console.log(Object.keys(person));
console.log(person.hasOwnProperty("age"));
console.log(person.propertyIsEnumerable("age"));`,
    extraReal: `var person2 = new Object();
person2.name = "Lydia";
Object.defineProperty(person2, "age", {
  value: 21,
  writable: true,
  enumerable: true,
  configurable: true
});
console.log(Object.keys(person2));`,
    starter: `// Exercise: define a non-enumerable age property.
// Object.keys(person) should return only ["name"].
// person.age should still be readable as 21.

var person = new Object();
person.name = "Lydia";

// your defineProperty call here

console.log(Object.keys(person));
console.log(person.age);`,
    exercise:
      "Use Object.defineProperty to add a non-enumerable age property to person. Object.keys should return only [\"name\"], while person.age still reads as 21.",
    solutions: [
      {
        title: "Non-enumerable age",
        note: "With enumerable: false, Object.keys skips the property but direct access still works.",
        code: `var person = new Object();
person.name = "Lydia";

Object.defineProperty(person, "age", {
  value: 21,
  writable: true,
  enumerable: false,
  configurable: true
});

console.log(Object.keys(person));
console.log(person.age);
console.log(person.propertyIsEnumerable("age"));`,
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
console.log(config.version);
console.log(Object.keys(config));

delete config.version;
console.log(config.version);`,
      },
    ],
    checklist: [
      "Use Object.defineProperty to set flags explicitly",
      "Remember missing flags default to false",
      "Use Object.getOwnPropertyDescriptor to inspect",
      "Object.keys only lists enumerable own properties",
      "Normal assignment is sugar for all three flags true",
    ],
    realTalk:
      "obj.age = 21 is not magic. It is Object.defineProperty(obj, \"age\", { value: 21, writable: true, enumerable: true, configurable: true }) written in short form. The long form is what gives you control.",
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
    ],
  },
  {
    id: 10,
    title: "Modules Without import",
    goal: "Build private state and a public API with the IIFE module pattern.",
    sugarReplaces: "import / export, ES modules",
    longDesc:
      "Before import and export, a module was an immediately invoked function expression that returned an object. Variables declared inside the function are private because nothing outside can name them. The returned object is the public surface. One global per module, no bundler required, and the closure keeps the state alive.",
    realCode: `var Calculator = (function () {
  var privateVar = 0;
  var privateFn = function (x) {
    return x * 2;
  };
  return {
    add: function (a, b) {
      privateVar = privateVar + 1;
      return a + b;
    },
    double: function (x) {
      return privateFn(x);
    },
    getCalls: function () {
      return privateVar;
    }
  };
})();

console.log(Calculator.add(2, 3));
console.log(Calculator.getCalls());
console.log(Calculator.double(5));

var Store = (function () {
  var state = {};
  return {
    set: function (key, value) { state[key] = value; },
    get: function (key) { return state[key]; }
  };
})();

Store.set("theme", "dark");
console.log(Store.get("theme"));`,
    extraReal: `var CounterModule = (function () {
  var count = 0;
  function change(val) { count = count + val; }
  return {
    inc: function () { change(1); },
    dec: function () { change(-1); },
    value: function () { return count; }
  };
})();

CounterModule.inc();
CounterModule.inc();
CounterModule.dec();
console.log(CounterModule.value());
console.log(typeof CounterModule.count);`,
    starter: `// Exercise: build an EventBus module with private listeners.
// Expose on, off and emit. Do not expose the listeners object.

var EventBus = (function () {
  var listeners = {};

  return {
    on: function (event, fn) {
      // add fn to listeners[event]
      return this;
    },
    off: function (event, fn) {
      // remove fn
      return this;
    },
    emit: function (event, data) {
      // call every listener for event
    }
  };
})();

EventBus.on("data", function (value) {
  console.log("got " + value);
});
EventBus.emit("data", "hello");`,
    exercise:
      "Create a module EventBus with a private listeners array, exposing on(event, fn), off(event, fn) and emit(event, data). Use an IIFE and a closure.",
    solutions: [
      {
        title: "EventBus as an IIFE module",
        note: "listeners is unreachable from outside. The only mutations happen through the three methods that closed over it.",
        code: `var EventBus = (function () {
  var listeners = {};

  function listFor(event) {
    if (typeof listeners[event] !== "object" || listeners[event] === null) {
      listeners[event] = [];
    }
    return listeners[event];
  }

  return {
    on: function (event, fn) {
      var list = listFor(event);
      list[list.length] = fn;
      return this;
    },
    off: function (event, fn) {
      var list = listFor(event);
      var next = [];
      for (var i = 0; i < list.length; i = i + 1) {
        if (list[i] !== fn) { next[next.length] = list[i]; }
      }
      listeners[event] = next;
      return this;
    },
    emit: function (event, data) {
      var list = listFor(event);
      for (var i = 0; i < list.length; i = i + 1) {
        list[i](data);
      }
      return list.length;
    }
  };
})();

function onData(value) {
  console.log("got " + value);
}

EventBus.on("data", onData);
EventBus.emit("data", "hello");
EventBus.off("data", onData);
EventBus.emit("data", "ignored");
console.log(typeof EventBus.listeners);`,
      },
      {
        title: "A private key/value store",
        note: "state is cloned out through keys() rather than handed to the caller, so the private object stays private.",
        code: `var Store = (function () {
  var state = {};
  return {
    set: function (key, value) {
      state[key] = value;
      return value;
    },
    get: function (key) {
      return state[key];
    },
    keys: function () {
      return Object.keys(state);
    }
  };
})();

Store.set("theme", "dark");
Store.set("lang", "js");
console.log(Store.get("theme"));
console.log(Store.keys());
console.log(typeof Store.state);`,
      },
    ],
    checklist: [
      "Wrap the module in (function () { ... })()",
      "Keep private state in the closure",
      "Return only the public API object",
      "Do not expose the state object itself",
      "Assign the module to one global var",
    ],
    realTalk:
      "An IIFE module has no import resolution, no live bindings and no tree shaking. It is also still the clearest way to see what a module actually is: a function scope plus a returned object.",
    quiz: [
      {
        q: "Why does the IIFE pattern keep state private?",
        options: ["The variables are frozen", "Only the returned object is reachable outside", "The code is minified", "The engine hides var"],
        answer: 1,
        why: "The variables live in the IIFE's function scope. Outside code can only use what the returned object exposes.",
      },
      {
        q: "What should a module return?",
        options: ["All of its variables", "A public API object", "The function itself", "undefined"],
        answer: 1,
        why: "The returned object is the public surface. Everything not on it stays private.",
      },
      {
        q: "Can outside code read a private closure variable?",
        options: ["Yes, with window", "Yes, with Object.keys", "No, only through exposed functions", "Only in strict mode"],
        answer: 2,
        why: "Closure bindings are not properties of any reachable object.",
      },
    ],
  },
  {
    id: 11,
    title: "Building Real Things",
    goal: "Build an EventEmitter with prototype methods and no class keyword.",
    sugarReplaces: "class EventEmitter, extends, arrow handlers",
    longDesc:
      "This is the core of Node's EventEmitter, written with the primitives from the whole course. The constructor owns the storage, methods live on the prototype, emit forwards arguments with apply, and off rebuilds the listener array instead of splicing in place. The once wrapper removes itself before calling the real listener.",
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
    if (listeners[i] !== listener) {
      next[next.length] = listeners[i];
    }
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
  console.log("once " + value);
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
      "Extend EventEmitter with once(event, fn) that removes itself after the first call. Use prototypes and a closure wrapper, then build the DOM helper in the final project.",
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
  console.log("once " + value);
});
ee.emit("ready", 1);
ee.emit("ready", 2);
ee.emit("ready", 3);
console.log(ee.events.ready.length);`,
      },
      {
        title: "A tiny assertion harness",
        note: "Writing checks by hand is how you prove an emitter works before you trust it in a larger program.",
        code: `function assert(label, actual, expected) {
  if (actual === expected) {
    console.log("ok   " + label);
  } else {
    console.log("FAIL " + label + ": " + actual + " !== " + expected);
  }
}

function EventEmitter() { this.events = {}; }
EventEmitter.prototype.on = function (event, fn) {
  if (typeof this.events[event] !== "object") { this.events[event] = []; }
  this.events[event][this.events[event].length] = fn;
  return this;
};
EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var list = this.events[event];
  if (typeof list !== "object") { return false; }
  for (var i = 0; i < list.length; i = i + 1) { list[i].apply(this, args); }
  return true;
};

var ee = new EventEmitter();
var seen = "";
ee.on("x", function (value) { seen = value; });
assert("emit returns true", ee.emit("x", "yes"), true);
assert("listener received value", seen, "yes");
assert("unknown event returns false", ee.emit("nope"), false);
assert("two listeners", (function () {
  var count = 0;
  ee.on("y", function () { count = count + 1; });
  ee.on("y", function () { count = count + 1; });
  ee.emit("y");
  return count;
})(), 2);`,
      },
    ],
    checklist: [
      "Let the constructor own the storage",
      "Put every method on the prototype",
      "Forward emit arguments with apply",
      "Rebuild the listener array in off",
      "Register the wrapper, not the original, in once",
    ],
    realTalk:
      "Node's EventEmitter has more methods and a few more edge cases, but the core is exactly this lesson: an object of arrays and a loop that applies each listener.",
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
    ],
  },
];

export const LESSON_MAP = (function () {
  var map = {};
  for (var i = 0; i < LESSONS.length; i = i + 1) {
    map[LESSONS[i].id] = LESSONS[i];
  }
  return map;
})();

export function getLesson(id) {
  return LESSON_MAP[Number(id)] || null;
}
