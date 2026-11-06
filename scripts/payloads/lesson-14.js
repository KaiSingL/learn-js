export default {
  id: 14,
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
        q: 'After a shallow copy, renaming shallow.name to "Alan" — what does original.name read?',
        options: [
          "Ada — primitives copied by value into the new shell",
          "Alan — the names are linked",
          "undefined",
          "An error",
        ],
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
        options: [
          "JSON.stringify only writes what JSON can represent — functions are not",
          "Functions are private",
          "JSON runs the function first",
          "run was not enumerable",
        ],
        answer: 0,
        why: "JSON has no way to represent a function or undefined, so stringify skips them. A deep copy keeps every key — the JSON shortcut is a format conversion, not a copy.",
      },
    },
  ],
  quizTags: [
    "= shares the shell",
    "A shallow copy builds a new shell, same branches",
    "A deep copy clones every branch",
    "JSON.parse(JSON.stringify) is not a deep copy",
  ],
  extraQuiz: [
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
      q: 'deepCopy starts with if (value === null || typeof value !== "object") — why is the null check needed first?',
      options: [
        'typeof null is "object" — the famous bug would send null down the clone path',
        "null cannot be compared",
        "null is always an object",
        "Order does not matter",
      ],
      answer: 0,
      why: "Lesson 1's bug: typeof null answers \"object\". Without the null check first, deepCopy(null) would try to clone it as an object. Old bugs shape new code.",
      tests: "typeof reads the type — with one famous bug",
    },
  ],
};
