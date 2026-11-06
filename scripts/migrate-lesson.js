// One lesson per run: bun scripts/migrate-lesson.js scripts/payloads/lesson-2.js
// Reads a payload module (intro, concepts, quizTags, extraQuiz), replaces the
// lesson's legacy longDesc/realCode/extraReal block with the concept shape,
// tags every existing quiz item, and appends the cumulative quiz items.
// Guards: exactly one lesson slice, exactly one legacy block, bounded size,
// exact quiz-item count, backtick-free concept code.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const payloadPath = process.argv[2];
if (!payloadPath) throw new Error("usage: bun scripts/migrate-lesson.js <payload.js>");
const { default: payload } = await import(pathToFileURL(resolve(process.cwd(), payloadPath)).href);
if (!payload.id || !payload.intro || !Array.isArray(payload.concepts)) {
  throw new Error("payload needs id, intro, concepts");
}
if (!Array.isArray(payload.quizTags) || !Array.isArray(payload.extraQuiz)) {
  throw new Error("payload needs quizTags and extraQuiz");
}

const filePath = new URL("../src/data/lessons.js", import.meta.url);
// Normalize CRLF -> LF for matching; the file is written back as LF (git
// normalizes line endings anyway, so this produces no content diff).
let text = readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");

// 1. Locate this lesson's slice (start marker up to the next lesson's start).
const startMarker = "\n  {\n    id: " + payload.id + ",";
const start = text.indexOf(startMarker);
if (start === -1) throw new Error("lesson " + payload.id + " start not found");
let end = text.indexOf("\n  {\n    id: ", start + startMarker.length);
if (end === -1) end = text.length;
const slice = text.slice(start, end);
if (slice.indexOf("intro:") !== -1) throw new Error("lesson " + payload.id + " already migrated");

// 2. Replace the legacy longDesc/realCode/extraReal block.
const legacyPattern =
  /\r?\n    longDesc:\r?\n      "[\s\S]*?",\r?\n    realCode: `[\s\S]*?`,\r?\n(?:\r?\n)?    extraReal: `[\s\S]*?`,/;
const legacyMatches = slice.match(legacyPattern);
if (!legacyMatches || legacyMatches.length !== 1) {
  throw new Error(
    "lesson " + payload.id + " legacy block: expected 1 match, found " + (legacyMatches ? legacyMatches.length : 0)
  );
}
if (legacyMatches[0].length > 16000) {
  throw new Error("lesson " + payload.id + " legacy block too large: " + legacyMatches[0].length);
}

function assertEmbeddable(code, where) {
  if (code.indexOf("`") !== -1) throw new Error(where + " contains a backtick");
  if (code.indexOf("${") !== -1) throw new Error(where + " contains ${");
}

function conceptSource(concept) {
  assertEmbeddable(concept.code, "concept '" + concept.heading + "'");
  let out = "      {\n";
  out += "        heading: " + JSON.stringify(concept.heading) + ",\n";
  out += "        text: " + JSON.stringify(concept.text) + ",\n";
  out += "        purpose: " + JSON.stringify(concept.purpose) + ",\n";
  out += "        code: `" + concept.code + "`,\n";
  if (concept.diagram) out += "        diagram: " + JSON.stringify(concept.diagram) + ",\n";
  if (concept.check) {
    out += "        check: {\n";
    out += "          q: " + JSON.stringify(concept.check.q) + ",\n";
    out += "          options: " + JSON.stringify(concept.check.options) + ",\n";
    out += "          answer: " + concept.check.answer + ",\n";
    out += "          why: " + JSON.stringify(concept.check.why) + ",\n";
    out += "        },\n";
  }
  out += "      },";
  return out;
}

const replacement =
  "\n    intro:\n      " +
  JSON.stringify(payload.intro) +
  ",\n" +
  "    concepts: [\n" +
  payload.concepts.map(conceptSource).join("\n") +
  "\n    ],";

let newSlice = slice.replace(legacyPattern, replacement);

// 3. Tag every existing quiz item in order.
const quizStart = newSlice.indexOf("\n    quiz: [");
if (quizStart === -1) throw new Error("quiz region not found");
const quizEnd = newSlice.indexOf("\n    ],", quizStart);
if (quizEnd === -1) throw new Error("quiz region end not found");
const quizSlice = newSlice.slice(quizStart, quizEnd);

const itemPattern = /\n      \{\n        q: [\s\S]*?\n      \},/g;
const items = quizSlice.match(itemPattern);
if (!items || items.length !== payload.quizTags.length) {
  throw new Error(
    "lesson " + payload.id + " quiz items: found " + (items ? items.length : 0) +
      ", expected " + payload.quizTags.length
  );
}

let itemIndex = 0;
const taggedQuizSlice = quizSlice.replace(itemPattern, function (item) {
  const tag = payload.quizTags[itemIndex];
  itemIndex += 1;
  const cut = item.lastIndexOf("\n      },");
  return item.slice(0, cut) + "\n        tests: " + JSON.stringify(tag) + "," + item.slice(cut);
});

// 4. Append the cumulative quiz items before the quiz array's closing.
function quizItemSource(item) {
  let out = "      {\n";
  out += "        q: " + JSON.stringify(item.q) + ",\n";
  out += "        options: [\n";
  item.options.forEach(function (option) {
    out += "          " + JSON.stringify(option) + ",\n";
  });
  out += "        ],\n";
  out += "        answer: " + item.answer + ",\n";
  out += "        why: " + JSON.stringify(item.why) + ",\n";
  out += "        tests: " + JSON.stringify(item.tests) + ",\n";
  out += "      },";
  return out;
}

const finalQuizSlice = taggedQuizSlice.replace(
  /\n    \],$/,
  (payload.extraQuiz.length > 0 ? "\n" + payload.extraQuiz.map(quizItemSource).join("\n") : "") +
    "\n    ],"
);

const finalSlice =
  newSlice.slice(0, quizStart) + finalQuizSlice + newSlice.slice(quizStart + quizSlice.length);

// 5. Reassemble and write.
text = text.slice(0, start) + finalSlice + text.slice(end);
writeFileSync(filePath, text);
console.log(
  "lesson " + payload.id + ": " + payload.concepts.length + " concepts, " +
    payload.quizTags.length + " quiz items tagged, " + payload.extraQuiz.length + " cumulative items added"
);
