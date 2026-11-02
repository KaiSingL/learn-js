import { describe, expect, test } from "bun:test";
import { parseHash, routeKey } from "../src/lib/router.js";

describe("parseHash", function () {
  test("an empty hash is the overview", function () {
    expect(parseHash("")).toEqual({ path: "/", param: null, query: {} });
    expect(parseHash("#")).toEqual({ path: "/", param: null, query: {} });
    expect(parseHash("#/")).toEqual({ path: "/", param: null, query: {} });
  });

  test("reads every top-level page", function () {
    expect(parseHash("#/rules").path).toBe("/rules");
    expect(parseHash("#/lessons").path).toBe("/lessons");
    expect(parseHash("#/cheatsheet").path).toBe("/cheatsheet");
    expect(parseHash("#/project").path).toBe("/project");
    expect(parseHash("#/playground").path).toBe("/playground");
  });

  test("reads a numeric lesson parameter", function () {
    const route = parseHash("#/lesson/5");
    expect(route.path).toBe("/lesson");
    expect(route.param).toBe("5");
  });

  test("falls back to the lesson list for a bad lesson id", function () {
    expect(parseHash("#/lesson/abc").path).toBe("/lessons");
    expect(parseHash("#/lesson/").path).toBe("/lessons");
    expect(parseHash("#/lesson").path).toBe("/lessons");
  });

  test("falls back to the overview for an unknown route", function () {
    expect(parseHash("#/does-not-exist").path).toBe("/");
    expect(parseHash("#nonsense").path).toBe("/");
  });

  test("parses the playground preset query", function () {
    const route = parseHash("#/playground?preset=lesson-1-starter");
    expect(route.path).toBe("/playground");
    expect(route.query.preset).toBe("lesson-1-starter");
  });

  test("combines a lesson route with a query", function () {
    const route = parseHash("#/lesson/5?from=search");
    expect(route.path).toBe("/lesson");
    expect(route.param).toBe("5");
    expect(route.query.from).toBe("search");
  });
});

describe("routeKey", function () {
  test("includes the parameter so lesson changes are visible", function () {
    expect(routeKey(parseHash("#/lesson/3"))).toBe("/lesson/3");
    expect(routeKey(parseHash("#/rules"))).toBe("/rules");
  });
});
