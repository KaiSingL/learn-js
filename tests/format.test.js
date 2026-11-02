import { describe, expect, test } from "bun:test";
import { formatArgs, formatValue } from "../src/lib/format.js";

describe("formatValue", function () {
  test("prints strings raw at the top level and quoted when nested", function () {
    expect(formatValue("hello")).toBe("hello");
    expect(formatValue(["hello"])).toBe('["hello"]');
    expect(formatValue({ a: "b" })).toBe('{ a: "b" }');
  });

  test("handles special numbers", function () {
    expect(formatValue(NaN)).toBe("NaN");
    expect(formatValue(Infinity)).toBe("Infinity");
    expect(formatValue(-Infinity)).toBe("-Infinity");
    expect(formatValue(-0)).toBe("-0");
    expect(formatValue(0)).toBe("0");
  });

  test("handles null, undefined, bigint, boolean and symbol", function () {
    expect(formatValue(null)).toBe("null");
    expect(formatValue(undefined)).toBe("undefined");
    expect(formatValue(true)).toBe("true");
    expect(formatValue(BigInt(10))).toBe("10n");
    expect(formatValue(Symbol("x"))).toContain("Symbol(x)");
  });

  test("formats functions without trying to inspect them", function () {
    function named() {}
    expect(formatValue(named)).toBe("function named()");
    expect(formatValue(function () {})).toContain("function");
  });

  test("handles circular structures", function () {
    const value = { name: "loop" };
    value.self = value;
    expect(formatValue(value)).toBe('{ name: "loop", self: [Circular] }');
  });

  test("formats arrays and reports extra items", function () {
    expect(formatValue([1, 2, 3])).toBe("[1, 2, 3]");
    const long = [];
    for (let i = 0; i < 60; i += 1) long[long.length] = i;
    expect(formatValue(long)).toContain("… 10 more");
  });

  test("formats maps and sets", function () {
    const map = new Map();
    map.set("a", 1);
    expect(formatValue(map)).toBe('Map(1) { "a" => 1 }');

    const set = new Set([1, 2]);
    expect(formatValue(set)).toBe("Set(2) { 1, 2 }");
  });

  test("formats errors with name and message", function () {
    expect(formatValue(new Error("boom"))).toBe("Error: boom");
    expect(formatValue(new TypeError("bad"))).toBe("TypeError: bad");
  });

  test("limits depth instead of exploding", function () {
    const deep = { a: { b: { c: { d: { e: 1 } } } } };
    expect(formatValue(deep)).toContain("…");
  });
});

describe("formatArgs", function () {
  test("joins console arguments with a single space", function () {
    expect(formatArgs(["a", 1, true])).toBe("a 1 true");
  });

  test("handles no arguments", function () {
    expect(formatArgs([])).toBe("");
  });
});
