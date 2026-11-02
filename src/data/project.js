// The final project: build the emitter from lesson 10, then a DOM helper with
// the same rules, and connect them. Each step is runnable.
export const PROJECT_STEPS = [
  {
    id: 1,
    title: "Store and subscribe",
    goal: "Give the emitter one private-looking storage object and an on method on the prototype.",
    note: "The constructor owns the state. Every instance gets its own events object, which is why two emitters never share listeners.",
    code: `function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener) {
  if (typeof this.events[event] !== "object" || this.events[event] === null) {
    this.events[event] = [];
  }
  this.events[event][this.events[event].length] = listener;
  return this;
};

var ee = new EventEmitter();
ee.on("data", function (value) {
  console.log("listener saw " + value);
});
console.log(Object.keys(ee.events));
console.log(ee.events.data.length);`,
    checkpoint: "ee.events should be an object with a data array containing one function.",
  },
  {
    id: 2,
    title: "Emit with real arguments",
    goal: "Call every listener with the emitter as this and forward the remaining arguments.",
    note: "arguments is array-like, so Array.prototype.slice.call turns the tail into a real array before apply spreads it.",
    code: `function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener) {
  if (typeof this.events[event] !== "object" || this.events[event] === null) {
    this.events[event] = [];
  }
  this.events[event][this.events[event].length] = listener;
  return this;
};

EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.events[event];
  if (typeof listeners !== "object" || listeners === null) { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args);
  }
  return true;
};

var ee = new EventEmitter();
ee.on("sum", function (a, b) {
  console.log(this === ee, a + b);
});
ee.emit("sum", 2, 3);
ee.emit("sum", 10, 5);
console.log(ee.emit("missing"));`,
    checkpoint: "The listener should print true and the correct sum, and the unknown event should return false.",
  },
  {
    id: 3,
    title: "Remove and run once",
    goal: "Add off and once without breaking the listener order.",
    note: "off rebuilds the array instead of splicing, and once registers a wrapper that removes itself first.",
    code: `function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener) {
  if (typeof this.events[event] !== "object" || this.events[event] === null) {
    this.events[event] = [];
  }
  this.events[event][this.events[event].length] = listener;
  return this;
};

EventEmitter.prototype.off = function (event, listener) {
  if (typeof this.events[event] !== "object" || this.events[event] === null) {
    return this;
  }
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
  if (typeof listeners !== "object" || listeners === null) { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args);
  }
  return true;
};

EventEmitter.prototype.once = function (event, listener) {
  var self = this;
  var wrapper = function () {
    self.off(event, wrapper);
    listener.apply(self, arguments);
  };
  this.on(event, wrapper);
  return this;
};

var ee = new EventEmitter();
var total = 0;
ee.on("tick", function (n) { total = total + n; });
ee.emit("tick", 1);
ee.emit("tick", 2);
console.log("total " + total);
ee.once("ready", function (n) { console.log("ready " + n); });
ee.emit("ready", 1);
ee.emit("ready", 2);
console.log("ready listeners " + ee.events.ready.length);`,
    checkpoint: "total is 3, ready prints once, and ready listeners is 0 after the first emit.",
  },
  {
    id: 4,
    title: "A DOM helper with no shortcuts",
    goal: "Write the five functions the project needs instead of pulling in a library.",
    note: "Each helper wraps one DOM API and nothing else. Returning the node makes them chainable; getter/setter overloads keep the call sites short.",
    code: `function $(selector, root) {
  var scope = root || document;
  return scope.querySelector(selector);
}

function on(node, event, handler) {
  node.addEventListener(event, handler);
  return function () {
    node.removeEventListener(event, handler);
  };
}

function text(node, value) {
  if (value === undefined) { return node.textContent; }
  node.textContent = value;
  return node;
}

function attr(node, name, value) {
  if (value === undefined) { return node.getAttribute(name); }
  node.setAttribute(name, value);
  return node;
}

function el(tag, className) {
  var node = document.createElement(tag);
  if (className !== undefined) { node.className = className; }
  return node;
}

var node = el("div", "demo");
text(node, "built with document.createElement");
attr(node, "data-mode", "real");
document.getElementById("app").appendChild(node);
console.log(node.outerHTML);
console.log(text(node));
console.log(attr(node, "data-mode"));`,
    checkpoint: "The element prints as a div with class demo, text content and a data-mode attribute.",
    previewHtml: "",
    preview: true,
  },
  {
    id: 5,
    title: "Wire the emitter to the page",
    goal: "Connect the event bus to real DOM events with on() and update the page with text().",
    note: "The button only emits an event. The counter listens for it. That separation is the point: the DOM helper does not know what an emitter is, and the emitter does not know what a button is.",
    code: `function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener) {
  if (typeof this.events[event] !== "object" || this.events[event] === null) {
    this.events[event] = [];
  }
  this.events[event][this.events[event].length] = listener;
  return this;
};

EventEmitter.prototype.emit = function (event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.events[event];
  if (typeof listeners !== "object" || listeners === null) { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args);
  }
  return true;
};

function $(selector, root) {
  var scope = root || document;
  return scope.querySelector(selector);
}

function on(node, event, handler) {
  node.addEventListener(event, handler);
  return function () {
    node.removeEventListener(event, handler);
  };
}

function text(node, value) {
  if (value === undefined) { return node.textContent; }
  node.textContent = value;
  return node;
}

var bus = new EventEmitter();
var count = 0;
var output = $("#count");
var button = $("#inc");

bus.on("inc", function (value) {
  text(output, String(value));
});

on(button, "click", function () {
  count = count + 1;
  bus.emit("inc", count);
});

console.log("ready - click the button");`,
    checkpoint: "Clicking the button increments the number, and the emitter is the only channel between the click and the text update.",
    previewHtml: `<div class="row">
  <button id="inc" type="button">increment</button>
  <span id="count" class="value">0</span>
</div>
<p class="muted">The click emits an event. The text update is a listener.</p>`,
    preview: true,
  },
  {
    id: 6,
    title: "The full reference",
    goal: "Run the complete emitter and DOM helper together, with assertions instead of eyeballing.",
    note: "This is the finished project. The assertions are plain functions and === comparisons, so the harness follows the same rules as the code it checks.",
    code: `function EventEmitter() {
  this.events = {};
}

EventEmitter.prototype.on = function (event, listener) {
  if (typeof this.events[event] !== "object" || this.events[event] === null) {
    this.events[event] = [];
  }
  this.events[event][this.events[event].length] = listener;
  return this;
};

EventEmitter.prototype.off = function (event, listener) {
  if (typeof this.events[event] !== "object" || this.events[event] === null) {
    return this;
  }
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
  if (typeof listeners !== "object" || listeners === null) { return false; }
  for (var i = 0; i < listeners.length; i = i + 1) {
    listeners[i].apply(this, args);
  }
  return true;
};

EventEmitter.prototype.once = function (event, listener) {
  var self = this;
  var wrapper = function () {
    self.off(event, wrapper);
    listener.apply(self, arguments);
  };
  this.on(event, wrapper);
  return this;
};

function $(selector, root) {
  var scope = root || document;
  return scope.querySelector(selector);
}

function on(node, event, handler) {
  node.addEventListener(event, handler);
  return function () {
    node.removeEventListener(event, handler);
  };
}

function text(node, value) {
  if (value === undefined) { return node.textContent; }
  node.textContent = value;
  return node;
}

function attr(node, name, value) {
  if (value === undefined) { return node.getAttribute(name); }
  node.setAttribute(name, value);
  return node;
}

function el(tag, className) {
  var node = document.createElement(tag);
  if (className !== undefined) { node.className = className; }
  return node;
}

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log("ok   " + label);
  } else {
    console.log("FAIL " + label + ": " + actual + " !== " + expected);
  }
}

var bus = new EventEmitter();
var count = 0;

bus.on("inc", function (value) {
  count = value;
});

assert("emit returns true", bus.emit("inc", 1), true);
assert("listener received 1", count, 1);
assert("two listeners", (function () {
  var calls = 0;
  bus.on("pair", function () { calls = calls + 1; });
  bus.on("pair", function () { calls = calls + 1; });
  bus.emit("pair");
  return calls;
})(), 2);

bus.once("ready", function (value) {
  count = value;
});
assert("once emits", bus.emit("ready", 9), true);
assert("once updated count", count, 9);
assert("once removed itself", bus.events.ready.length, 0);
assert("unknown event", bus.emit("missing"), false);

var note = el("p", "note");
text(note, "the DOM helper works too");
attr(note, "data-source", "learn-js");
assert("text set", text(note), "the DOM helper works too");
assert("attr set", attr(note, "data-source"), "learn-js");
assert("node type", note.nodeName, "P");

console.log("harness complete");`,
    checkpoint: "Every line prints ok and the final line is harness complete. If one fails, the assertion tells you which contract broke.",
  },
];

export const PROJECT_MAP = (function () {
  var map = {};
  for (var i = 0; i < PROJECT_STEPS.length; i = i + 1) {
    map[PROJECT_STEPS[i].id] = PROJECT_STEPS[i];
  }
  return map;
})();
