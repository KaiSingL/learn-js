import { useCallback, useEffect, useState } from "react";
import { parseProgress, readStorage, writeStorage } from "./progress.js";

export function useProgress() {
  const [completed, setCompleted] = useState(function () {
    if (typeof window === "undefined") return [];
    return parseProgress(readStorage(window.localStorage));
  });

  useEffect(function () {
    if (typeof window === "undefined") return;
    writeStorage(window.localStorage, completed);
  }, [completed]);

  const isDone = useCallback(
    function (id) {
      return completed.indexOf(String(id)) !== -1;
    },
    [completed]
  );

  const toggle = useCallback(function (id) {
    const key = String(id);
    setCompleted(function (prev) {
      if (prev.indexOf(key) !== -1) {
        return prev.filter(function (item) {
          return item !== key;
        });
      }
      return prev.concat([key]);
    });
  }, []);

  const mark = useCallback(function (id) {
    const key = String(id);
    setCompleted(function (prev) {
      if (prev.indexOf(key) !== -1) return prev;
      return prev.concat([key]);
    });
  }, []);

  const reset = useCallback(function () {
    setCompleted([]);
  }, []);

  return { completed, isDone, toggle, mark, reset };
}
