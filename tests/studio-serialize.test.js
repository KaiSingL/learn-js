import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  emitQuoted,
  emitTemplate,
  parseConceptFields,
  rebuildSource,
  replaceQuizTests,
  roundTrip,
  rewriteConceptBlock,
  scanLessons,
} from "../src/studio/serialize.js";
import { LESSONS } from "../src/data/lessons.js";

const SOURCE = readFileSync(new URL("../src/data/lessons.js", import.meta.url), "utf8");

describe("lessons.js scanner", function () {
  test("finds 14 lessons with concept counts matching the imported module", function () {
    const scan = scanLessons(SOURCE);
    expect(scan.lessons.length).toBe(LESSONS.length);
    for (let i = 0; i < scan.lessons.length; i += 1) {
      expect(scan.lessons[i].id).toBe(LESSONS[i].id);
      expect(scan.lessons[i].concepts.length).toBe(LESSONS[i].concepts.length);
    }
  });

  test("parses field values that match the imported module", function () {
    const scan = scanLessons(SOURCE);
    for (let li = 0; li < scan.lessons.length; li += 1) {
      for (let ci = 0; ci < scan.lessons[li].concepts.length; ci += 1) {
        const block = SOURCE.slice(
          scan.lessons[li].concepts[ci].start,
          scan.lessons[li].concepts[ci].end + 1
        );
        const fields = parseConceptFields(block);
        const imported = LESSONS[li].concepts[ci];
        expect(fields.heading.value).toBe(imported.heading);
        expect(fields.text.value).toBe(imported.text);
        expect(fields.purpose.value).toBe(imported.purpose);
        expect(fields.code.value).toBe(imported.code);
        if (imported.diagram) expect(fields.diagram.value).toBe(imported.diagram);
      }
    }
  });
});

describe("serializer round-trip gate", function () {
  test("every concept block re-emits byte-for-byte", function () {
    const result = roundTrip(SOURCE);
    if (!result.ok) {
      throw new Error(
        "Serializer is not trusted:\n" + result.problems.map(function (p) { return "  " + p.reason; }).join("\n")
      );
    }
  });

  test("no-op rebuild is the identical file", function () {
    const scan = scanLessons(SOURCE);
    const verbatim = scan.lessons.map(function (lesson) {
      return lesson.concepts.map(function (c) {
        return SOURCE.slice(c.start, c.end + 1);
      });
    });
    expect(rebuildSource(SOURCE, verbatim)).toBe(SOURCE);
  });

  test("reordering concepts rebuilds only that array, in the new order", function () {
    // Synthetic file so the test survives real reorders made through the studio.
    // Block bodies start at "{" — exactly like blocks extracted by the scanner.
    const eol = "\n";
    const blockBody = function (n) {
      return (
        "{" + eol +
        '        heading: "Concept ' + n + '",' + eol +
        '        text: "Text ' + n + '",' + eol +
        '        purpose: "Purpose ' + n + '",' + eol +
        "        code: `var x = " + n + ";`," + eol +
        "      }"
      );
    };
    const source =
      "export const LESSONS = [" + eol +
      "  {" + eol +
      "    id: 1," + eol +
      "    concepts: [" + eol +
      [blockBody(1), blockBody(2), blockBody(3)].map(function (b) { return "      " + b; }).join("," + eol) + "," + eol +
      "    ]," + eol +
      "  }," + eol +
      "];" + eol;
    const scan = scanLessons(source);
    expect(scan.lessons.length).toBe(1);
    expect(scan.lessons[0].concepts.length).toBe(3);
    const swapped = [blockBody(2), blockBody(1), blockBody(3)];
    const rebuilt = rebuildSource(source, [swapped]);
    expect(rebuilt).not.toBe(source);
    const iA = rebuilt.indexOf('heading: "Concept 1"');
    const iB = rebuilt.indexOf('heading: "Concept 2"');
    expect(iB).toBeGreaterThan(-1);
    expect(iA).toBeGreaterThan(iB);
    expect(rebuilt.length).toBe(source.length);
    // Round-trip with the original order reproduces the source exactly.
    const verbatim = scan.lessons[0].concepts.map(function (c) {
      return source.slice(c.start, c.end + 1);
    });
    expect(rebuildSource(source, [verbatim])).toBe(source);
  });
});

describe("field editing", function () {
  test("rewriting an edited concept keeps check, diagram and field order intact", function () {
    const scan = scanLessons(SOURCE);
    // Lesson 1, concept 4 has code + diagram + check together.
    const block = SOURCE.slice(
      scan.lessons[0].concepts[3].start,
      scan.lessons[0].concepts[3].end + 1
    );
    const rewritten = rewriteConceptBlock(block, {
      heading: "Renamed heading",
      code: "var x = 1;\nconsole.log(x); // -> 1",
    });
    expect(rewritten).toContain('heading: "Renamed heading"');
    expect(rewritten).toContain("code: `var x = 1;\nconsole.log(x); // -> 1`");
    expect(rewritten).toContain('diagram: "scope"');
    expect(rewritten.indexOf('diagram: "scope"')).toBeGreaterThan(rewritten.indexOf("code: `"));
    expect(rewritten).toContain("check: {");
    expect(rewritten.indexOf("check: {")).toBeGreaterThan(rewritten.indexOf('diagram: "scope"'));
  });

  test("emitQuoted and emitTemplate escape round-trips", function () {
    const tricky = 'She said "hi" \\ back — dash\ttab';
    expect(emitQuoted(tricky)).toBe('"She said \\"hi\\" \\\\ back — dash\\ttab"');
    const tpl = "line1\nline2 `tick ${dollar";
    expect(emitTemplate(tpl)).toBe("`line1\nline2 \\`tick \\${dollar`");
  });
});

describe("quiz tag rename patch", function () {
  test("rewrites tests: values after a heading rename", function () {
    // Pick a real, currently-taught heading so the test survives any merge.
    const from = LESSONS[0].quiz[0].tests;
    expect(typeof from).toBe("string");
    const to = from + " (renamed)";
    const result = replaceQuizTests(SOURCE, [{ from: from, to: to }]);
    expect(result.replaced).toBeGreaterThanOrEqual(1);
    expect(result.source).toContain("tests: " + JSON.stringify(to).replace(/'/g, "\\'"));
    expect(result.source).not.toContain("tests: " + JSON.stringify(from));
  });
});
