import { describe, expect, test } from "bun:test";
import {
  countDone,
  parseProgress,
  readStorage,
  serializeProgress,
  writeStorage,
} from "../src/lib/progress.js";

function makeStorage(seed) {
  const map = seed || {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
    },
    setItem(key, value) {
      map[key] = String(value);
    },
  };
}

describe("parseProgress", function () {
  test("returns an empty list for missing data", function () {
    expect(parseProgress(null)).toEqual([]);
    expect(parseProgress("")).toEqual([]);
  });

  test("returns an empty list for broken JSON", function () {
    expect(parseProgress("{not json")).toEqual([]);
    expect(parseProgress("null")).toEqual([]);
    expect(parseProgress('{"completed":"nope"}')).toEqual([]);
  });

  test("normalizes ids to strings and removes duplicates", function () {
    expect(parseProgress('{"completed":[1,"2",1,"2","3"]}')).toEqual(["1", "2", "3"]);
  });

  test("drops empty keys", function () {
    expect(parseProgress('{"completed":["",null,"1"]}')).toEqual(["1"]);
  });
});

describe("serializeProgress", function () {
  test("round trips through parseProgress", function () {
    const completed = ["1", "5", "project:2"];
    expect(parseProgress(serializeProgress(completed))).toEqual(completed);
  });
});

describe("storage", function () {
  test("writes and reads the completed list", function () {
    const storage = makeStorage();
    expect(writeStorage(storage, ["1", "2"])).toBe(true);
    expect(parseProgress(readStorage(storage))).toEqual(["1", "2"]);
  });

  test("survives a storage that throws", function () {
    const storage = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
    };
    expect(readStorage(storage)).toBe(null);
    expect(writeStorage(storage, ["1"])).toBe(false);
  });
});

describe("countDone", function () {
  test("counts only the ids that are present", function () {
    expect(countDone(["1", "3"], [1, 2, 3])).toBe(2);
    expect(countDone([], [1, 2, 3])).toBe(0);
    expect(countDone(["1", "2", "3"], [1, 2, 3])).toBe(3);
  });

  test("ignores unrelated keys like project steps", function () {
    expect(countDone(["project:1", "1"], [1, 2])).toBe(1);
  });
});
