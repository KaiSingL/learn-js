import { CHEATSHEET } from "../data/cheatsheet.js";
import { LESSONS } from "../data/lessons.js";
import { CHECK_RULE } from "../data/rules.js";
import { countDone } from "../lib/progress.js";
import { navigate } from "../lib/router.js";
import Icon from "./Icon.jsx";
import { Pill, ProgressBar } from "./PageHeader.jsx";

const SUGAR = "const inc = () => ++count";
const REAL = `var inc = function () {
  count = count + 1;
  return count;
};`;

export default function Overview({ progress }) {
  const ids = LESSONS.map(function (lesson) {
    return lesson.id;
  });
  const done = countDone(progress.completed, ids);
  const next = (function () {
    for (let i = 0; i < LESSONS.length; i += 1) {
      if (!progress.isDone(LESSONS[i].id)) return LESSONS[i];
    }
    return LESSONS[0];
  })();

  return (
    <div className="space-y-10 lg:space-y-16">
      <section>
        <div className="eyebrow mb-6 flex items-center gap-2">
          <span className="rule" />
          Course 00 — Overview
        </div>

        <img
          src="./icon.png"
          alt="Real JS icon"
          className="mb-5 h-14 w-14 rounded-xl lg:h-16 lg:w-16"
        />

        <h1 className="max-w-[16ch] text-[38px] font-bold leading-[0.95] tracking-[-0.03em] lg:text-[58px]">
          JavaScript
          <br />
          without the
          <br />
          <span className="text-accent">magic</span>
        </h1>

        <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.6] text-muted lg:text-[17px]">
          Every shortcut removed. Only what the engine actually runs. Learn to read transpiled output
          as if you wrote it.
        </p>

        <div className="mt-8 grid max-w-[600px] grid-cols-3 gap-3">
          <div className="rounded-panel border border-line bg-card p-4">
            <div className="mono text-[22px] font-bold leading-none lg:text-[26px]">{LESSONS.length}</div>
            <div className="mono mt-2 text-[10px] uppercase leading-[1.2] tracking-[0.06em] text-muted">
              Lessons
            </div>
          </div>
          <div className="rounded-panel border border-line bg-card p-4">
            <div className="mono text-[22px] font-bold leading-none lg:text-[26px]">
              {CHEATSHEET.length}
            </div>
            <div className="mono mt-2 text-[10px] uppercase leading-[1.2] tracking-[0.06em] text-muted">
              Sugar → real
            </div>
          </div>
          <div className="rounded-panel border border-line bg-card p-4">
            <div className="mono text-[22px] font-bold leading-none lg:text-[26px]">100%</div>
            <div className="mono mt-2 text-[10px] uppercase leading-[1.2] tracking-[0.06em] text-muted">
              function + prototype
            </div>
          </div>
        </div>

        <div className="mt-4 max-w-[600px] rounded-panel border border-line bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {done === 0
                  ? "Start at the beginning"
                  : done === LESSONS.length
                    ? "You finished every lesson"
                    : "Continue where you left off"}
              </div>
              <div className="mt-1 truncate text-[13px] text-paper">
                {done === LESSONS.length
                  ? "Now build the final project."
                  : "Lesson " + next.id + " — " + next.title}
              </div>
            </div>
            <button
              type="button"
              onClick={function () {
                navigate(done === LESSONS.length ? "/project" : "/lesson/" + next.id);
              }}
              className="btn btn-accent h-9 shrink-0 px-4"
            >
              {done === LESSONS.length ? "Open project" : "Continue"}
              <Icon name="arrowRight" size={13} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={done} total={LESSONS.length} label="Lessons completed" />
            <span className="mono shrink-0 text-[10px] text-muted">
              {done}/{LESSONS.length}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-card border border-line bg-card p-6 lg:p-7">
            <div className="mono mb-4 text-[11px] uppercase tracking-[0.14em] text-accent">Purpose</div>
            <p className="text-[15px] leading-[1.7] text-paper/90">
              Modern JavaScript teaches magic first: arrow functions, classes, destructuring,
              async/await. The engine teaches none of that. Babel strips it away to functions, var,
              prototypes and callbacks. This course reverses the learning order. We start where Babel
              ends.
            </p>
            <p className="mt-4 text-[14px] leading-[1.7] text-muted">
              You will write only <span className="mono text-paper">var</span>,{" "}
              <span className="mono text-paper">function</span>,{" "}
              <span className="mono text-paper">prototype</span> and{" "}
              <span className="mono text-paper">for(;;)</span>. No sugar, no shorthand, no hidden
              this. After this, reading minified code, debugging transpiled bundles and building
              libraries without dependencies becomes obvious.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["no arrow", "no class", "no destructuring", "no async/await", "prototype only"].map(
                function (tag) {
                  return (
                    <span
                      key={tag}
                      className="mono rounded-full border border-line bg-card2 px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted"
                    >
                      {tag}
                    </span>
                  );
                }
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-card border border-line bg-card2 p-4">
              <div className="mono mb-3 text-[10px] uppercase tracking-[0.12em] text-muted">
                What you ship
              </div>
              <div className="mono space-y-2 text-[12px] leading-[1.6]">
                <div>
                  <div className="text-muted">// sugar you write</div>
                  <div className="text-accent">{SUGAR}</div>
                </div>
                <div>
                  <div className="text-muted">// real engine runs</div>
                  <div className="whitespace-pre-line">{REAL}</div>
                </div>
              </div>
            </div>
            <div className="rounded-card bg-accent p-4 text-black">
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.12em] opacity-60">
                Rule #0
              </div>
              <div className="text-[14px] font-semibold leading-[1.35]">{CHECK_RULE}</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="eyebrow mb-4 flex items-center gap-2">
          <span className="rule" />
          How to use this site
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: "book",
              title: "Read the real form",
              body: LESSONS.length + " lessons. Each one shows the code, the sugar it replaces and a full solution.",
            },
            {
              icon: "code",
              title: "Check every line",
              body: "The playground flags forbidden syntax with line and column. It never blocks a run.",
            },
            {
              icon: "target",
              title: "Build without libraries",
              body: "Finish with an EventEmitter and a DOM helper written from primitives.",
            },
          ].map(function (card) {
            return (
              <div key={card.title} className="rounded-card border border-line bg-card p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-line bg-card2 text-accent">
                  <Icon name={card.icon} size={15} />
                </div>
                <div className="text-[13px] font-semibold">{card.title}</div>
                <p className="mt-1.5 text-[12px] leading-[1.6] text-muted">{card.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="eyebrow mb-2 flex items-center gap-2">
              <span className="rule" />
              Course map
            </div>
            <h2 className="text-[22px] font-bold tracking-[-0.02em]">{LESSONS.length} parts, one chain</h2>
          </div>
          <button
            type="button"
            onClick={function () {
              navigate("/lessons");
            }}
            className="btn h-9 px-3"
          >
            All lessons
            <Icon name="arrowRight" size={13} />
          </button>
        </div>

        <div className="overflow-hidden rounded-card border border-line">
          <div className="grid grid-cols-1 divide-y divide-line/70 bg-card sm:grid-cols-2 sm:divide-x">
            {LESSONS.map(function (lesson) {
              const complete = progress.isDone(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={function () {
                    navigate("/lesson/" + lesson.id);
                  }}
                  className="group flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-card2/60 sm:odd:border-l-0"
                >
                  <span
                    className={
                      "mono mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] " +
                      (complete
                        ? "border-good/30 bg-good/10 text-good"
                        : "border-line bg-card2 text-muted")
                    }
                  >
                    {complete ? <Icon name="check" size={12} /> : String(lesson.id).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-paper group-hover:text-white">
                      {lesson.title}
                    </span>
                    <span className="mono mt-0.5 block truncate text-[10px] text-muted">
                      {lesson.goal}
                    </span>
                  </span>
                  <Icon
                    name="chevronRight"
                    size={14}
                    className="mt-1 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="accent">{CHEATSHEET.length} mappings</Pill>
          <Pill>Playground checker</Pill>
          <Pill>Final project</Pill>
          <Pill>Solutions included</Pill>
        </div>
      </section>

      <section className="rounded-card border border-line bg-card p-5 lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.12em] text-muted">Keep going</div>
            <p className="mt-1 max-w-[50ch] text-[13px] leading-[1.6] text-muted">
              The playground checks your code against every rule in this course. Paste a snippet and
              see exactly which line still uses sugar.
            </p>
          </div>
          <button
            type="button"
            onClick={function () {
              navigate("/playground");
            }}
            className="btn btn-accent h-10 shrink-0 px-4"
          >
            <Icon name="terminal" size={14} />
            Open playground
          </button>
        </div>
      </section>
    </div>
  );
}
