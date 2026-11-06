export default {
  id: 6,
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
        options: [
          "A value — that was provided",
          "writable, enumerable and configurable — all default to false",
          "Its spot in memory",
          "A prototype link",
        ],
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
  quizTags: [
    "Object.keys lists enumerable own properties only",
    "Missing flags default to false",
    "Accessors are get and set instead of value and writable",
  ],
  extraQuiz: [
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
};
