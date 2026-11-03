import { useEffect } from "react";
import { LESSONS } from "../data/lessons.js";
import { PRIMARY_NAV, TAIL_NAV } from "../data/nav.js";
import { countDone } from "../lib/progress.js";
import { navigate } from "../lib/router.js";
import Icon from "./Icon.jsx";
import { ProgressBar } from "./PageHeader.jsx";

export default function MobileNav({ open, onOpen, onClose, route, progress, onOpenPalette }) {
  useEffect(
    function () {
      if (!open) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      function onKey(event) {
        if (event.key === "Escape") onClose();
      }
      window.addEventListener("keydown", onKey);
      return function () {
        document.body.style.overflow = previous;
        window.removeEventListener("keydown", onKey);
      };
    },
    [open, onClose]
  );

  const lessonIds = LESSONS.map(function (lesson) {
    return lesson.id;
  });
  const done = countDone(progress.completed, lessonIds);

  function go(path) {
    onClose();
    navigate(path);
  }

  return (
    <>
      <header
        className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-ink px-4 lg:hidden"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <a href="#/" className="flex items-center gap-2.5" aria-label="Learn JS home">
          <img src="./icon.png" alt="" className="h-[26px] w-[26px] rounded-[6px]" />
          <span className="text-[13px] font-bold tracking-[0.14em]">LEARN.JS</span>
          <span className="mono rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">v2</span>
        </a>
        <button
          type="button"
          onClick={onOpen}
          aria-label="Open menu"
          aria-expanded={open}
          className="btn h-9 w-9 border-line bg-card"
        >
          <span className="space-y-1">
            <span className="block h-0.5 w-4 bg-paper" />
            <span className="block h-0.5 w-4 bg-paper" />
            <span className="block h-0.5 w-4 bg-paper" />
          </span>
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Course navigation">
          <button
            type="button"
            className="no-press anim-fade-in absolute inset-0 bg-ink/90 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={onClose}
          />
          <div
            className="anim-slide-in-left relative flex h-full flex-col overflow-y-auto border-r border-line bg-ink pb-[calc(2.5rem_+_env(safe-area-inset-bottom,0px))]"
            style={{ paddingTop: "var(--safe-top)" }}
          >
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <span className="text-[13px] font-bold tracking-[0.14em]">LEARN.JS</span>
              <button type="button" onClick={onClose} className="btn h-9 w-9" aria-label="Close menu">
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="px-4 pt-4">
              <button
                type="button"
                onClick={function () {
                  onClose();
                  onOpenPalette();
                }}
                className="flex h-10 w-full items-center gap-2 rounded-lg border border-line bg-card2 px-3 text-[12px] text-muted"
              >
                <Icon name="search" size={14} />
                Search the course
              </button>
            </div>

            <nav className="px-4 py-4" aria-label="Course">
              <div className="grid grid-cols-2 gap-2">
                {PRIMARY_NAV.map(function (item) {
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={function () {
                        go(item.path);
                      }}
                      className={
                        "mono h-11 rounded-lg border text-[11px] uppercase tracking-wide " +
                        (route.path === item.path
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-line bg-card text-muted")
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mb-2 mt-5 flex items-center justify-between">
                <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted">Lessons</span>
                <span className="mono text-[10px] text-muted/70">{LESSONS.length}</span>
              </div>
              <div className="space-y-1.5">
                {LESSONS.map(function (lesson) {
                  const active = route.path === "/lesson" && Number(route.param) === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={function () {
                        go("/lesson/" + lesson.id);
                      }}
                      className={
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left " +
                        (active ? "border-accent/40 bg-accent/10" : "border-line bg-card")
                      }
                    >
                      <span className="mono w-6 text-[11px] text-accent">
                        {String(lesson.id).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px]">{lesson.title}</span>
                      {progress.isDone(lesson.id) ? (
                        <Icon name="check" size={13} className="text-good" />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {TAIL_NAV.map(function (item) {
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={function () {
                        go(item.path);
                      }}
                      className={
                        "mono h-11 rounded-lg border text-[11px] uppercase tracking-wide " +
                        (route.path === item.path
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-line bg-card text-muted")
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-lg border border-line bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">Progress</span>
                  <span className="mono text-[10px]">
                    {done} / {LESSONS.length}
                  </span>
                </div>
                <ProgressBar value={done} total={LESSONS.length} label="Lessons completed" />
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
