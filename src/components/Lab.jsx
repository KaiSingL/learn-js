import { useMemo, useState } from "react";
import { lintSource, summarize } from "../lib/lint.js";
import { navigate } from "../lib/router.js";
import Icon from "./Icon.jsx";
import { PageHeader, Pill } from "./PageHeader.jsx";

export default function Lab({ onPlayground }) {
  const [source, setSource] = useState(
    `var users = [
  { name: "Ada", role: "dev" },
  { name: "Grace", role: "dev" },
];

const names = users
  .filter((u) => u.role === "dev")
  .map((u) => \`\${u.name} is a \${u.role}\`);

names.forEach((n) => console.log(n));
`
  );
  const [showTranslations, setShowTranslations] = useState(true);

  const violations = useMemo(function () {
    return lintSource(source);
  }, [source]);
  const summary = summarize(violations);

  function replaceConstruct(code, violation) {
    // Approximate de-sugar: swap the first occurrence of the found token
    // with the rule's real replacement skeleton. The real field is a general
    // pattern, so this is a guide, not a perfect transpiler.
    const found = violation.found;
    const index = code.indexOf(found);
    if (index === -1) return code;
    return code.slice(0, index) + violation.real + code.slice(index + found.length);
  }

  function translateAll() {
    let next = source;
    // Apply from last to first so earlier indexes stay valid.
    const ordered = [...violations].sort(function (a, b) { return b.index - a.index; });
    for (let i = 0; i < ordered.length; i += 1) {
      next = replaceConstruct(next, ordered[i]);
    }
    setSource(next);
    setShowTranslations(false);
  }

  const errorCount = summary.errors;
  const noteCount = summary.notes;
  const adviceCount = summary.advice;

  return (
    <div>
      <PageHeader
        eyebrow="Section 05 — De-sugar Lab"
        title="Paste modern code, see the real form"
        subtitle="Paste ES2026 sugar on the left. The lab tokenizes it, flags every Tier 2 construct, and shows the Tier 0/1 equivalent on the right. It is a guided translation, not a transpiler."
      />

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={translateAll}
          disabled={errorCount === 0 && noteCount === 0}
          className={
            "btn h-10 px-4 " +
            (errorCount === 0 && noteCount === 0 ? "opacity-50" : "btn-accent")
          }
        >
          <Icon name="code" size={12} />
          De-sugar all
        </button>
        <button
          type="button"
          onClick={function () {
            setShowTranslations(!showTranslations);
          }}
          className="btn h-10 px-4"
        >
          <Icon name="eye" size={12} />
          {showTranslations ? "Hide" : "Show"} translations
        </button>
        <button
          type="button"
          onClick={function () {
            onPlayground(source, "Lab translation");
          }}
          className="btn h-10 px-4"
        >
          <Icon name="play" size={12} />
          Open in playground
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="min-w-0">
          <div className="overflow-hidden rounded-card border border-line bg-card">
            <div className="flex h-11 items-center justify-between border-b border-line bg-card2 px-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">Modern code</span>
              </div>
              <span className="mono text-[10px] text-muted">{source.split("\n").length} lines</span>
            </div>
            <div className="flex h-[400px]">
              <textarea
                value={source}
                onChange={function (event) {
                  setSource(event.target.value);
                }}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                aria-label="Modern code input"
                className="mono h-full min-w-0 flex-1 resize-none bg-ink p-3 text-[12.5px] leading-[21px] text-paper focus:outline-none"
              />
            </div>
            <div className="border-t border-line bg-card px-4 py-2 flex items-center justify-between">
              <span className="mono text-[10px] text-muted">
                {errorCount} errors · {noteCount} notes · {adviceCount} advice
              </span>
              <span className="mono text-[10px] text-muted">
                Tier 2 = error · Tier 1 = note
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          {violations.length === 0 ? (
            <div className="overflow-hidden rounded-card border border-line bg-card p-6 text-center">
              <Icon name="check" size={20} className="mb-2 shrink-0 text-good" />
              <p className="mono text-[12px] text-muted">No sugar detected.</p>
              <p className="mt-1 mono text-[11px] text-muted/60">
                Everything here is already Tier 0/1 real code.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {violations.map(function (violation, index) {
                const isNote = violation.severity === "note";
                return (
                  <div
                    key={violation.index + ":" + violation.ruleId + ":" + index}
                    className="overflow-hidden rounded-card border border-line bg-card"
                  >
                    <div className="flex h-10 items-center justify-between border-b border-line bg-card2 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            "h-2 w-2 rounded-full shrink-0 " +
                            (isNote ? "bg-accent" : "bg-danger")
                          }
                        />
                        <span className="mono text-[10px] font-semibold uppercase tracking-[0.12em]">
                          {violation.label}
                        </span>
                        <span className="mono text-[9px] text-muted">
                          {isNote ? "tier 1 · note" : "tier 2 · sugar"}
                        </span>
                      </div>
                      <span className="mono text-[10px] text-muted">
                        line {violation.line}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-0 divide-y divide-line/60 p-3">
                      <div className="px-3 py-2 border-r border-line/60 bg-card/30">
                        <div className="mono mb-1 text-[9px] uppercase tracking-wide text-muted/60">
                          Found (sugar)
                        </div>
                        <div className="mono text-[11px] leading-[1.5] text-paper/80 break-all">
                          <span className="text-danger/90">{violation.found}</span>
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <div className="mono mb-1 text-[9px] uppercase tracking-wide text-muted/60">
                          Write instead (real)
                        </div>
                        <div className="mono text-[11px] leading-[1.5] text-good break-all">
                          {violation.real}
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-line/60 bg-card/30">
                        <div className="mono mb-1 text-[9px] uppercase tracking-wide text-muted/60">
                          Why
                        </div>
                        <div className="mono text-[10px] leading-[1.5] text-muted">
                          {violation.why}
                        </div>
                      </div>
                      <div className="px-3 py-2">
                        <button
                          type="button"
                          onClick={function () {
                            setSource(replaceConstruct(source, violation));
                          }}
                          className="mono text-[10px] text-accent underline underline-offset-2 hover:text-accent/80"
                        >
                          Apply this fix
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-panel border border-line bg-card p-4">
        <div className="mono mb-2 text-[10px] uppercase tracking-[0.12em] text-muted">
          How to read this lab
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <span className="mono inline-flex items-center gap-1 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-danger" />
              <span className="text-[10px] text-paper">Tier 2 — sugar</span>
            </span>
            <p className="mono text-[11px] leading-[1.5] text-muted">
              Banned in exercises. The lab shows the Tier 0/1 replacement you would write by hand.
            </p>
          </div>
          <div>
            <span className="mono inline-flex items-center gap-1 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-[10px] text-paper">Tier 1 — note</span>
            </span>
            <p className="mono text-[11px] leading-[1.5] text-muted">
              Allowed but explicit. Runs fine, but carries a hidden default you should know.
            </p>
          </div>
          <div>
            <span className="mono inline-flex items-center gap-1 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-good" />
              <span className="text-[10px] text-paper">Tier 0 — primitive</span>
            </span>
            <p className="mono text-[11px] leading-[1.5] text-muted">
              The only constructs exercises use. No flags, no notes, no sugar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
