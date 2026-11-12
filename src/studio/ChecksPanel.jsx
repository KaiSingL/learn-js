import React from "react";

// The living version of the concept review: verdict counts per lesson,
// forward references, orphan names, cycles, quiz-tag errors.
export default function ChecksPanel(props) {
  const { lessons, order, verdictOf, problems, gate, onWarnClick } = props;

  const totals = { unmarked: 0, ok: 0, consolidation: 0, heavy: 0, violation: 0 };
  lessons.forEach(function (_, li) {
    order[li].forEach(function (id) {
      totals[verdictOf(id)] += 1;
    });
  });
  const all = order.reduce(function (acc, ids) { return acc + ids.length; }, 0);

  return (
    <div className="text-sm space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Discipline check</h2>
        <p className="text-[11px] text-cs-muted mt-0.5">
          One concept = one new idea ({all} concepts across {lessons.length} lessons)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <Stat label="1 new idea" value={totals.ok} color="#059669" />
        <Stat label="consolidation" value={totals.consolidation} color="#0284c7" />
        <Stat label="heavy" value={totals.heavy} color="#d97706" />
        <Stat label="2+ new ideas" value={totals.violation} color="#e11d48" />
        <Stat label="unmarked" value={totals.unmarked} color="#94a3b8" />
        <Stat label="total" value={all} color="#334155" />
      </div>

      <Section title="Forward references" count={problems.forward.length} tone={problems.forward.length ? "warn" : "good"}>
        {problems.forward.length === 0 && <p className="text-[11px] text-cs-chip-muted">No name is used before its lesson. Clean.</p>}
        {problems.forward.map(function (p, i) {
          return (
            <ProblemRow key={i} onClick={function () { onWarnClick(p.user.id); }}>
              <span className="font-mono text-[10px] text-cs-chip-faint">{p.user.id}</span> {p.reason}
            </ProblemRow>
          );
        })}
      </Section>

      <Section title="Orphan names — never taught" count={problems.orphan.length} tone={problems.orphan.length ? "warn" : "good"}>
        {problems.orphan.length === 0 && <p className="text-[11px] text-cs-chip-muted">Every used name has a homeland.</p>}
        {problems.orphan.map(function (p, i) {
          return (
            <ProblemRow key={i} onClick={function () { onWarnClick(p.user.id); }}>
              <span className="font-mono text-[10px] text-cs-chip-faint">{p.user.id}</span> {p.reason}
            </ProblemRow>
          );
        })}
      </Section>

      <Section title="Quiz tags" count={problems.quiz.length} tone={problems.quiz.length ? "bad" : "good"}>
        {problems.quiz.length === 0 && <p className="text-[11px] text-cs-chip-muted">Every tests: tag resolves to this-or-earlier lesson.</p>}
        {problems.quiz.map(function (e, i) {
          return <ProblemRow key={i}>{e.reason}</ProblemRow>;
        })}
      </Section>

      {(problems.broken.length > 0 || problems.cycles.length > 0) && (
        <Section title="Graph integrity" count={problems.broken.length + problems.cycles.length} tone="warn">
          {problems.broken.map(function (p, i) {
            return <ProblemRow key={i}>{p.reason}</ProblemRow>;
          })}
          {problems.cycles.map(function (c, i) {
            return <ProblemRow key={"c" + i}>cycle: {c.join(" → ")}</ProblemRow>;
          })}
        </Section>
      )}

      <Section title="Per-lesson shape" count={0} tone="neutral">
        <div className="space-y-1">
          {lessons.map(function (lesson, li) {
            const counts = { unmarked: 0, ok: 0, consolidation: 0, heavy: 0, violation: 0 };
            order[li].forEach(function (id) { counts[verdictOf(id)] += 1; });
            return (
              <div key={lesson.id} className="flex items-center gap-1.5 text-[11px]">
                <span className="font-mono text-cs-chip-faint w-7 shrink-0">L{lesson.id}</span>
                <span className="flex-1 truncate text-cs-chip-muted">{lesson.title}</span>
                <Count color="#059669" n={counts.ok} title="1 new idea" />
                <Count color="#0284c7" n={counts.consolidation} title="consolidation" />
                <Count color="#d97706" n={counts.heavy} title="heavy" />
                <Count color="#e11d48" n={counts.violation} title="2+ new" />
                <Count color="#94a3b8" n={counts.unmarked} title="unmarked" />
              </div>
            );
          })}
        </div>
      </Section>

      <div className="text-[10px] text-cs-faint leading-relaxed border-t border-cs-line pt-3">
        <p>
          <b>Gate:</b>{" "}
          {gate.state === "ok"
            ? "serializer reproduces every concept block byte-for-byte — merge is trusted."
            : gate.state === "failed"
              ? "serializer gate FAILED — the merge CLI will refuse to write."
              : gate.state === "off"
                ? "raw source unavailable (build without dev server) — the CLI still gates on merge."
                : "checking…"}
        </p>
        <p className="mt-1">
          Edits are not live: <b>Export merge file</b> → <code className="font-code">npm run studio:merge concept-studio-export.json</code>{" "}
          → refresh.
        </p>
      </div>
    </div>
  );
}

function Stat(props) {
  return (
    <div className="border border-cs-chip-line rounded-xl px-2.5 py-2 bg-cs-chip-soft">
      <p className="text-lg font-bold leading-none" style={{ color: props.color }}>
        {props.value}
      </p>
      <p className="text-[9px] text-cs-chip-muted mt-1 leading-tight">{props.label}</p>
    </div>
  );
}

function Count(props) {
  return (
    <span className="w-4 text-right font-semibold" style={{ color: props.n ? props.color : "#cbd5e1" }} title={props.title}>
      {props.n}
    </span>
  );
}

function Section(props) {
  const tone =
    props.tone === "bad"
      ? "border-rose-200 bg-rose-50/60"
      : props.tone === "warn"
        ? "border-amber-200 bg-amber-50/50"
        : props.tone === "good"
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-cs-chip-line bg-cs-chip-soft";
  return (
    <div className={"border rounded-xl p-2.5 " + tone}>
      <p className="text-[11px] font-bold flex items-center gap-2 text-cs-chip-ink">
        {props.title}
        {props.count > 0 && (
          <span className="text-[10px] bg-cs-chip border border-cs-chip-line rounded-full px-1.5 py-0.5 text-cs-chip-muted">{props.count}</span>
        )}
      </p>
      <div className="mt-1.5 space-y-1">{props.children}</div>
    </div>
  );
}

function ProblemRow(props) {
  return (
    <button
      onClick={props.onClick}
      className="block w-full text-left text-[11px] leading-snug text-cs-chip-muted hover:text-indigo-700 bg-cs-chip-soft border border-cs-chip-line rounded-lg px-2 py-1.5"
    >
      {props.children}
    </button>
  );
}
