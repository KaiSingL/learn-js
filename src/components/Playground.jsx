import { useEffect, useMemo, useRef, useState } from "react";
import { lintSource, summarize } from "../lib/lint.js";
import {
  DEFAULT_PRESET,
  PREVIEW_HTML,
  PRESET_GROUPS,
  getPreset,
} from "../lib/presets.js";
import { runInIframe, runInWorker } from "../lib/sandbox.js";
import { navigate } from "../lib/router.js";
import Icon from "./Icon.jsx";
import { PageHeader, Pill } from "./PageHeader.jsx";
import PreviewPane from "./PreviewPane.jsx";

const CUSTOM = "custom";

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(function () {});
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.top = "-1000px";
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    // ignore
  }
  document.body.removeChild(area);
}

export default function Playground({ route, request }) {
  const initial = (route.query.preset && getPreset(route.query.preset)) || DEFAULT_PRESET;
  const [presetId, setPresetId] = useState(initial.id);
  const [code, setCode] = useState(initial.code);
  const [label, setLabel] = useState(initial.label);
  const [base, setBase] = useState({ code: initial.code, label: initial.label });
  const [mode, setMode] = useState("console");
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [duration, setDuration] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [previewRun, setPreviewRun] = useState(0);

  const editorRef = useRef(null);
  const gutterRef = useRef(null);
  const logHostRef = useRef(null);
  const hiddenHostRef = useRef(null);
  const runnerRef = useRef(null);
  const startedRef = useRef(0);
  const lastRequestRef = useRef(0);

  const violations = useMemo(function () {
    return lintSource(code);
  }, [code]);
  const summary = summarize(violations);
  const lineCount = code.split("\n").length;
  const preset = getPreset(presetId);
  const note = preset ? preset.note : label;

  useEffect(
    function () {
      if (!request || !request.at || request.at === lastRequestRef.current) return;
      lastRequestRef.current = request.at;
      setPresetId(CUSTOM);
      setCode(request.code);
      setLabel(request.label || "Custom code");
      setLogs([]);
      setStatus("idle");
      setDuration(null);
      setFallback(false);
    },
    [request]
  );

  useEffect(
    function () {
      const id = route.query.preset;
      if (!id || id === CUSTOM || id === presetId) return;
      if (!getPreset(id)) return;
      choosePreset(id);
    },
    // Only react to the URL. Depending on presetId here makes the effect fire
    // with a stale route right after choosePreset updates the state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [route.query.preset]
  );

  useEffect(
    function () {
      return function () {
        const runner = runnerRef.current;
        runnerRef.current = null;
        if (runner) {
          if (runner.cancel) runner.cancel();
          if (runner.destroy) runner.destroy();
        }
      };
    },
    []
  );

  useEffect(
    function () {
      if (logHostRef.current) {
        logHostRef.current.scrollTop = logHostRef.current.scrollHeight;
      }
    },
    [logs]
  );

  function handleEvent(event) {
    if (event.type === "log") {
      setLogs(function (prev) {
        return prev.concat([{ kind: "log", text: event.payload }]);
      });
    } else if (event.type === "warn") {
      setLogs(function (prev) {
        return prev.concat([{ kind: "warn", text: event.payload }]);
      });
    } else if (event.type === "error") {
      setLogs(function (prev) {
        const next = prev.concat([{ kind: "error", text: event.payload }]);
        if (
          event.payload.indexOf("document is not defined") !== -1 ||
          event.payload.indexOf("window is not defined") !== -1
        ) {
          return next.concat([
            {
              kind: "hint",
              text: "Console mode has no DOM. Switch to Preview to run document or window code.",
            },
          ]);
        }
        return next;
      });
    } else if (event.type === "result") {
      setLogs(function (prev) {
        return prev.concat([{ kind: "result", text: "=> " + event.payload }]);
      });
    } else if (event.type === "done") {
      setStatus(event.timedOut ? "timeout" : "done");
      setFallback(!!event.fallback && mode !== "preview");
      setDuration(Date.now() - startedRef.current);
      const runner = runnerRef.current;
      runnerRef.current = null;
      if (event.fallback && runner && runner.destroy) {
        runner.destroy();
      }
    }
  }

  function stop() {
    const runner = runnerRef.current;
    runnerRef.current = null;
    if (!runner) return;
    if (runner.cancel) runner.cancel();
    if (runner.destroy) runner.destroy();
  }

  function run() {
    if (status === "running") {
      stop();
      setStatus("idle");
      return;
    }

    stop();
    setLogs([]);
    setDuration(null);
    setFallback(false);
    setStatus("running");
    startedRef.current = Date.now();

    if (mode === "preview") {
      setPreviewRun(function (value) {
        return value + 1;
      });
      return;
    }

    const options = { code, timeout: 2200, onEvent: handleEvent };
    try {
      runnerRef.current = runInWorker(options);
    } catch (err) {
      setFallback(true);
      runnerRef.current = runInIframe({
        code,
        html: PREVIEW_HTML,
        container: hiddenHostRef.current,
        onEvent: handleEvent,
      });
    }
  }

  function choosePreset(id) {
    if (id === CUSTOM) {
      setPresetId(CUSTOM);
      return;
    }
    const next = getPreset(id);
    if (!next) return;
    stop();
    setPresetId(id);
    setLabel(next.label);
    setCode(next.code);
    setLogs([]);
    setStatus("idle");
    setDuration(null);
    setFallback(false);
    setPreviewRun(0);
    navigate("/playground?preset=" + id);
  }

  function resetPreset() {
    const target = preset || DEFAULT_PRESET;
    stop();
    setCode(target.code);
    setLabel(target.label);
    setLogs([]);
    setStatus("idle");
    setDuration(null);
    setFallback(false);
    setPreviewRun(0);
  }

  function jump(violation) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const start = violation.index;
    const end = start + Math.max(1, String(violation.found).length);
    editor.setSelectionRange(start, end);
    const lineHeight = 21;
    editor.scrollTop = Math.max(0, (violation.line - 1) * lineHeight - 40);
    if (gutterRef.current) gutterRef.current.scrollTop = editor.scrollTop;
  }

  function onKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      run();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const editor = event.currentTarget;
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      const next = code.slice(0, start) + "  " + code.slice(end);
      setCode(next);
      window.requestAnimationFrame(function () {
        editor.selectionStart = start + 2;
        editor.selectionEnd = start + 2;
      });
    }
  }

  const statusLabel =
    status === "idle"
      ? "ready"
      : status === "running"
        ? "running"
        : status === "timeout"
          ? "timeout"
          : duration === null
            ? "done"
            : duration + " ms";

  const statusTone =
    status === "timeout" ? "danger" : status === "running" ? "accent" : status === "done" ? "good" : "muted";

  return (
    <div>
      <PageHeader
        eyebrow="Section 05 — Playground"
        title="Run real code"
        subtitle="A worker-isolated console, a rule checker that points at the exact token, and a visible preview for DOM code. Nothing is bundled and nothing is transpiled."
        aside={
          <div className="flex flex-wrap gap-2">
            <div className="flex overflow-hidden rounded-lg border border-line">
              <button
                type="button"
                onClick={function () {
                  stop();
                  setMode("console");
                  setStatus("idle");
                }}
                aria-pressed={mode === "console"}
                className={
                  "mono px-3 py-2 text-[10px] uppercase tracking-wide " +
                  (mode === "console" ? "bg-accent text-black" : "bg-card2 text-muted")
                }
              >
                Console
              </button>
              <button
                type="button"
                onClick={function () {
                  stop();
                  setMode("preview");
                  setStatus("idle");
                }}
                aria-pressed={mode === "preview"}
                className={
                  "mono px-3 py-2 text-[10px] uppercase tracking-wide " +
                  (mode === "preview" ? "bg-accent text-black" : "bg-card2 text-muted")
                }
              >
                Preview
              </button>
            </div>
          </div>
        }
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="preset-select">
          Preset
        </label>
        <select
          id="preset-select"
          value={presetId}
          onChange={function (event) {
            choosePreset(event.target.value);
          }}
          className="mono h-10 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-[11px] text-paper focus:border-accent/50 focus:outline-none"
        >
          {presetId === CUSTOM ? <option value={CUSTOM}>Custom — {label}</option> : null}
          {PRESET_GROUPS.map(function (group) {
            return (
              <optgroup key={group.id} label={group.label}>
                {group.presets.map(function (item) {
                  return (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  );
                })}
              </optgroup>
            );
          })}
        </select>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={resetPreset} className="btn h-10 px-3" title="Reset to the preset code">
            <Icon name="reset" size={13} />
            Reset
          </button>
          <button type="button" onClick={function () { copyText(code); }} className="btn h-10 px-3">
            <Icon name="copy" size={13} />
            Copy
          </button>
          <button type="button" onClick={run} className="btn btn-accent h-10 px-4" aria-label={status === "running" ? "Stop code" : "Run code"}>
            <Icon name={status === "running" ? "close" : "play"} size={13} />
            {status === "running" ? "Stop" : "Run"}
          </button>
        </div>
      </div>

      <p className="mono mb-4 text-[10.5px] leading-[1.5] text-muted">
        {note} <span className="text-muted/50">· Ctrl/Cmd+Enter to run · Tab inserts two spaces</span>
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-card border border-line bg-card">
            <div className="flex h-11 items-center justify-between border-b border-line bg-card2 px-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-good" />
                <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">Editor</span>
              </div>
              <span className="mono text-[10px] text-muted">
                {lineCount} lines · {code.length} chars
              </span>
            </div>

            <div className="flex h-[320px] lg:h-[440px]">
              <div
                ref={gutterRef}
                aria-hidden="true"
                className="mono h-full w-10 shrink-0 overflow-hidden border-r border-line/60 bg-card2/60 px-2 py-3 text-right text-[11px] leading-[21px] text-muted/40"
              >
                {Array.from({ length: lineCount }, function (_, index) {
                  return <div key={index}>{index + 1}</div>;
                })}
              </div>
              <textarea
                ref={editorRef}
                value={code}
                onChange={function (event) {
                  setCode(event.target.value);
                }}
                onKeyDown={onKeyDown}
                onScroll={function (event) {
                  if (gutterRef.current) gutterRef.current.scrollTop = event.target.scrollTop;
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                aria-label="Code editor"
                className="mono h-full min-w-0 flex-1 resize-none bg-ink p-3 text-[12.5px] leading-[21px] text-paper focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-t border-line bg-card px-4 py-2">
              <span className="mono text-[10px] text-muted">var / function / prototype / for(;;)</span>
              <span className="mono text-[10px] text-muted">
                {summary.errors === 0 && summary.advice === 0
                  ? "clean"
                  : summary.errors + " errors · " + summary.advice + " advice"}
              </span>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-card border border-line bg-card">
            <div className="flex h-10 items-center justify-between border-b border-line bg-card2 px-4">
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted">Rule check</span>
              <div className="flex items-center gap-2">
                {summary.errors === 0 ? (
                  <Pill tone="good">no errors</Pill>
                ) : (
                  <Pill tone="danger">{summary.errors} errors</Pill>
                )}
                {summary.advice > 0 ? <Pill tone="accent">{summary.advice} advice</Pill> : null}
              </div>
            </div>

            {violations.length === 0 ? (
              <div className="flex items-start gap-2 p-4">
                <Icon name="check" size={13} className="mt-0.5 shrink-0 text-good" />
                <p className="mono text-[11px] leading-[1.6] text-muted">
                  No forbidden syntax found. This is the form the engine runs.
                </p>
              </div>
            ) : (
              <div className="max-h-[220px] overflow-y-auto">
                {violations.slice(0, 40).map(function (violation, index) {
                  return (
                    <button
                      key={violation.index + ":" + violation.ruleId + ":" + index}
                      type="button"
                      onClick={function () {
                        jump(violation);
                      }}
                      className="flex w-full items-start gap-3 border-b border-line/50 px-4 py-2 text-left transition-colors last:border-b-0 hover:bg-card2/60"
                    >
                      <span className="mono w-12 shrink-0 pt-0.5 text-[10px] text-muted">
                        {violation.line}:{violation.col}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-2">
                          <span
                            className={
                              "mono text-[11px] " +
                              (violation.severity === "advice" ? "text-accent" : "text-danger")
                            }
                          >
                            {violation.label}
                          </span>
                          <span className="mono truncate text-[10px] text-muted">{violation.found}</span>
                        </span>
                        <span className="mono mt-1 block text-[10px] leading-[1.5] text-muted">
                          write: {violation.real}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {violations.length > 40 ? (
              <div className="mono border-t border-line px-4 py-2 text-[10px] text-muted">
                Showing the first 40 of {violations.length} findings.
              </div>
            ) : null}
          </div>
        </div>

        <div className="min-w-0">
          {mode === "console" ? (
            <div className="overflow-hidden rounded-card border border-line bg-card">
              <div className="flex h-11 items-center justify-between border-b border-line bg-card2 px-4">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      "h-2 w-2 rounded-full " +
                      (status === "timeout"
                        ? "bg-danger"
                        : status === "running"
                          ? "bg-accent"
                          : "bg-good")
                    }
                  />
                  <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Console
                  </span>
                  <Pill tone={statusTone}>{statusLabel}</Pill>
                </div>
                <button
                  type="button"
                  onClick={function () {
                    setLogs([]);
                    setStatus("idle");
                    setDuration(null);
                  }}
                  className="mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper"
                >
                  Clear
                </button>
              </div>

              <div
                ref={logHostRef}
                className="h-[320px] overflow-y-auto p-4 lg:h-[440px]"
                aria-live="polite"
              >
                {logs.length === 0 ? (
                  <p className="mono text-[12px] leading-[1.7] text-muted/60">
                    Run the code to see console output. The return value is shown with a =&gt; prefix.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {logs.map(function (log, index) {
                      let tone = "text-paper";
                      if (log.kind === "error") tone = "text-danger";
                      else if (log.kind === "warn") tone = "text-accent";
                      else if (log.kind === "result") tone = "text-sky";
                      else if (log.kind === "hint") tone = "text-muted";
                      return (
                        <div key={index} className="mono flex gap-2 text-[12px] leading-[1.7]">
                          <span className="w-5 shrink-0 select-none text-right text-muted/40">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className={"min-w-0 whitespace-pre-wrap break-words " + tone}>
                            {log.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {status === "timeout" ? (
                  <div className="mono mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[11px] leading-[1.5] text-danger">
                    Stopped after 2.2s. A synchronous loop cannot be interrupted politely, so the
                    worker was terminated.
                  </div>
                ) : null}
                {fallback ? (
                  <div className="mono mt-3 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] leading-[1.5] text-accent">
                    Workers are unavailable here, so the code ran in an iframe without the hard
                    timeout.
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-line bg-card px-4 py-2">
                <span className="mono text-[10px] text-muted">
                  {logs.length} line{logs.length === 1 ? "" : "s"}
                </span>
                <span className="mono text-[10px] text-muted">
                  worker · no DOM · no storage · no network
                </span>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-card border border-line bg-card">
              <div className="flex h-11 items-center justify-between border-b border-line bg-card2 px-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-good" />
                  <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Preview
                  </span>
                  <Pill tone={statusTone}>{statusLabel}</Pill>
                </div>
                <button type="button" onClick={run} className="btn h-7 px-3" aria-label="Run preview">
                  <Icon name="play" size={11} />
                  Run
                </button>
              </div>
              <div className="p-3">
                <PreviewPane
                  code={code}
                  html={PREVIEW_HTML}
                  runSignal={previewRun}
                  onEvent={handleEvent}
                  height={360}
                  placeholder="Press Run to execute the code in a visible sandboxed frame."
                />
              </div>
              <div className="border-t border-line px-4 py-2">
                <p className="mono text-[10px] leading-[1.5] text-muted">
                  Preview has a real DOM. A synchronous infinite loop cannot be interrupted here; use
                  Console mode when you need the hard timeout.
                </p>
              </div>
              {logs.length > 0 ? (
                <div className="max-h-[100px] overflow-y-auto border-t border-line bg-card2/50 px-4 py-2">
                  {logs.slice(-4).map(function (log, index) {
                    return (
                      <div
                        key={index}
                        className={
                          "mono truncate text-[10.5px] leading-[1.6] " +
                          (log.kind === "error" ? "text-danger" : "text-muted")
                        }
                      >
                        {log.text}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              {
                title: "Isolated run",
                body: "Console mode uses a dedicated worker and is terminated after 2.2s.",
              },
              {
                title: "Rule checker",
                body: "Tokenized, so strings and comments are ignored and positions are exact.",
              },
              {
                title: "No build step",
                body: "The site ships as one HTML file. The sandbox is created in the browser.",
              },
            ].map(function (card) {
              return (
                <div key={card.title} className="rounded-panel border border-line bg-card p-3">
                  <div className="mono text-[10px] uppercase tracking-wide text-paper">{card.title}</div>
                  <p className="mono mt-1 text-[10px] leading-[1.55] text-muted">{card.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div ref={hiddenHostRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
