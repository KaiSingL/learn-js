import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { LESSONS } from "../src/data/lessons.js";

const root = process.cwd();
const html = await Bun.file(join(root, "dist", "index.html")).text();

const server = Bun.serve({
  port: 0,
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    return new Response("not found", { status: 404 });
  },
});

const base = "http://127.0.0.1:" + server.port + "/";
const fileUrl = pathToFileURL(join(root, "dist", "index.html")).href;
const shots = join(root, "screenshots");
mkdirSync(shots, { recursive: true });

const results = [];
function check(condition, label, detail) {
  if (condition) {
    results.push({ ok: true, label });
    console.log("  ok   " + label);
  } else {
    results.push({ ok: false, label, detail });
    console.log("  FAIL " + label + (detail ? " — " + detail : ""));
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", function (error) {
  pageErrors.push(error.message);
});

async function goto(hash) {
  await page.goto(base + (hash || ""), { waitUntil: "load" });
  await page.waitForTimeout(250);
}

try {
  console.log("\nRouting");
  await goto("");
  check((await page.title()).indexOf("Learn JS") !== -1, "overview title is set", await page.title());
  check((await page.locator("h1").first().innerText()).indexOf("JavaScript") !== -1, "overview h1 renders");
  const iconHref = await page.locator('link[rel="icon"]').first().getAttribute("href");
  check(iconHref.indexOf(".png") !== -1, "favicon points to a png icon", iconHref);
  check(await page.locator('link[rel="apple-touch-icon"]').count() === 1, "apple-touch-icon present");
  check(await page.locator('link[rel="manifest"]').count() === 1, "web manifest present");

  await goto("#/rules");
  check((await page.locator("h1").first().innerText()).indexOf("Tier 0") !== -1, "rules route renders");

  await goto("#/lessons");
  check((await page.locator("h1").first().innerText()).indexOf("Learn the real form") !== -1, "lessons route renders");

  await goto("#/lesson/5");
  await page.waitForTimeout(300);
  check(page.url().indexOf("lesson/5") !== -1, "lesson deep link keeps the hash");
  check((await page.locator("#lesson-5").count()) === 1, "lesson 5 card exists");
  check((await page.locator("#lesson-5").innerText()).indexOf("Objects & Prototype") !== -1, "lesson 5 is expanded");

  await goto("#/cheatsheet");
  check((await page.locator("h1").first().innerText()).indexOf("Sugar") !== -1, "cheatsheet route renders");
  check((await page.locator("text=Arrow functions capture this lexically").count()) > 0, "cheatsheet rows render");

  await goto("#/project");
  check((await page.locator("h1").first().innerText()).indexOf("Build it for real") !== -1, "project route renders");

  await goto("#/lesson/9");
  await page.waitForTimeout(300);
  check(page.url().indexOf("lesson/9") !== -1, "lesson 9 deep link keeps the hash");
  check((await page.locator("#lesson-9").count()) === 1, "lesson 9 card exists");
  check((await page.locator("#lesson-9").innerText()).indexOf("Strict Mode") !== -1, "lesson 9 is expanded");

  await page.goto(base + "#/playground", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  check((await page.locator("h1").first().innerText()).indexOf("Run real code") !== -1, "playground route renders");

  console.log("\nPlayground: run a preset");
  await goto("#/playground?preset=example-proto");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.locator("#preset-select").waitFor();
  check((await page.locator("#preset-select").inputValue()) === "example-proto", "preset loads from the query");
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await page.waitForFunction(function () {
    return document.body.innerText.indexOf("Woof Rex") !== -1;
  }, { timeout: 8000 });
  const consoleText = await page.locator('[aria-live="polite"]').innerText();
  check(consoleText.indexOf("Woof Rex") !== -1, "console captures log output");
  check(consoleText.indexOf("Woof Luna") !== -1, "console captures every instance");
  check(consoleText.indexOf("false") !== -1, "console prints false for hasOwnProperty");
  check(consoleText.indexOf("true") !== -1, "console prints true for the prototype check");

  console.log("\nPlayground: linter");
  await page.locator("textarea").fill("var f = () => 1;\nvar g = class {};");
  await page.waitForTimeout(250);
  const bodyText = await page.locator("body").innerText();
  check(bodyText.indexOf("Arrow function") !== -1, "linter names the arrow rule");
  check(bodyText.indexOf("class / extends / super") !== -1, "linter names the class rule");
  check(bodyText.indexOf("errors") !== -1, "linter reports an error count");
  check((await page.getByRole("button", { name: "Run code", exact: true }).count()) === 1, "run stays available with violations");

  console.log("\nPlayground: preview");
  await page.selectOption("#preset-select", "example-dom");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  const previewFrame = page.frameLocator('iframe[title="Code preview"]');
  await previewFrame.getByText("Built with the DOM").waitFor({ timeout: 5000 });
  await previewFrame.locator("#app button").click();
  await page.waitForTimeout(200);
  check((await previewFrame.locator("#app .value").innerText()) === "1", "preview DOM updates on click");

  console.log("\nProject preview");
  await goto("#/project");
  await page.locator("button:has-text('Wire the emitter to the page')").click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "Run preview" }).click();
  const projectFrame = page.frameLocator('iframe[title="Code preview"]');
  await projectFrame.locator("#inc").waitFor({ timeout: 5000 });
  await projectFrame.locator("#inc").click();
  await page.waitForTimeout(200);
  check((await projectFrame.locator("#count").innerText()) === "1", "project preview increments");

  console.log("\nPlayground: infinite loop protection");
  await goto("#/playground");
  await page.waitForTimeout(300);
  await page.locator("textarea").fill("while (true) { }");
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await page.waitForFunction(function () {
    return document.body.innerText.indexOf("Stopped after 2.2s") !== -1;
  }, { timeout: 9000 });
  check(true, "infinite loop is terminated by the worker timeout");
  check((await page.locator("h1").first().innerText()).indexOf("Run real code") !== -1, "page is still responsive after the timeout");

  console.log("\nProgress");
  await goto("#/lesson/1");
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await page.waitForTimeout(200);
  check((await page.getByRole("button", { name: "Marked complete" }).count()) === 1, "lesson marks complete");
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(400);
  check((await page.getByRole("button", { name: "Marked complete" }).count()) === 1, "completion survives reload");
  const asideText = await page.locator("aside").innerText();
  check(asideText.indexOf("1 / " + LESSONS.length) !== -1, "sidebar progress updates");
  await page.locator("aside").getByRole("button", { name: "Reset", exact: true }).click();
  await page.waitForTimeout(200);
  check((await page.locator("aside").innerText()).indexOf("0 / " + LESSONS.length) !== -1, "progress reset works");

  console.log("\nSearch");
  await goto("");
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(200);
  check((await page.getByRole("dialog", { name: "Search the course" }).count()) === 1, "search palette opens");
  await page.getByRole("textbox", { name: "Search" }).fill("closure");
  await page.waitForTimeout(250);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  check(page.url().indexOf("#/lesson/2") !== -1, "search opens the right lesson", page.url());

  console.log("\nScreenshots");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await goto("");
  await page.screenshot({ path: join(shots, "overview-desktop.png"), fullPage: true });
  await goto("#/lessons");
  await page.locator("#lesson-1 > button").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(shots, "lessons-desktop.png"), fullPage: true });
  await goto("#/playground?preset=example-proto");
  await page.getByRole("button", { name: "Run code", exact: true }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(shots, "playground-desktop.png"), fullPage: true });
  await goto("#/project");
  await page.screenshot({ path: join(shots, "project-desktop.png"), fullPage: true });
  check(true, "desktop screenshots captured");

  console.log("\nMobile");
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto(base, { waitUntil: "load" });
  await mobile.waitForTimeout(300);
  check((await mobile.getByRole("button", { name: "Open menu" }).count()) === 1, "mobile header renders");
  await mobile.getByRole("button", { name: "Open menu" }).click();
  await mobile.waitForTimeout(250);
  check((await mobile.getByRole("dialog", { name: "Course navigation" }).count()) === 1, "mobile drawer opens");
  await mobile.locator('[role="dialog"] button:has-text("Variables, Types")').first().click();
  await mobile.waitForTimeout(500);
  check(mobile.url().indexOf("#/lesson/1") !== -1, "mobile drawer navigates");
  check((await mobile.getByRole("dialog", { name: "Course navigation" }).count()) === 0, "mobile drawer closes on navigate");
  await mobile.screenshot({ path: join(shots, "lesson-mobile.png"), fullPage: true });
  await mobile.goto(base, { waitUntil: "load" });
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: join(shots, "overview-mobile.png"), fullPage: true });
  check(true, "mobile screenshots captured");
  await mobile.close();

  console.log("\nFile protocol");
  const filePage = await browser.newPage();
  const fileErrors = [];
  filePage.on("pageerror", function (error) {
    fileErrors.push(error.message);
  });
  await filePage.goto(fileUrl + "#/playground?preset=example-proto", { waitUntil: "load" });
  await filePage.waitForTimeout(500);
  check((await filePage.locator("h1").first().innerText()).indexOf("Run real code") !== -1, "file:// build renders");
  await filePage.getByRole("button", { name: "Run code", exact: true }).click();
  await filePage.waitForFunction(function () {
    return document.body.innerText.indexOf("Woof Rex") !== -1;
  }, { timeout: 9000 });
  check(true, "playground runs from file:// (worker or fallback)");
  await filePage.close();

  console.log("\nRuntime errors");
  check(pageErrors.length === 0, "no page errors on the main page", pageErrors.join(" | "));
  check(fileErrors.length === 0, "no page errors on file://", fileErrors.join(" | "));
} catch (error) {
  console.log("\nFAILED: " + error.message);
  results.push({ ok: false, label: "script", detail: error.stack });
  try {
    await page.screenshot({ path: join(shots, "failure.png"), fullPage: true });
  } catch (err) {
    // ignore
  }
} finally {
  await browser.close();
  server.stop(true);
}

const failed = results.filter(function (item) {
  return !item.ok;
});
console.log("\n" + (results.length - failed.length) + " passed, " + failed.length + " failed");
if (failed.length > 0) process.exit(1);
