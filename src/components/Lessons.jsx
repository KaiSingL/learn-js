import { useEffect, useState } from "react";
import { LESSONS } from "../data/lessons.js";
import { countDone } from "../lib/progress.js";
import LessonCard from "./LessonCard.jsx";
import { PageHeader, ProgressBar } from "./PageHeader.jsx";

export default function Lessons({ route, progress, onPlayground, onNavigate }) {
  const [open, setOpen] = useState(function () {
    if (route.path === "/lesson" && route.param) return Number(route.param);
    return null;
  });

  useEffect(
    function () {
      if (route.path === "/lesson" && route.param) {
        const id = Number(route.param);
        setOpen(id);
        const timer = window.setTimeout(function () {
          const node = document.getElementById("lesson-" + id);
          if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
        return function () {
          window.clearTimeout(timer);
        };
      }
      if (route.path === "/lessons") {
        setOpen(null);
      }
      return undefined;
    },
    [route.path, route.param]
  );

  const ids = LESSONS.map(function (lesson) {
    return lesson.id;
  });
  const done = countDone(progress.completed, ids);

  function toggle(lesson) {
    if (open === lesson.id) {
      setOpen(null);
      onNavigate("/lessons");
      return;
    }
    setOpen(lesson.id);
    onNavigate("/lesson/" + lesson.id);
  }

  return (
    <div>
      <PageHeader
        eyebrow={"Section 02 — " + LESSONS.length + " lessons"}
        title="Learn the real form"
        subtitle="Every lesson has the code, the sugar it replaces, a checklist, a knowledge check and at least one runnable solution."
        aside={
          <div className="w-full rounded-panel border border-line bg-card p-3 lg:w-[230px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted">Completed</span>
              <span className="mono text-[10px]">
                {done} / {LESSONS.length}
              </span>
            </div>
            <ProgressBar value={done} total={LESSONS.length} label="Lessons completed" />
            <div className="mono mt-2 text-[10px] text-muted/70">
              {done === LESSONS.length ? "All lessons complete" : "Click a card to expand"}
            </div>
          </div>
        }
      />

      <div className="space-y-3">
        {LESSONS.map(function (lesson, index) {
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              expanded={open === lesson.id}
              onToggle={function () {
                toggle(lesson);
              }}
              progress={progress}
              onPlayground={onPlayground}
              onNavigate={onNavigate}
              isFirst={index === 0}
              isLast={index === LESSONS.length - 1}
            />
          );
        })}
      </div>

      <div className="mt-6 rounded-panel border border-dashed border-line bg-card2 px-4 py-3">
        <p className="mono text-[11px] leading-[1.6] text-muted">
          Every code sample on this page is run through the linter by the test suite. If a lesson ever
          grows a forbidden shortcut, the build fails before it ships.
        </p>
      </div>
    </div>
  );
}
