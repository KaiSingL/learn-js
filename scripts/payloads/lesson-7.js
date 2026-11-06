export default {
  id: 7,
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
        options: [
          "Both object keys, converted",
          '["[object Object]"] — both objects became the same string key',
          "An error — objects cannot be keys",
          "[] — objects are not enumerable",
        ],
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
  quizTags: [
    "== coerces, === does not",
    "== coerces, === does not",
    "Object keys are always strings",
    "ToPrimitive: valueOf first for +, toString first for strings",
    "== unwraps wrapper objects against primitives",
  ],
  extraQuiz: [
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
};
