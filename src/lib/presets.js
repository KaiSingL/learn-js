import { LESSONS } from "../data/lessons.js";
import { PROJECT_STEPS } from "../data/project.js";

const EXAMPLES = [
  {
    id: "example-proto",
    label: "Prototype example",
    note: "A constructor, two instances and one shared method.",
    code: `function Dog(name) {
  this.name = name;
}

Dog.prototype.bark = function () {
  return "Woof " + this.name;
};

var d = new Dog("Rex");
var e = new Dog("Luna");

console.log(d.bark());
console.log(e.bark());
console.log(d.hasOwnProperty("bark"));
console.log(Object.getPrototypeOf(d) === Dog.prototype);`,
  },
  {
    id: "example-closure",
    label: "Closure counter",
    note: "Two counters that never share state.",
    code: `var makeCounter = function () {
  var count = 0;
  var inc = function () {
    count = count + 1;
    return count;
  };
  var get = function () {
    return count;
  };
  return { inc: inc, get: get };
};

var c1 = makeCounter();
console.log(c1.inc());
console.log(c1.inc());
console.log(c1.inc());
console.log(c1.get());

var c2 = makeCounter();
console.log(c2.inc());`,
  },
  {
    id: "example-map",
    label: "Manual map and filter",
    note: "The loops that the array methods hide.",
    code: `var arr = [1, 2, 3, 4, 5];

function map(array, fn) {
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

var doubled = map(arr, function (x) { return x * 2; });
var big = filter(doubled, function (x) { return x > 5; });

console.log(doubled);
console.log(big);`,
  },
  {
    id: "example-dom",
    label: "DOM without a library",
    note: "Switch to Preview to see it build a small counter.",
    code: `var app = document.getElementById("app");

var title = document.createElement("h2");
title.textContent = "Built with the DOM";
app.appendChild(title);

var row = document.createElement("div");
row.className = "row";
app.appendChild(row);

var button = document.createElement("button");
button.type = "button";
button.textContent = "increment";
row.appendChild(button);

var output = document.createElement("span");
output.className = "value";
output.textContent = "0";
row.appendChild(output);

var count = 0;
button.addEventListener("click", function () {
  count = count + 1;
  output.textContent = String(count);
});

console.log("preview ready");`,
  },
];

function buildLessonPresets() {
  const presets = [];
  for (let i = 0; i < LESSONS.length; i += 1) {
    const lesson = LESSONS[i];
    presets[presets.length] = {
      id: "lesson-" + lesson.id + "-starter",
      label: "Lesson " + lesson.id + " — starter",
      note: lesson.goal,
      code: lesson.starter,
    };
    for (let s = 0; s < lesson.solutions.length; s += 1) {
      presets[presets.length] = {
        id: "lesson-" + lesson.id + "-solution-" + (s + 1),
        label: "Lesson " + lesson.id + " — solution " + (s + 1),
        note: lesson.solutions[s].title,
        code: lesson.solutions[s].code,
      };
    }
  }
  return presets;
}

function buildProjectPresets() {
  return PROJECT_STEPS.map(function (step) {
    return {
      id: "project-" + step.id,
      label: "Step " + step.id + " — " + step.title,
      note: step.goal,
      code: step.code,
    };
  });
}

const LESSON_PRESETS = buildLessonPresets();
const PROJECT_PRESETS = buildProjectPresets();

export const PRESET_GROUPS = [
  { id: "examples", label: "Examples", presets: EXAMPLES },
  { id: "lessons", label: "Lessons", presets: LESSON_PRESETS },
  { id: "project", label: "Final project", presets: PROJECT_PRESETS },
];

export const PRESETS = (function () {
  const all = [];
  for (let g = 0; g < PRESET_GROUPS.length; g += 1) {
    const group = PRESET_GROUPS[g];
    for (let p = 0; p < group.presets.length; p += 1) {
      all[all.length] = group.presets[p];
    }
  }
  return all;
})();

export function getPreset(id) {
  for (let i = 0; i < PRESETS.length; i += 1) {
    if (PRESETS[i].id === id) return PRESETS[i];
  }
  return null;
}

export const DEFAULT_PRESET = EXAMPLES[0];

export const PREVIEW_HTML =
  '<div class="row"><button id="inc" type="button">increment</button><span id="count" class="value">0</span></div><p class="muted">A preview runs real DOM code inside an isolated frame.</p>';
