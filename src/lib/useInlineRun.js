import { useCallback, useEffect, useRef, useState } from "react";
import { lintSource } from "./lint.js";
import { runInIframe, runInWorker } from "./sandbox.js";

// Runs a snippet inline (no navigation) with the same sandbox the playground
// uses: worker first with loop protection, hidden iframe as fallback when
// blob workers are unavailable. Tier 2 sugar is blocked, matching the
// playground's rule that only real code runs.
export function useInlineRun(code) {
  const [lines, setLines] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | running | done | timeout | blocked
  const [duration, setDuration] = useState(null);
  const runnerRef = useRef(null);
  const hostRef = useRef(null);
  const startedRef = useRef(0);

  const stop = useCallback(function () {
    const runner = runnerRef.current;
    runnerRef.current = null;
    if (runner) {
      if (runner.cancel) runner.cancel();
      if (runner.destroy) runner.destroy();
    }
    if (hostRef.current && hostRef.current.parentNode) {
      hostRef.current.parentNode.removeChild(hostRef.current);
    }
    hostRef.current = null;
  }, []);

  useEffect(function () {
    return stop;
  }, [stop]);

  const handleEvent = useCallback(function (event) {
    if (event.type === "log" || event.type === "warn" || event.type === "error") {
      setLines(function (prev) {
        return prev.concat([{ kind: event.type, text: event.payload }]);
      });
    } else if (event.type === "result") {
      setLines(function (prev) {
        return prev.concat([{ kind: "result", text: "=> " + event.payload }]);
      });
    } else if (event.type === "done") {
      setStatus(event.timedOut ? "timeout" : "done");
      setDuration(Date.now() - startedRef.current);
      const runner = runnerRef.current;
      runnerRef.current = null;
      if (event.fallback && runner && runner.destroy) runner.destroy();
      if (hostRef.current && hostRef.current.parentNode) {
        hostRef.current.parentNode.removeChild(hostRef.current);
      }
      hostRef.current = null;
    }
  }, []);

  const run = useCallback(function () {
    const violations = lintSource(code);
    let blocked = null;
    for (let i = 0; i < violations.length; i += 1) {
      if (violations[i].severity === "error") {
        blocked = violations[i];
        break;
      }
    }

    stop();
    setDuration(null);
    if (blocked) {
      setStatus("blocked");
      setLines([
        {
          kind: "error",
          text:
            "Blocked by Tier 2 sugar: this course only runs real code (var, function, prototype). Paste sugar into the De-sugar Lab to translate it first.",
        },
      ]);
      return;
    }

    setLines([]);
    setStatus("running");
    startedRef.current = Date.now();
    const options = { code, timeout: 2200, onEvent: handleEvent };
    try {
      runnerRef.current = runInWorker(options);
    } catch (err) {
      const host = document.createElement("div");
      host.style.display = "none";
      document.body.appendChild(host);
      hostRef.current = host;
      try {
        runnerRef.current = runInIframe({ code, html: "", container: host, onEvent: handleEvent });
      } catch (fallbackErr) {
        stop();
        setStatus("done");
        setLines([{ kind: "error", text: "Could not start the sandbox in this browser." }]);
      }
    }
  }, [code, handleEvent, stop]);

  const clear = useCallback(function () {
    stop();
    setLines([]);
    setStatus("idle");
    setDuration(null);
  }, [stop]);

  return { lines, status, duration, run, clear };
}
