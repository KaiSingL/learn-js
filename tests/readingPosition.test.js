import { describe, expect, test } from "bun:test";
import {
  canRestore,
  clearReadingStorage,
  markSessionNavigated,
  parseReading,
  readReadingStorage,
  serializeReading,
  writeReadingStorage,
} from "../src/lib/readingPosition.js";

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

describe("parseReading", function () {
  test("returns null for missing data", function () {
    expect(parseReading(null)).toBe(null);
    expect(parseReading("")).toBe(null);
  });

  test("returns null for broken JSON", function () {
    expect(parseReading("{not json")).toBe(null);
    expect(parseReading("null")).toBe(null);
    expect(parseReading('{"v":1}')).toBe(null);
  });

  test("returns null when path or anchorId are missing or not strings", function () {
    expect(parseReading('{"path":"/lesson/1"}')).toBe(null);
    expect(parseReading('{"anchorId":"lesson-1-concept-3"}')).toBe(null);
    expect(parseReading('{"path":1,"anchorId":"x"}')).toBe(null);
    expect(parseReading('{"path":"/lesson/1","anchorId":""}')).toBe(null);
  });

  test("keeps a valid entry", function () {
    expect(parseReading('{"v":1,"path":"/lesson/1","anchorId":"lesson-1-concept-3"}')).toEqual({
      path: "/lesson/1",
      anchorId: "lesson-1-concept-3",
    });
  });
});

describe("reading storage round-trip", function () {
  test("write then read returns the same entry", function () {
    const storage = makeStorage();
    const entry = { path: "/lesson/1", anchorId: "lesson-1-concept-3" };
    writeReadingStorage(storage, entry);
    expect(readReadingStorage(storage)).toEqual(entry);
  });

  test("read on empty storage returns null", function () {
    expect(readReadingStorage(makeStorage())).toBe(null);
  });

  test("write overwrites the previous entry", function () {
    const storage = makeStorage();
    writeReadingStorage(storage, { path: "/lesson/1", anchorId: "lesson-1-concept-3" });
    writeReadingStorage(storage, { path: "/lesson/2", anchorId: "lesson-2" });
    expect(readReadingStorage(storage)).toEqual({ path: "/lesson/2", anchorId: "lesson-2" });
  });

  test("clear removes the stored entry", function () {
    const storage = makeStorage();
    writeReadingStorage(storage, { path: "/lesson/1", anchorId: "lesson-1" });
    clearReadingStorage(storage);
    expect(readReadingStorage(storage)).toBe(null);
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
    expect(readReadingStorage(throwing)).toBe(null);
    expect(writeReadingStorage(throwing, { path: "/lesson/1", anchorId: "x" })).toBe(false);
    expect(clearReadingStorage(throwing)).toBe(false);
  });
});

describe("session navigation guard", function () {
  test("restore is allowed before any in-app navigation", function () {
    expect(canRestore()).toBe(true);
  });

  test("markSessionNavigated blocks restore for the rest of the session", function () {
    markSessionNavigated();
    expect(canRestore()).toBe(false);
    expect(canRestore()).toBe(false);
  });
});
