// Sandbox sweep: runs every concept snippet, starter and solution of the
// given lessons (default: all) through the real playground worker sandbox
// and asserts none of them throw. Usage:
//   bun run build && bun scripts/verify-sandbox.js          (all lessons)
//   bun scripts/verify-sandbox.js 2 5                       (lesson ids)
import { chromium } from "playwright";
import { join } from "node:path";
import { LESSONS } from "../src/data/lessons.js";

const root = process.cwd();
const html = await Bun.file(join(root, "dist", "index.html")).text();
const server = Bun.serve({
  port: 0,
  fetch() {
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  },
});

const filters = process.argv.slice(2).map(Number);
const lessons = filters.length
  ? LESSONS.filter(function (lesson) {
      return filters.indexOf(lesson.id) !== -1;
    })
  : LESSONS;

let failures = 0;
let runs = 0;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function runSnippet(label, code) {
  runs += 1;
  await page.goto("http://127.0.0.1:" + server.port + "/#/playground", { waitUntil: "load" });
  await page.waitForTimeout(120);
  await page.locator("textarea").fill(code);
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await page.waitForTimeout(600);
  // Error-kind console lines are styled text-danger (see Playground.jsx) —
  // counting those is exact, unlike scanning text for the word "error"
  // (a snippet may legitimately print err.name such as ReferenceError).
  const errorLines = await page
    .locator('[aria-live="polite"] .text-danger')
    .count();
  if (errorLines > 0) {
    failures += 1;
    const consoleText = await page.locator('[aria-live="polite"]').innerText();
    console.log("  FAIL " + label + " — " + consoleText.slice(0, 160).replace(/\n/g, " | "));
  }
}

for (let i = 0; i < lessons.length; i += 1) {
  const lesson = lessons[i];
  const runnable = [];
  if (lesson.concepts) {
    for (let c = 0; c < lesson.concepts.length; c += 1) {
      runnable.push(["L" + lesson.id + " concept " + (c + 1) + " (" + lesson.concepts[c].heading + ")", lesson.concepts[c].code]);
    }
  } else {
    runnable.push(["L" + lesson.id + " realCode", lesson.realCode]);
    runnable.push(["L" + lesson.id + " extraReal", lesson.extraReal]);
  }
  // Starters are excluded: they are exercise skeletons with placeholder
  // bodies that throw by design until the learner completes them. Everything
  // else presents itself as working code and must run clean.
  for (let s = 0; s < lesson.solutions.length; s += 1) {
    runnable.push(["L" + lesson.id + " solution " + (s + 1), lesson.solutions[s].code]);
  }
  console.log("Lesson " + lesson.id + " — " + runnable.length + " snippets");
  for (let r = 0; r < runnable.length; r += 1) {
    await runSnippet(runnable[r][0], runnable[r][1]);
  }
}

await browser.close();
console.log(runs + " snippets run, " + failures + " threw");
process.exit(failures === 0 ? 0 : 1);
