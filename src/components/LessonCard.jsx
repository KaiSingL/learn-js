import { useState } from "react";
import CodeBlock from "./CodeBlock.jsx";
import Concepts from "./Concepts.jsx";
import Icon from "./Icon.jsx";
import Quiz from "./Quiz.jsx";

export default function LessonCard({
  lesson,
  expanded,
  onToggle,
  progress,
  onPlayground,
  onNavigate,
  isFirst,
  isLast,
}) {
  const [showSolutions, setShowSolutions] = useState(false);
  const done = progress.isDone(lesson.id);
  const firstLine = lesson.concepts
    ? lesson.concepts[0].heading
    : lesson.realCode.split("\n")[0];

  return (
    <article
      id={"lesson-" + lesson.id}
      className={
        "group overflow-hidden rounded-card border bg-card transition-colors " +
        (expanded ? "border-accent/30" : "border-line hover:border-line/80")
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={"lesson-body-" + lesson.id}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left lg:px-6 lg:py-5"
      >
        <div className="flex min-w-0 gap-4 lg:gap-5">
          <span
            className={
              "mono flex h-fit shrink-0 items-center rounded border px-2 py-1.5 text-[12px] font-bold leading-none " +
              (expanded
                ? "border-accent bg-accent text-black"
                : done
                  ? "border-good/30 bg-good/10 text-good"
                  : "border-line bg-card2 text-muted")
            }
          >
            {String(lesson.id).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold leading-[1.25] lg:text-[16px]">
                {lesson.title}
              </span>
              <span className="mono rounded-full border border-line bg-card2 px-2 py-0.5 text-[9.5px] uppercase tracking-wide text-muted">
                {lesson.sugarReplaces}
              </span>
              {lesson.tier === 1 ? (
                <span className="mono inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9.5px] uppercase tracking-wide text-accent">
                  tier 1
                </span>
              ) : null}
              {done ? (
                <span className="mono inline-flex items-center gap-1 rounded-full border border-good/30 bg-good/10 px-2 py-0.5 text-[9.5px] uppercase tracking-wide text-good">
                  <Icon name="check" size={10} />
                  complete
                </span>
              ) : null}
            </span>
            <span className="mt-1.5 block text-[12.5px] leading-[1.5] text-muted">{lesson.goal}</span>
          </span>
        </div>
        <span className="hidden shrink-0 items-center gap-3 lg:flex">
          <span className="mono text-[10px] uppercase tracking-wide text-muted">You will write</span>
          <span
            className={
              "flex h-7 w-7 items-center justify-center rounded-full border transition-transform " +
              (expanded
                ? "rotate-180 border-accent bg-accent text-black"
                : "border-line bg-card2 text-paper")
            }
          >
            <Icon name="chevronDown" size={13} />
          </span>
        </span>
      </button>

      {!expanded ? (
        <div className="px-5 pb-4 lg:px-6">
          <div className="mono overflow-hidden text-ellipsis whitespace-nowrap rounded-md border border-line bg-card2 px-3 py-2 text-[11.5px] text-muted">
            {firstLine}
          </div>
        </div>
      ) : (
        <div
          id={"lesson-body-" + lesson.id}
          className="anim-fade-in border-t border-line bg-card2/40"
        >
          <div className="min-w-0 space-y-5 p-5 lg:p-6">
            <div>
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.14em] text-muted">Goal</div>
              <p className="text-[13px] leading-[1.7] text-paper/80">
                {lesson.concepts ? lesson.intro : lesson.longDesc}
              </p>
            </div>

            {lesson.concepts ? (
              <Concepts concepts={lesson.concepts} onPlayground={onPlayground} />
            ) : (
              <>
                <CodeBlock
                  label={"Real code — lesson " + lesson.id}
                  code={lesson.realCode}
                  onPlayground={onPlayground}
                />
                <CodeBlock
                  label="Extra real pattern"
                  code={lesson.extraReal}
                  onPlayground={onPlayground}
                />
              </>
            )}

            <div className="rounded-panel border border-line bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="mono text-[11px] font-semibold uppercase tracking-[0.12em]">
                    Exercise
                  </span>
                </div>
                <button
                  type="button"
                  onClick={function () {
                    setShowSolutions(function (value) {
                      return !value;
                    });
                  }}
                  className="mono text-[10px] uppercase tracking-wide text-accent transition-opacity hover:opacity-80"
                  aria-expanded={showSolutions}
                >
                  {showSolutions ? "Hide solution" : "Show solution"}
                </button>
              </div>
              <p className="mono text-[12px] leading-[1.65] text-paper/80">{lesson.exercise}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={function () {
                    onPlayground(lesson.starter, "Lesson " + lesson.id + " starter");
                  }}
                  className="btn h-8 px-3"
                >
                  <Icon name="play" size={11} />
                  Load starter
                </button>
                {lesson.solutions[0] ? (
                  <button
                    type="button"
                    onClick={function () {
                      onPlayground(
                        lesson.solutions[0].code,
                        "Lesson " + lesson.id + " solution"
                      );
                    }}
                    className="btn h-8 px-3"
                  >
                    <Icon name="code" size={12} />
                    Run solution
                  </button>
                ) : null}
              </div>

              {showSolutions ? (
                <div className="mt-4 space-y-3 border-t border-line pt-4">
                  {lesson.solutions.map(function (solution, index) {
                    return (
                      <div key={solution.title}>
                        <div className="flex items-center gap-2">
                          <span className="mono text-[10px] uppercase tracking-wide text-accent">
                            Solution {index + 1}
                          </span>
                          <span className="text-[11.5px] font-medium text-paper/90">
                            {solution.title}
                          </span>
                        </div>
                        <p className="mt-1 text-[11.5px] leading-[1.6] text-muted">{solution.note}</p>
                        <CodeBlock
                          code={solution.code}
                          label={"lesson " + lesson.id + " · solution " + (index + 1)}
                          onPlayground={onPlayground}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div>
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.14em] text-muted">
                Rules to remember
              </div>
              <div className="space-y-1.5">
                {lesson.checklist.map(function (item) {
                  return (
                    <div
                      key={item}
                      className="mono flex gap-2 text-[11px] leading-[1.45] text-muted"
                    >
                      <span className="text-good">✓</span>
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-panel bg-accent p-3 text-black">
              <div className="mono mb-1 text-[10px] font-bold uppercase tracking-wide opacity-60">
                Real talk
              </div>
              <p className="mono text-[11px] leading-[1.5]">{lesson.realTalk}</p>
            </div>

            <Quiz items={lesson.quiz} label={"Lesson " + lesson.id + " check"} />

            <button
              type="button"
              onClick={function () {
                progress.toggle(lesson.id);
              }}
              aria-pressed={done}
              className={
                "flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-[11px] font-medium transition-colors " +
                (done
                  ? "border-good/40 bg-good/10 text-good"
                  : "border-line bg-card2 text-muted hover:text-paper")
              }
            >
              <Icon name="check" size={13} />
              {done ? "Marked complete" : "Mark lesson complete"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isFirst}
                onClick={function () {
                  onNavigate("/lesson/" + (lesson.id - 1));
                }}
                className="mono flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-card2 text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="arrowLeft" size={12} />
                Previous
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={function () {
                  onNavigate("/lesson/" + (lesson.id + 1));
                }}
                className="mono flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-card2 text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <Icon name="arrowRight" size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
