import { useEffect, useState } from "react";

const VALID_PATHS = {
  "/": true,
  "/rules": true,
  "/lessons": true,
  "/lesson": true,
  "/cheatsheet": true,
  "/project": true,
  "/playground": true,
};

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch (err) {
    return value;
  }
}

export function parseHash(hash) {
  let raw = String(hash || "").replace(/^#/, "");
  if (!raw || raw === "/") {
    return { path: "/", param: null, query: {} };
  }

  const query = {};
  const queryIndex = raw.indexOf("?");
  if (queryIndex !== -1) {
    const search = raw.slice(queryIndex + 1);
    raw = raw.slice(0, queryIndex);
    try {
      const params = new URLSearchParams(search);
      params.forEach(function (value, key) {
        query[key] = value;
      });
    } catch (err) {
      // ignore malformed query strings
    }
  }

  const parts = raw.split("/").filter(Boolean).map(safeDecode);
  let path = "/" + (parts[0] || "");

  if (VALID_PATHS[path] !== true) {
    return { path: "/", param: null, query: {} };
  }

  let param = parts[1] || null;
  if (path === "/lesson" && !param) path = "/lessons";
  if (path === "/lesson" && !/^\d+$/.test(param)) path = "/lessons";

  return { path, param, query };
}

export function routeKey(route) {
  return route.path + (route.param ? "/" + route.param : "");
}

export function navigate(path) {
  const next = "#" + path;
  if (window.location.hash !== next) {
    window.location.hash = path;
  }
}

export function useRoute() {
  const [route, setRoute] = useState(function () {
    if (typeof window === "undefined") return { path: "/", param: null, query: {} };
    return parseHash(window.location.hash);
  });

  useEffect(function () {
    function sync() {
      setRoute(parseHash(window.location.hash));
    }
    window.addEventListener("hashchange", sync);
    sync();
    return function () {
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return route;
}
