import { useState } from "react";
import { highlight } from "../lib/highlight.jsx";
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

export default function CodeBlock({
  code,
  label,
  onPlayground,
  minimal = false,
  className = "",
  maxHeight,
}) {
  const [copied, setCopied] = useState(false);

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
      {onPlayground ? (
        <button
          type="button"
          onClick={function () {
            onPlayground(code);
          }}
          className="btn h-7 px-2 gap-1"
          title="Open this code in the playground"
        >
          <Icon name="play" size={11} />
          <span className="hidden sm:inline">Run</span>
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
    </div>
  );
}
