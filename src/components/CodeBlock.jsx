import { useState } from "react";
import { highlight } from "../lib/highlight.jsx";
import { useInlineRun } from "../lib/useInlineRun.js";
import Icon from "./Icon.jsx";

function legacyCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (err) {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

const STATUS_TEXT = {
  running: "running…",
  timeout: "stopped after 2.2s",
  blocked: "blocked by course rules",
};

export default function CodeBlock({
  code,
  label,
  onPlayground,
  minimal = false,
  className = "",
  maxHeight,
}) {
  const [copied, setCopied] = useState(false);
  const output = useInlineRun(code);
  const hasOutput = output.lines.length > 0 || output.status === "running";

  function copy() {
    function done() {
      setCopied(true);
      window.setTimeout(function () {
        setCopied(false);
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, function () {
        if (legacyCopy(code)) done();
      });
    } else if (legacyCopy(code)) {
      done();
    }
  }

  const action = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={output.run}
        className="btn h-7 px-2 gap-1"
        title="Run this code here"
      >
        <Icon name="play" size={11} />
        <span className="hidden sm:inline">Run</span>
      </button>
      {onPlayground ? (
        <button
          type="button"
          onClick={function () {
            onPlayground(code);
          }}
          className="btn h-7 w-7 p-0"
          aria-label="Copy to playground"
          title="Copy to playground"
        >
          <Icon name="squareArrowOutUpRight" size={12} />
        </button>
      ) : null}
      <button
        type="button"
        onClick={copy}
        className="btn h-7 px-2 gap-1"
        aria-label={copied ? "Copied" : "Copy code"}
        title="Copy code"
      >
        <Icon name={copied ? "check" : "copy"} size={12} />
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );

  return (
    <div
      className={
        "relative overflow-hidden rounded-lg border border-line bg-card2 " +
        (minimal ? "" : "mt-3 ") +
        className
      }
    >
      {label ? (
        <div className="flex items-center justify-between gap-2 border-b border-line bg-card px-3 py-2">
          <span className="mono truncate text-[10px] uppercase tracking-[0.12em] text-muted">
            {label}
          </span>
          {action}
        </div>
      ) : (
        <div className="absolute right-2 top-2 z-10 opacity-70 transition-opacity hover:opacity-100 focus-within:opacity-100">
          {action}
        </div>
      )}
      <pre
        className="code overflow-x-auto p-3 text-[12.5px] leading-[1.65] text-paper lg:p-4"
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        <code className="mono">{highlight(code)}</code>
      </pre>
      {hasOutput ? (
        <div className="border-t border-line bg-ink">
          <div className="flex items-center justify-between gap-2 px-3 pt-1.5">
            <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">Output</span>
            <div className="flex items-center gap-2">
              <span className="mono text-[10px] text-muted">
                {output.status === "done" && output.duration !== null
                  ? "done · " + output.duration + "ms"
                  : STATUS_TEXT[output.status] || ""}
              </span>
              <button
                type="button"
                onClick={output.clear}
                className="mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-[240px] space-y-0.5 overflow-y-auto px-3 pb-2 pt-1">
            {output.lines.map(function (line, index) {
              const tone =
                line.kind === "error"
                  ? "text-danger"
                  : line.kind === "warn"
                    ? "text-accent"
                    : line.kind === "result"
                      ? "text-muted"
                      : "text-paper/85";
              return (
                <div
                  key={index}
                  className={"mono text-[11px] leading-[1.6] whitespace-pre-wrap break-words " + tone}
                >
                  {line.text}
                </div>
              );
            })}
            {output.status === "running" ? (
              <div className="mono text-[11px] leading-[1.6] text-muted">running…</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
