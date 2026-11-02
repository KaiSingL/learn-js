import { useState } from "react";
import { PROJECT_STEPS } from "../data/project.js";
import { navigate } from "../lib/router.js";
import CodeBlock from "./CodeBlock.jsx";
import Icon from "./Icon.jsx";
import { PageHeader, ProgressBar } from "./PageHeader.jsx";
import PreviewPane from "./PreviewPane.jsx";

function eventLine(event) {
  if (!event) return null;
  if (event.type === "log" || event.type === "result") return event.payload;
  if (event.type === "warn") return "[warn] " + event.payload;
  if (event.type === "error") return "[error] " + event.payload;
  if (event.type === "done") return event.timedOut ? "[stopped: timeout]" : "[preview ready]";
  return null;
}

export default function Project({ progress, onPlayground }) {
  const [openStep, setOpenStep] = useState(1);
  const [runs, setRuns] = useState({});
  const [events, setEvents] = useState({});

  const doneCount = PROJECT_STEPS.filter(function (step) {
    return progress.isDone("project:" + step.id);
  }).length;

  function handlePreviewEvent(stepId, event) {
    const line = eventLine(event);
    if (!line) return;
    setEvents(function (prev) {
      const current = prev[stepId] || [];
      const next = current.concat([line]);
      const trimmed = next.length > 10 ? next.slice(next.length - 10) : next;
      const copy = {};
      for (const key in prev) copy[key] = prev[key];
      copy[stepId] = trimmed;
      return copy;
    });
  }

  function runPreview(stepId) {
    setEvents(function (prev) {
      const copy = {};
      for (const key in prev) copy[key] = prev[key];
      copy[stepId] = [];
      return copy;
    });
    setRuns(function (prev) {
      const copy = {};
      for (const key in prev) copy[key] = prev[key];
      copy[stepId] = (prev[stepId] || 0) + 1;
      return copy;
    });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Section 04 — Final project"
        title="Build it for real"
        subtitle="Two deliverables, no dependencies: an EventEmitter with prototype methods, and a DOM helper that only wraps the browser API. The last step runs an assertion harness."
        aside={
          <div className="w-full rounded-panel border border-line bg-card p-3 lg:w-[230px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">Steps done</span>
              <span className="mono text-[10px]">
                {doneCount} / {PROJECT_STEPS.length}
              </span>
            </div>
            <ProgressBar value={doneCount} total={PROJECT_STEPS.length} label="Project steps completed" />
          </div>
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="layers" size={14} className="text-accent" />
            <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Deliverable 01
            </span>
          </div>
          <div className="text-[14px] font-semibold">EventEmitter</div>
          <p className="mt-1.5 text-[12px] leading-[1.6] text-muted">
            on, off, emit and once on the prototype. One storage object per instance. No class, no
            arrow handlers.
          </p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="code" size={14} className="text-accent" />
            <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Deliverable 02
            </span>
          </div>
          <div className="text-[14px] font-semibold">DOM helper</div>
          <p className="mt-1.5 text-[12px] leading-[1.6] text-muted">
            $, on, text, attr and el. Each function wraps one browser API and returns the node or an
            unsubscribe function.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {PROJECT_STEPS.map(function (step) {
          const open = openStep === step.id;
          const complete = progress.isDone("project:" + step.id);
          const signalled = runs[step.id] || 0;
          const lines = events[step.id] || [];

          return (
            <article
              key={step.id}
              id={"project-step-" + step.id}
              className={
                "overflow-hidden rounded-card border bg-card transition-colors " +
                (open ? "border-accent/30" : "border-line")
              }
            >
              <button
                type="button"
                onClick={function () {
                  setOpenStep(open ? null : step.id);
                }}
                aria-expanded={open}
                aria-controls={"project-body-" + step.id}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="flex min-w-0 gap-4">
                  <span
                    className={
                      "mono flex h-fit shrink-0 items-center rounded border px-2 py-1.5 text-[12px] font-bold leading-none " +
                      (open
                        ? "border-accent bg-accent text-black"
                        : complete
                          ? "border-good/30 bg-good/10 text-good"
                          : "border-line bg-card2 text-muted")
                    }
                  >
                    {complete && !open ? <Icon name="check" size={12} /> : String(step.id).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold">{step.title}</span>
                    <span className="mt-1 block text-[12px] leading-[1.5] text-muted">{step.goal}</span>
                  </span>
                </span>
                <Icon
                  name="chevronDown"
                  size={15}
                  className={
                    "mt-1 shrink-0 text-muted transition-transform " + (open ? "rotate-180" : "")
                  }
                />
              </button>

              {open ? (
                <div id={"project-body-" + step.id} className="border-t border-line bg-card2/40 p-5">
                  <p className="mb-4 text-[12.5px] leading-[1.65] text-muted">{step.note}</p>

                  <CodeBlock
                    label={"Step " + step.id + " — " + step.title}
                    code={step.code}
                    onPlayground={function (code) {
                      onPlayground(code, "Project step " + step.id);
                    }}
                  />

                  <div className="mt-4 flex items-start gap-2 rounded-md border border-accent/20 bg-accent/[0.06] px-3 py-2.5">
                    <Icon name="target" size={13} className="mt-0.5 shrink-0 text-accent" />
                    <p className="mono text-[11px] leading-[1.55] text-paper/75">
                      <span className="text-accent">Checkpoint: </span>
                      {step.checkpoint}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {step.preview ? (
                      <button
                        type="button"
                        onClick={function () {
                          runPreview(step.id);
                        }}
                        className="btn h-9 px-3"
                      >
                        <Icon name="play" size={12} />
                        Run preview
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={function () {
                        onPlayground(step.code, "Project step " + step.id);
                      }}
                      className="btn h-9 px-3"
                    >
                      <Icon name="terminal" size={12} />
                      Open in playground
                    </button>
                    <button
                      type="button"
                      onClick={function () {
                        progress.toggle("project:" + step.id);
                      }}
                      aria-pressed={complete}
                      className={
                        "mono ml-auto flex h-9 items-center gap-1.5 rounded-md border px-3 text-[10px] uppercase tracking-wide transition-colors " +
                        (complete
                          ? "border-good/40 bg-good/10 text-good"
                          : "border-line bg-card2 text-muted hover:text-paper")
                      }
                    >
                      <Icon name="check" size={12} />
                      {complete ? "Step complete" : "Mark step"}
                    </button>
                  </div>

                  {step.preview ? (
                    <div className="mt-4">
                      <PreviewPane
                        code={step.code}
                        html={step.previewHtml || ""}
                        runSignal={signalled}
                        onEvent={function (event) {
                          handlePreviewEvent(step.id, event);
                        }}
                        placeholder="Press Run preview to execute this step in an isolated frame."
                      />
                      {lines.length > 0 ? (
                        <div className="mono mt-2 max-h-[90px] overflow-y-auto rounded-md border border-line bg-ink p-2 text-[10.5px] leading-[1.6] text-muted">
                          {lines.map(function (line, index) {
                            return <div key={index}>{line}</div>;
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-card border border-line bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.12em] text-muted">Finished?</div>
            <p className="mt-1 max-w-[56ch] text-[13px] leading-[1.6] text-muted">
              The reference in step 6 is the full answer. Re-type it once without looking, then open
              the playground and write it again from memory. That is the only test that counts.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={function () {
                navigate("/lesson/11");
              }}
              className="btn h-9 px-3"
            >
              Lesson 11
            </button>
            <button
              type="button"
              onClick={function () {
                navigate("/playground");
              }}
              className="btn btn-accent h-9 px-3"
            >
              <Icon name="terminal" size={12} />
              Playground
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
