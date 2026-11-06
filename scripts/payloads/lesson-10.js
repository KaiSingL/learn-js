export default {
  id: 10,
  intro:
    "JavaScript executes one stack at a time. Statements run in order, functions push and pop — and setTimeout never jumps the line: its callback is queued and waits until the stack is empty. The loop-and-timer surprises are all one rule plus one shared var binding.",
  concepts: [
    {
      heading: "JavaScript runs one stack at a time",
      text: "The engine executes one thing at a time: the call stack. Statements run top to bottom, functions push and pop, and nothing interleaves. Two console.log lines run in the order they appear, no matter what timers sit between them.",
      purpose: "Watch the timer's position in the code fail to change the print order.",
      code: `console.log("First");

setTimeout(function () {
  console.log("Second"); // queued, not run here
}, 0);

console.log("Third"); // runs before the queued callback`,
    },
    {
      heading: "setTimeout queues work for when the stack is empty",
      text: "setTimeout does not run the function after exactly 0ms. It hands the callback to the timer system, and when the stack empties, the event loop moves the callback onto the stack. The wait is until the stack is free — not a precise delay.",
      purpose: "Watch the queued callback land after all synchronous code, whatever the delay.",
      code: `console.log("start");

setTimeout(function () {
  console.log("queued — the stack was empty");
}, 0);

console.log("end");
// -> start
// -> end
// -> queued — the stack was empty`,
      check: {
        q: "When does a setTimeout(fn, 0) callback actually run?",
        options: [
          "After 0 milliseconds, precisely",
          "When the call stack is empty",
          "In parallel with the stack",
          "Only on the next user click",
        ],
        answer: 1,
        why: "The callback is queued and waits for the stack to empty. 0 is a minimum suggestion, not a precise schedule.",
      },
    },
    {
      heading: "var in a loop is one binding for every timer",
      text: "The for loop's var is created once, and the loop finishes before any timer runs. By queue time, i is 3 — and all three queued callbacks share that one binding, so they all print 3.",
      purpose: "Watch three queued callbacks all read the loop's final value.",
      code: `for (var i = 0; i < 3; i = i + 1) {
  setTimeout(function () {
    console.log("i = " + i);
  }, 0);
}
console.log("done");
// -> done
// -> i = 3
// -> i = 3
// -> i = 3 — one binding, read after the loop`,
    },
    {
      heading: "An IIFE freezes the value before queueing",
      text: "Capturing i with an immediately invoked function creates a fresh binding per iteration while the loop is still running. The timer's callback closes over its own j, so each queued print gets its own number.",
      purpose: "Watch three timers each deliver their own number.",
      code: `for (var i = 0; i < 3; i = i + 1) {
  (function (j) {
    setTimeout(function () {
      console.log("j = " + j);
    }, 0);
  })(i);
}
console.log("done");
// -> done
// -> j = 0
// -> j = 1
// -> j = 2`,
      check: {
        q: "Why does the IIFE version print 0, 1, 2 from the queue?",
        options: [
          "Each iteration froze its own j while the loop was still running",
          "The timers fire in value order by luck",
          "j re-reads i when the callback runs",
          "setTimeout copies the closure",
        ],
        answer: 0,
        why: "The IIFE runs during the loop, creating a fresh j per iteration. By queue time each callback has its own binding — the lesson 2 capture, applied to timers.",
      },
    },
  ],
  quizTags: [
    "JavaScript runs one stack at a time",
    "var in a loop is one binding for every timer",
    "setTimeout queues work for when the stack is empty",
  ],
  extraQuiz: [
    {
      q: "If a queued callback assigns summary = i (no var anywhere), where does summary land?",
      options: [
        "On the global object — assignments walk out of any function, queued or not",
        "Inside the timer's private scope",
        "Into the task queue",
        "Nowhere — queued code cannot assign",
      ],
      answer: 0,
      why: "Queued or not, the callback is a function and the assignment rule from lesson 1 applies: no var means the global object.",
      tests: "= without var creates a global",
    },
  ],
};
