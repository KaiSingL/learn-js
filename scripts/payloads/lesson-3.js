export default {
  id: 3,
  intro:
    "A function is an object with one extra ability: it can be called. That single fact explains why functions can carry properties, live in variables, travel as values — and why every real function carries an arguments object holding the values that actually arrived.",
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
        options: [
          "The whole function",
          "Only the variable double, as undefined",
          "Nothing — expressions do not hoist at all",
          "The function without a name",
        ],
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
        options: [
          "3 — the internal count is protected",
          "101 — count is an ordinary property anyone can change",
          "100 — the call resets it",
          "undefined — the function broke",
        ],
        answer: 1,
        why: "Properties on a function are as public as on any object. Nothing hides them — which is why closures (lesson 2) are the privacy mechanism when you need one.",
      },
    },
  ],
  quizTags: [
    "A function is a callable object",
    "Declarations hoist; expressions do not",
    "arguments is array-like, not an Array",
  ],
  extraQuiz: [
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
};
