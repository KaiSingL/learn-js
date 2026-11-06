import { LESSONS } from "../data/lessons.js";
import { PRIMARY_NAV, TAIL_NAV } from "../data/nav.js";
import { countDone } from "../lib/progress.js";
import { navigate } from "../lib/router.js";
import Icon from "./Icon.jsx";
import { ProgressBar } from "./PageHeader.jsx";

function NavItem({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2.5 text-left transition-colors " +
        (active
          ? "border-line bg-card text-paper"
          : "border-transparent text-muted hover:border-line/60 hover:bg-card/60 hover:text-paper")
      }
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="mono text-[10px] opacity-60">{item.num}</span>
        <span className="truncate text-[13px] font-medium tracking-wide">{item.label}</span>
      </span>
      {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> : null}
    </button>
  );
}

export default function Sidebar({ route, progress, onOpenPalette, onResetAll }) {
  const lessonIds = LESSONS.map(function (lesson) {
    return lesson.id;
  });
  const done = countDone(progress.completed, lessonIds);
  const activeLesson = route.path === "/lesson" ? Number(route.param) : null;

  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-dvh w-[280px] flex-col border-r border-line bg-ink lg:flex">
      <a
        href="#/"
        className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-6"
        aria-label="Learn JS home"
      >
        <img src="./icon.png" alt="" className="h-[28px] w-[28px] rounded-[6px]" />
        <span>
          <span className="block text-[14px] font-bold leading-none tracking-[0.14em]">LEARN.JS</span>
          <span className="mono mt-[3px] block text-[10px] tracking-[0.16em] text-muted">
            NO SUGAR · NO SHORTHAND
          </span>
        </span>
      </a>

      <div className="px-3 pt-4">
        <button
          type="button"
          onClick={onOpenPalette}
          className="flex h-9 w-full items-center justify-between rounded-lg border border-line bg-card2 px-3 text-[11px] text-muted transition-colors hover:text-paper"
          aria-label="Search the course"
        >
          <span className="flex items-center gap-2">
            <Icon name="search" size={13} />
            Search course
          </span>
          <kbd className="mono rounded border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
            Ctrl K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Course">
        <div className="space-y-1">
          {PRIMARY_NAV.map(function (item) {
            return (
              <NavItem
                key={item.path}
                item={item}
                active={route.path === item.path}
                onClick={function () {
                  navigate(item.path);
                }}
              />
            );
          })}
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between px-3">
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted">Lessons</span>
            <span className="mono text-[10px] text-muted/70">{LESSONS.length}</span>
          </div>
          <div className="space-y-1">
            {LESSONS.map(function (lesson) {
              const active = activeLesson === lesson.id;
              const complete = progress.isDone(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={function () {
                    navigate("/lesson/" + lesson.id);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={
                    "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors " +
                    (active
                      ? "border-line bg-card text-white"
                      : "border-transparent text-muted hover:border-line/50 hover:bg-card/50 hover:text-paper")
                  }
                >
                  <span className="mono w-5 shrink-0 text-[11px]">{String(lesson.id).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] leading-[1.3]">{lesson.title}</span>
                  {complete ? (
                    <Icon name="check" size={12} className="shrink-0 text-good" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-1">
          {TAIL_NAV.map(function (item) {
            return (
              <NavItem
                key={item.path}
                item={item}
                active={route.path === item.path}
                onClick={function () {
                  navigate(item.path);
                }}
              />
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-line bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">Progress</span>
            <span className="mono text-[10px] text-paper">
              {done} / {LESSONS.length}
            </span>
          </div>
          <ProgressBar value={done} total={LESSONS.length} label="Lessons completed" />
          <div className="mt-2 flex items-center justify-between">
            <span className="mono text-[10px] text-muted/70">
              {done === LESSONS.length ? "Course complete" : "Mark lessons as you go"}
            </span>
            {done > 0 ? (
              <button
                type="button"
                onClick={onResetAll}
                className="mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-danger"
                title="Reset all progress and quiz answers"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-line bg-card p-3">
          <div className="mono mb-2 text-[10px] uppercase tracking-[0.12em] text-muted">Engine rules</div>
          <div className="mono space-y-1.5 text-[11px] leading-[1.4]">
            <div className="flex justify-between gap-2">
              <span className="text-muted">Mode</span>
              <span className="text-accent">strict + var</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted">This</span>
              <span>call / apply / bind</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted">Inherit</span>
              <span>prototype</span>
            </div>
          </div>
          <p className="mono mt-3 text-[10px] leading-[1.5] text-muted/60">
            Built for engineers who want to see what JavaScript actually executes. No transpilation
            illusions.
          </p>
        </div>
      </nav>
    </aside>
  );
}
