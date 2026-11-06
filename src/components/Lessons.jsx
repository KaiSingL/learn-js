import { useEffect, useState } from "react";
import { LESSONS } from "../data/lessons.js";
import { countDone } from "../lib/progress.js";
import { canRestore, readReadingStorage, writeReadingStorage } from "../lib/readingPosition.js";
import LessonCard from "./LessonCard.jsx";
import { PageHeader, ProgressBar } from "./PageHeader.jsx";

// Scrolls to an anchor once it exists in the DOM. Concepts render with the
// expansion, but give the commit a few frames via retries just in case.
function scrollToAnchor(anchorId, instant, attempt) {
  const tries = attempt || 0;
  const node = document.getElementById(anchorId);
  if (node) {
    node.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
    return;
  }
  if (tries < 14) {
    window.setTimeout(function () {
      scrollToAnchor(anchorId, instant, tries + 1);
    }, 100);
  }
}

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
        const routePath = "/lesson/" + id;
        const timer = window.setTimeout(function () {
          // A real page load restores the stored reading spot; in-app
          // navigation (router.navigate already marked the session) falls
          // back to the top of the lesson card.
          const stored = canRestore() ? readReadingStorage(window.localStorage) : null;
          const anchorId =
            stored && stored.path === routePath && stored.anchorId
              ? stored.anchorId
              : "lesson-" + id;
          scrollToAnchor(anchorId, anchorId !== "lesson-" + id);
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

  // While reading, remember the topmost visible section so a reload can
  // restore it. Saves only when the anchor changes, throttled via rAF.
  useEffect(
    function () {
      if (!open) return undefined;
      let frame = 0;
      let lastAnchor = null;
      function onScroll() {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = 0;
          const nodes = document.querySelectorAll("[data-reading-anchor]");
          let current = null;
          for (let i = 0; i < nodes.length; i += 1) {
            if (nodes[i].getBoundingClientRect().top <= 96) current = nodes[i].id;
          }
          if (current && current !== lastAnchor) {
            lastAnchor = current;
            writeReadingStorage(window.localStorage, {
              path: "/lesson/" + open,
              anchorId: current,
            });
          }
        });
      }
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return function () {
        if (frame) window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", onScroll);
      };
    },
    [open]
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
        subtitle="Every lesson has the code, the sugar it replaces, a checklist, a knowledge check and at least one runnable solution. Cards marked tier 1 · hidden default cover allowed-but-explicit features — each carries a gotcha you must know."
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
