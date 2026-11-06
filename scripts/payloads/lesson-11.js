export default {
  id: 11,
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
        options: [
          "Immediately, during new Promise",
          "When then is first called",
          "When resolve is defined",
          "After the microtask queue drains",
        ],
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
        options: [
          "The first callback returned delay's promise, so the chain settles with it",
          "then adds a fixed 10ms wait",
          "The second then polls the first promise",
          "Delays always run in declaration order",
        ],
        answer: 0,
        why: "A then callback that returns a promise hands that promise's outcome to the next then. The chain waits — that is the whole mechanism await was built on.",
      },
    },
  ],
  quizTags: [
    "then returns a new promise",
    "catch is then with only a failure handler",
    "Returning a promise from then makes the chain wait",
  ],
  extraQuiz: [
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
};
