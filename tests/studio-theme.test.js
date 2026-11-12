import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The studio's colors come from theme tokens only (see the token comment in
// src/studio/studio.css): cs-paper/cs-ink/cs-muted/cs-faint/cs-line flip
// with dark mode; cs-chip-* stay light in both modes and pair with their
// own inks. Raw palette classes are how the "invisible text in dark mode"
// bug class kept coming back — this test bans them so new components can
// only pick a token pair. Accent pairs (indigo/rose/amber/emerald/sky)
// stay allowed: X-50 bg + X-200 border + X-700/800 text read on both modes.
var studioDir = join(import.meta.dir, "..", "src", "studio");

function jsxFiles() {
  return readdirSync(studioDir).filter(function (name) { return name.endsWith(".jsx"); });
}

function violationsIn(source) {
  var found = [];
  var patterns = [
    { re: /slate-\d{3}/g, why: "raw slate class — use cs-* tokens" },
    { re: /\bbg-white\b/g, why: "raw bg-white — use bg-cs-chip" },
    { re: /(?:bg|text|border)-\[var\(--/g, why: "arbitrary var() class — use the cs-* token" },
  ];
  patterns.forEach(function (p) {
    var m = source.match(p.re);
    if (m) found = found.concat(m);
  });
  return found;
}

describe("studio theme tokens", function () {
  test("components use cs-* tokens, not raw palette classes", function () {
    var bad = [];
    jsxFiles().forEach(function (name) {
      var source = readFileSync(join(studioDir, name), "utf8");
      violationsIn(source).forEach(function (hit) {
        bad.push(name + ": " + hit);
      });
    });
    expect(bad).toEqual([]);
  });
});
