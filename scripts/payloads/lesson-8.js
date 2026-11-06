export default {
  id: 8,
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
        q: 'indexOf(["a", "b", "c"], "b") — how many comparisons run before the return?',
        options: [
          "Two — the loop exits at the first match",
          "Three — the array is always fully walked",
          "One — strings compare instantly",
          "Zero — indexOf is built in",
        ],
        answer: 0,
        why: "The early return fires when i is 1, after two comparisons. A full walk would run three — writing the loop makes the exit visible and controllable.",
      },
    },
  ],
  quizTags: [
    "map is a loop that allocates a new array",
    "A new array starts empty and grows by index",
    "Early return is the exit a method hides",
  ],
  extraQuiz: [
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
};
