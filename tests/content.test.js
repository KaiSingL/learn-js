import { describe, expect, test } from "bun:test";
import { CHEATSHEET } from "../src/data/cheatsheet.js";
import { LESSONS } from "../src/data/lessons.js";
import { PROJECT_STEPS } from "../src/data/project.js";
import { lintSource } from "../src/lib/lint.js";
import { PRESETS } from "../src/lib/presets.js";

function expectClean(label, code) {
  const violations = lintSource(code);
  if (violations.length > 0) {
    const details = violations
      .map(function (item) {
        return "  line " + item.line + ":" + item.col + "  " + item.ruleId + "  " + item.found;
      })
      .join("\n");
    throw new Error(label + " contains forbidden syntax:\n" + details);
  }
}

describe("curriculum shape", function () {
  test("has fourteen lessons numbered 1 to 14", function () {
    expect(LESSONS.length).toBe(14);
    const ids = LESSONS.map(function (lesson) {
      return lesson.id;
    });
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
  });

  test("every lesson is complete", function () {
    for (let i = 0; i < LESSONS.length; i += 1) {
      const lesson = LESSONS[i];
      expect(lesson.title.length).toBeGreaterThan(0);
      expect(lesson.goal.length).toBeGreaterThan(0);
      expect(lesson.longDesc.length).toBeGreaterThan(40);
      expect(lesson.realCode.length).toBeGreaterThan(20);
      expect(lesson.extraReal.length).toBeGreaterThan(20);
      expect(lesson.starter.length).toBeGreaterThan(20);
      expect(lesson.exercise.length).toBeGreaterThan(20);
      expect(lesson.solutions.length).toBeGreaterThan(0);
      expect(lesson.checklist.length).toBeGreaterThanOrEqual(4);
      expect(lesson.realTalk.length).toBeGreaterThan(20);
      expect(lesson.quiz.length).toBeGreaterThanOrEqual(2);
      expect(lesson.breakIt.length).toBeGreaterThan(20);
      expect(lesson.predict.q.length).toBeGreaterThan(0);
      expect(lesson.predict.options.length).toBeGreaterThanOrEqual(2);
      expect(lesson.predict.answer).toBeGreaterThanOrEqual(0);
      expect(lesson.predict.answer).toBeLessThan(lesson.predict.options.length);
      expect(lesson.translate.task.length).toBeGreaterThan(0);
      expect(Array.isArray(lesson.killsQs)).toBe(true);
    }
  });

  test("every quiz answer points at a real option", function () {
    for (let i = 0; i < LESSONS.length; i += 1) {
      const lesson = LESSONS[i];
      for (let q = 0; q < lesson.quiz.length; q += 1) {
        const item = lesson.quiz[q];
        expect(item.options.length).toBeGreaterThanOrEqual(2);
        expect(item.answer).toBeGreaterThanOrEqual(0);
        expect(item.answer).toBeLessThan(item.options.length);
        expect(item.why.length).toBeGreaterThan(10);
      }
    }
  });

  test("every lesson has unique titles", function () {
    const seen = {};
    for (let i = 0; i < LESSONS.length; i += 1) {
      expect(seen[LESSONS[i].title]).toBeUndefined();
      seen[LESSONS[i].title] = true;
    }
  });
});

describe("lesson code obeys the course rules", function () {
  test("real code samples are clean", function () {
    for (let i = 0; i < LESSONS.length; i += 1) {
      const lesson = LESSONS[i];
      expectClean("Lesson " + lesson.id + " realCode", lesson.realCode);
      expectClean("Lesson " + lesson.id + " extraReal", lesson.extraReal);
    }
  });

  test("starter samples are clean", function () {
    for (let i = 0; i < LESSONS.length; i += 1) {
      expectClean("Lesson " + LESSONS[i].id + " starter", LESSONS[i].starter);
    }
  });

  test("solution samples are clean", function () {
    for (let i = 0; i < LESSONS.length; i += 1) {
      const lesson = LESSONS[i];
      for (let s = 0; s < lesson.solutions.length; s += 1) {
        expectClean(
          "Lesson " + lesson.id + " solution " + (s + 1),
          lesson.solutions[s].code
        );
      }
    }
  });

  test("solutions have a note and a title", function () {
    for (let i = 0; i < LESSONS.length; i += 1) {
      for (let s = 0; s < LESSONS[i].solutions.length; s += 1) {
        expect(LESSONS[i].solutions[s].title.length).toBeGreaterThan(0);
        expect(LESSONS[i].solutions[s].note.length).toBeGreaterThan(10);
      }
    }
  });
});

describe("cheatsheet", function () {
  test("has a useful number of mappings", function () {
    expect(CHEATSHEET.length).toBeGreaterThanOrEqual(25);
  });

  test("every real side obeys the course rules", function () {
    for (let i = 0; i < CHEATSHEET.length; i += 1) {
      expectClean("Cheatsheet row " + (i + 1) + " (" + CHEATSHEET[i].sugar + ")", CHEATSHEET[i].real);
    }
  });

  test("every row has a sugar, a real form and a reason", function () {
    for (let i = 0; i < CHEATSHEET.length; i += 1) {
      expect(CHEATSHEET[i].sugar.length).toBeGreaterThan(0);
      expect(CHEATSHEET[i].real.length).toBeGreaterThan(0);
      expect(CHEATSHEET[i].why.length).toBeGreaterThan(10);
      expect(CHEATSHEET[i].cat.length).toBeGreaterThan(0);
    }
  });
});

describe("final project", function () {
  test("has six runnable steps", function () {
    expect(PROJECT_STEPS.length).toBe(6);
  });

  test("every step is clean and has a checkpoint", function () {
    for (let i = 0; i < PROJECT_STEPS.length; i += 1) {
      const step = PROJECT_STEPS[i];
      expect(step.checkpoint.length).toBeGreaterThan(10);
      expect(step.note.length).toBeGreaterThan(10);
      expectClean("Project step " + step.id, step.code);
    }
  });

  test("the reference step includes both deliverables", function () {
    const last = PROJECT_STEPS[PROJECT_STEPS.length - 1];
    expect(last.code.indexOf("EventEmitter.prototype.once")).not.toBe(-1);
    expect(last.code.indexOf("function $(selector")).not.toBe(-1);
    expect(last.code.indexOf("function attr(")).not.toBe(-1);
  });
});

describe("playground presets", function () {
  test("all preset code obeys the course rules", function () {
    for (let i = 0; i < PRESETS.length; i += 1) {
      expectClean("Preset " + PRESETS[i].id, PRESETS[i].code);
    }
  });

  test("preset ids are unique", function () {
    const seen = {};
    for (let i = 0; i < PRESETS.length; i += 1) {
      expect(seen[PRESETS[i].id]).toBeUndefined();
      seen[PRESETS[i].id] = true;
    }
  });
});
