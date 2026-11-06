export default {
  id: 13,
  intro:
    "The capstone: an EventEmitter and a promise built from the primitives the whole course taught. The constructor owns storage, the prototype owns methods, apply forwards arguments, closures remember state, and a promise is just a one-way state machine with a reaction list. Nothing here is new — it is everything, assembled.",
  concepts: [
    {
      heading: "The constructor owns storage; the prototype owns methods",
      text: "EventEmitter starts with the split every prototype lesson teaches: this.events = {} in the constructor gives each emitter its own listener map, while on, off and emit live on the prototype — one shared copy for all emitters.",
      purpose: "Watch two emitters keep separate listener maps through shared methods.",
      code: `function Emitter() {
  this.events = {};
}
Emitter.prototype.on = function (event, listener) {
  var list = this.events[event];
  if (typeof list !== "object") {
    list = [];
    this.events[event] = list;
  }
  list[list.length] = listener;
  return this;
};

var a = new Emitter();
var b = new Emitter();
a.on("ping", function () {});
console.log(a.events.ping.length); // -> 1
console.log(b.events.ping); // -> undefined — b has its own map`,
    },
    {
      heading: "emit forwards arguments with apply",
      text: "emit receives the extra arguments inside arguments — the array-like from lesson 3. slice.call grabs everything after the event name, and apply spreads it into each listener. apply exists for exactly this job.",
      purpose: "Watch three extra arguments reach a listener intact.",
      code: `function Emitter() {
  this.events = {};
}
Emitter.prototype.on = function (event, listener) {
  var list = this.events[event];
  if (typeof list !== "object") { list = []; this.events[event] = list; }
  list[list.length] = listener;
};
Emitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1); // drop the event name
  var listeners = this.events[event];
  if (typeof listeners !== "object") { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args); // spread into each listener
  }
  return true;
};

var ee = new Emitter();
ee.on("order", function (item, count, note) {
  console.log(item + " x" + count + " (" + note + ")");
});
ee.emit("order", "coffee", 2, "urgent"); // -> coffee x2 (urgent)`,
    },
    {
      heading: "off rebuilds the list instead of splicing",
      text: "Removing while iterating shifts indexes under your feet. off avoids the whole problem by building a next array with every listener that is NOT the one being removed, then swapping it in. Removal becomes one visible pass.",
      purpose: "Watch removal build a new list and leave the original untouched.",
      code: `function keepNot(list, removed) {
  var next = [];
  for (var i = 0; i < list.length; i = i + 1) {
    if (list[i] !== removed) {
      next[next.length] = list[i];
    }
  }
  return next;
}

var listeners = [1, 2, 3];
console.log(keepNot(listeners, 2)); // -> [1, 3]
console.log(listeners); // -> [1, 2, 3] — rebuilt, not mutated`,
    },
    {
      heading: "once registers a wrapper that removes itself",
      text: "once cannot know the future — so it registers a wrapper instead of the listener. The wrapper runs, calls off with its own reference to remove itself, then invokes the real listener. Self-removal needs a reference to itself: the wrapper has one.",
      purpose: "Watch the listener fire exactly once, then the list drain to empty.",
      code: `var bus = {
  listeners: [],
  run: function () {
    for (var i = 0; i < this.listeners.length; i = i + 1) { this.listeners[i](); }
  },
  on: function (fn) { this.listeners[this.listeners.length] = fn; },
  off: function (fn) {
    var next = [];
    for (var i = 0; i < this.listeners.length; i = i + 1) {
      if (this.listeners[i] !== fn) { next[next.length] = this.listeners[i]; }
    }
    this.listeners = next;
  },
  once: function (fn) {
    var self = this;
    var wrapper = function () { self.off(wrapper); fn(); };
    this.on(wrapper); // register the wrapper, not the listener
  }
};

bus.once(function () { console.log("only once"); });
bus.run();
bus.run();
console.log(bus.listeners.length); // -> 0 — the wrapper removed itself
// -> only once`,
      check: {
        q: "Why does once register wrapper instead of fn?",
        options: [
          "The wrapper can remove itself by name before calling fn — self-removal needs a reference to itself",
          "Wrappers run faster",
          "fn cannot be stored in arrays",
          "To prevent other listeners from being called",
        ],
        answer: 0,
        why: "off needs the exact reference to remove. Since the wrapper holds its own reference, it can take itself off the list and then invoke the real listener — exactly once.",
      },
    },
    {
      heading: "A manual promise: state, reactions, resolve",
      text: "Strip a promise to its engine: a state (\"pending\" or \"fulfilled\"), a stored value, and resolve — a function that flips the state once and remembers the value. then either waits in the reaction list or reads the stored value. Everything else grows from these pieces.",
      purpose: "Watch the state flip exactly once and the reaction read the stored value.",
      code: `function TinyPromise(executor) {
  var state = "pending";
  var value = null;
  var reactions = [];

  function resolve(result) {
    if (state !== "pending") return; // resolve wins once, forever
    state = "fulfilled";
    value = result;
    for (var i = 0; i < reactions.length; i = i + 1) {
      reactions[i](value);
    }
  }

  this.then = function (onFulfilled) {
    if (state === "fulfilled") {
      onFulfilled(value);
    } else {
      reactions[reactions.length] = onFulfilled;
    }
  };

  executor(resolve);
}

var p = new TinyPromise(function (resolve) {
  resolve("tiny");
  resolve("ignored"); // second resolve is a no-op
});

p.then(function (value) {
  console.log(value); // -> tiny
});`,
      check: {
        q: 'What does the second resolve("ignored") do?',
        options: [
          "Nothing — the state already left pending, and resolve wins once",
          'Overwrites the value with "ignored"',
          "Throws an error",
          "Re-runs all reactions",
        ],
        answer: 0,
        why: 'The guard state !== "pending" makes resolve one-way: first call wins. That one-way state is what makes promises predictable.',
      },
    },
    {
      heading: "try marks the risk; catch recovers; finally always runs",
      text: "try wraps the risky call. catch receives whatever was thrown and turns it into a controlled response. finally runs no matter how the try block exited — success, caught error, even a return in flight. Custom error types are plain constructors with Error.prototype as their prototype.",
      purpose: "Watch three inputs take three paths — and finally run on all of them.",
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
    throw new RangeError("negative: " + value);
  }
  return value;
}

function readAge(raw) {
  try {
    console.log("parsed " + parseAge(raw));
  } catch (err) {
    console.log(err.name + ": " + err.message);
  } finally {
    console.log("finished with " + raw);
  }
}

readAge("42");
readAge("abc");
readAge("-3");
// -> parsed 42
// -> finished with 42
// -> ValidationError: not a number: abc
// -> finished with abc
// -> RangeError: negative: -3
// -> finished with -3`,
    },
  ],
  quizTags: [
    "emit forwards arguments with apply",
    "off rebuilds the list instead of splicing",
    "once registers a wrapper that removes itself",
    "try marks the risk; catch recovers; finally always runs",
  ],
  extraQuiz: [
    {
      q: "Inside bus.once's wrapper, why call self.off(wrapper) instead of this.off(wrapper)?",
      options: [
        "The wrapper runs as a plain call — this would not be the bus; self was captured while it was correct",
        "this is undefined inside object methods",
        "off only accepts captured references",
        "self is faster than this",
      ],
      answer: 0,
      why: "The wrapper is invoked as a plain function, so its this would have no home. var self = this froze the bus reference while the method call was still active — the lesson 4 capture pattern.",
      tests: "var self = this keeps the call site's this",
    },
    {
      q: "parseAge uses value !== value to detect Number(\"abc\") because...",
      options: [
        "Number(\"abc\") is NaN, and NaN is the only value unequal to itself",
        "value is a string",
        "!== compares more strictly than !=",
        "Number() returns undefined on failure",
      ],
      answer: 0,
      why: "Number(\"abc\") produces NaN, and the lesson 1 rule applies: NaN fails every equality check including against itself. The self-check is the only reliable detector.",
      tests: "NaN is the number that is not equal to itself",
    },
  ],
};
