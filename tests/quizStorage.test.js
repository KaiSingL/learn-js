import { describe, expect, test } from "bun:test";
import {
  clearQuizStorage,
  parseQuiz,
  readQuizStorage,
  serializeQuiz,
  writeQuizStorage,
} from "../src/lib/quizStorage.js";

function makeStorage(seed) {
  const map = seed || {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
    },
    setItem(key, value) {
      map[key] = String(value);
    },
    removeItem(key) {
      delete map[key];
    },
  };
}

describe("parseQuiz", function () {
  test("returns an empty state for missing data", function () {
    expect(parseQuiz(null)).toEqual({});
    expect(parseQuiz("")).toEqual({});
  });

  test("returns an empty state for broken JSON", function () {
    expect(parseQuiz("{not json")).toEqual({});
    expect(parseQuiz("null")).toEqual({});
    expect(parseQuiz('{"quizzes":"nope"}')).toEqual({});
  });

  test("keeps numeric picks", function () {
    const raw = serializeQuiz({ "lesson-1-quiz": { "0": 1, "2": 0 } });
    expect(parseQuiz(raw)).toEqual({ "lesson-1-quiz": { "0": 1, "2": 0 } });
  });

  test("drops non-numeric question indices", function () {
    const raw = serializeQuiz({ "lesson-1-quiz": { "0": 1, x: 2, "": 3 } });
    expect(parseQuiz(raw)).toEqual({ "lesson-1-quiz": { "0": 1 } });
  });

  test("drops invalid option values", function () {
    const raw = serializeQuiz({
      "lesson-1-quiz": { "0": 1, "1": "2", "2": -1, "3": 1.5, "4": null },
    });
    expect(parseQuiz(raw)).toEqual({ "lesson-1-quiz": { "0": 1 } });
  });

  test("drops quiz entries with no valid picks", function () {
    const raw = serializeQuiz({ "lesson-1-quiz": { x: 1 }, "lesson-2-quiz": { "0": 2 } });
    expect(parseQuiz(raw)).toEqual({ "lesson-2-quiz": { "0": 2 } });
  });

  test("drops pick entries that are not objects", function () {
    const raw = serializeQuiz({ "lesson-1-quiz": [0, 1], "lesson-2-quiz": { "1": 2 } });
    expect(parseQuiz(raw)).toEqual({ "lesson-2-quiz": { "1": 2 } });
  });
});

describe("quiz storage round-trip", function () {
  test("write then read returns the same state", function () {
    const storage = makeStorage();
    const state = { "lesson-1-quiz": { "0": 1 }, "lesson-1-concept-x": { "0": 2 } };
    writeQuizStorage(storage, state);
    expect(readQuizStorage(storage)).toEqual(state);
  });

  test("read on empty storage returns an empty state", function () {
    expect(readQuizStorage(makeStorage())).toEqual({});
  });

  test("clear removes the stored state", function () {
    const storage = makeStorage();
    writeQuizStorage(storage, { "lesson-1-quiz": { "0": 1 } });
    clearQuizStorage(storage);
    expect(readQuizStorage(storage)).toEqual({});
  });

  test("a storage that throws is handled silently", function () {
    const throwing = {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
    };
    expect(readQuizStorage(throwing)).toEqual({});
    expect(writeQuizStorage(throwing, {})).toBe(false);
    expect(clearQuizStorage(throwing)).toBe(false);
  });
});
