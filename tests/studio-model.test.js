import { describe, expect, test } from "bun:test";
import {
  computeVerdict,
  conceptId,
  edgeErrors,
  findCycles,
  flatten,
  parseConceptId,
  quizTagErrors,
} from "../src/studio/model.js";
import { LESSONS } from "../src/data/lessons.js";

describe("identity", function () {
  test("ids round-trip", function () {
    expect(conceptId(3, 4)).toBe("L3:4");
    expect(parseConceptId("L12:0")).toEqual({ lessonId: 12, index: 0 });
  });

  test("flatten counts all 78 concepts in order", function () {
    const flat = flatten(LESSONS);
    expect(flat.length).toBe(78);
    expect(flat[0].id).toBe("L1:0");
    expect(flat[0].order).toBe(0);
    expect(flat[77].id).toBe("L14:3");
    expect(flat[77].order).toBe(77);
  });
});

describe("computeVerdict", function () {
  const core = (name) => ({ name, glossed: false });
  const glossed = (name) => ({ name, glossed: true });

  test("no names recorded means unmarked, not consolidation", function () {
    expect(computeVerdict([], null)).toBe("unmarked");
    expect(computeVerdict(undefined, null)).toBe("unmarked");
  });

  test("explicit empty list is a consolidation", function () {
    expect(computeVerdict([], "consolidation")).toBe("consolidation");
  });

  test("one core name is ok", function () {
    expect(computeVerdict([core("typeof")], null)).toBe("ok");
  });

  test("one core plus glossed riders is heavy", function () {
    expect(computeVerdict([core("closure"), glossed("garbage collector")], null)).toBe("heavy");
  });

  test("zero core, only glossed counts as consolidation of old ideas", function () {
    expect(computeVerdict([glossed("a"), glossed("b")], null)).toBe("consolidation");
  });

  test("two core names is a violation", function () {
    expect(computeVerdict([core("deep copy"), core("recursion")], null)).toBe("violation");
  });

  test("override wins", function () {
    expect(computeVerdict([core("a"), core("b")], "ok")).toBe("ok");
    expect(computeVerdict([core("a")], "unmarked")).toBe("unmarked");
  });
});

describe("edgeErrors / forward references", function () {
  function lessonsWith(order) {
    // order: array of { lessonId, headings: [] } — build minimal lessons
    return order.map(function (l) {
      return {
        id: l.lessonId,
        title: "Lesson " + l.lessonId,
        concepts: l.headings.map(function (h) {
          return { heading: h, text: "t", purpose: "p", code: "var x;" };
        }),
        quiz: [],
      };
    });
  }

  test("edge to an earlier concept is clean", function () {
    const lessons = lessonsWith([{ lessonId: 1, headings: ["names"] }, { lessonId: 2, headings: ["user"] }]);
    const flat = flatten(lessons);
    const problems = edgeErrors([{ from: "L2:0", to: "L1:0", names: ["names"] }], flat);
    expect(problems.length).toBe(0);
  });

  test("edge to a later concept is a forward reference", function () {
    const lessons = lessonsWith([{ lessonId: 1, headings: ["user"] }, { lessonId: 2, headings: ["teacher"] }]);
    const flat = flatten(lessons);
    const problems = edgeErrors([{ from: "L1:0", to: "L2:0", names: ["call"] }], flat);
    expect(problems.length).toBe(1);
    expect(problems[0].kind).toBe("forward-ref");
    expect(problems[0].reason).toContain("before");
  });

  test("same lesson, later index is also a forward reference", function () {
    const lessons = lessonsWith([{ lessonId: 3, headings: ["a", "b"] }]);
    const problems = edgeErrors([{ from: "L3:0", to: "L3:1", names: ["x"] }], flatten(lessons));
    expect(problems[0].kind).toBe("forward-ref");
  });

  test("to: null is an orphan name (never taught)", function () {
    const lessons = lessonsWith([{ lessonId: 5, headings: ["inheritance"] }]);
    const problems = edgeErrors([{ from: "L5:0", to: null, names: ["Object.create"] }], flatten(lessons));
    expect(problems.length).toBe(1);
    expect(problems[0].kind).toBe("orphan-name");
  });

  test("broken endpoints are reported, not thrown", function () {
    const lessons = lessonsWith([{ lessonId: 1, headings: ["a"] }]);
    const problems = edgeErrors([{ from: "L9:9", to: "L1:0", names: [] }], flatten(lessons));
    expect(problems[0].kind).toBe("broken-edge");
  });

  test("seeded review edges reproduce the known violations", function () {
    const flat = flatten(LESSONS);
    const problems = edgeErrors(
      [
        { from: "L3:4", to: "L4:1", names: ["call"] },
        { from: "L3:4", to: "L5:1", names: ["prototype"] },
        { from: "L9:1", to: "L13:5", names: ["try/catch"] },
      ],
      flat
    );
    const kinds = problems.map(function (p) { return p.kind; });
    expect(kinds).toEqual(["forward-ref", "forward-ref", "forward-ref"]);
  });
});

describe("findCycles", function () {
  test("detects a cycle and stays quiet without one", function () {
    expect(findCycles([{ from: "a", to: "b" }, { from: "b", to: "a" }]).length).toBe(1);
    expect(findCycles([{ from: "a", to: "b" }, { from: "b", to: "c" }]).length).toBe(0);
    expect(findCycles([]).length).toBe(0);
  });
});

describe("quizTagErrors", function () {
  test("the shipped curriculum is clean", function () {
    expect(quizTagErrors(LESSONS).length).toBe(0);
  });

  test("catches a tag whose concept moved to a later lesson", function () {
    // "var self = this…" is taught in lesson 4 and tested by lesson 13's quiz.
    // Move it into lesson 14: the lesson-13 quiz tag must then fail.
    const moved = LESSONS.map(function (lesson) {
      return { ...lesson, concepts: lesson.concepts.slice() };
    });
    const idx = moved[3].concepts.findIndex(function (c) {
      return c.heading.indexOf("var self = this") === 0;
    });
    expect(idx).toBeGreaterThan(-1);
    const [concept] = moved[3].concepts.splice(idx, 1);
    moved[13].concepts.splice(0, 0, concept);
    const errors = quizTagErrors(moved);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.lessonId === 13)).toBe(true);
  });
});
