import { useEffect, useMemo, useRef, useState } from "react";
import { CHEATSHEET } from "../data/cheatsheet.js";
import { LESSONS } from "../data/lessons.js";
import { PROJECT_STEPS } from "../data/project.js";
import Icon from "./Icon.jsx";

const PAGES = [
  { type: "page", label: "Overview", title: "Course overview", sub: "Purpose, rule #0 and the course map", path: "/" },
  { type: "page", label: "Rules", title: "Allowed vs forbidden", sub: "The no-sugar ruleset", path: "/rules" },
  { type: "page", label: "Lessons", title: "All ten lessons", sub: "Read, check and mark complete", path: "/lessons" },
  { type: "page", label: "Cheatsheet", title: "Sugar → real", sub: "Every mapping with a reason", path: "/cheatsheet" },
  { type: "page", label: "Project", title: "Final project", sub: "EventEmitter and DOM helper", path: "/project" },
  { type: "page", label: "Playground", title: "Run real code", sub: "Editor, checker and isolated console", path: "/playground" },
];

function buildIndex() {
  const items = [];

  for (let i = 0; i < PAGES.length; i += 1) {
    const page = PAGES[i];
    items[items.length] = {
      id: "page-" + i,
      type: "page",
      badge: "Page",
      title: page.title,
      sub: page.sub,
      path: page.path,
      hay: (page.title + " " + page.sub + " " + page.label).toLowerCase(),
    };
  }

  for (let i = 0; i < LESSONS.length; i += 1) {
    const lesson = LESSONS[i];
    items[items.length] = {
      id: "lesson-" + lesson.id,
      type: "lesson",
      badge: "Lesson " + String(lesson.id).padStart(2, "0"),
      title: lesson.title,
      sub: lesson.goal,
      path: "/lesson/" + lesson.id,
      hay: (
        lesson.title +
        " " +
        lesson.goal +
        " " +
        lesson.longDesc +
        " " +
        lesson.exercise +
        " " +
        lesson.sugarReplaces
      ).toLowerCase(),
    };
  }

  for (let i = 0; i < CHEATSHEET.length; i += 1) {
    const row = CHEATSHEET[i];
    items[items.length] = {
      id: "map-" + i,
      type: "mapping",
      badge: "Mapping",
      title: row.sugar,
      sub: row.real,
      path: "/cheatsheet",
      hay: (row.sugar + " " + row.real + " " + row.why + " " + row.cat).toLowerCase(),
    };
  }

  for (let i = 0; i < PROJECT_STEPS.length; i += 1) {
    const step = PROJECT_STEPS[i];
    items[items.length] = {
      id: "project-" + step.id,
      type: "project",
      badge: "Project " + step.id,
      title: step.title,
      sub: step.goal,
      path: "/project",
      hay: (step.title + " " + step.goal + " " + step.note + " " + step.checkpoint).toLowerCase(),
    };
  }

  return items;
}

export default function SearchPalette({ open, onClose, onNavigate }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const index = useMemo(buildIndex, []);

  useEffect(
    function () {
      if (!open) return;
      setQuery("");
      setActive(0);
      const timer = window.setTimeout(function () {
        if (inputRef.current) inputRef.current.focus();
      }, 10);
      return function () {
        window.clearTimeout(timer);
      };
    },
    [open]
  );

  useEffect(
    function () {
      if (!open) return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return function () {
        document.body.style.overflow = previous;
      };
    },
    [open]
  );

  const results = useMemo(
    function () {
      const needle = query.toLowerCase().trim();
      if (!needle) {
        return index.filter(function (item) {
          return item.type === "page" || item.id === "lesson-1" || item.id === "lesson-2";
        });
      }
      const matches = [];
      for (let i = 0; i < index.length; i += 1) {
        if (index[i].hay.indexOf(needle) !== -1) matches[matches.length] = index[i];
        if (matches.length >= 40) break;
      }
      return matches;
    },
    [index, query]
  );

  useEffect(
    function () {
      if (active >= results.length) setActive(0);
    },
    [results.length, active]
  );

  if (!open) return null;

  function select(item) {
    onNavigate(item.path);
    onClose();
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(function (value) {
        return results.length === 0 ? 0 : (value + 1) % results.length;
      });
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(function (value) {
        return results.length === 0 ? 0 : (value - 1 + results.length) % results.length;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) select(results[active]);
    }
  }

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Search the course">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
      />
      <div className="relative mx-auto mt-[8vh] w-[min(660px,calc(100%-1.5rem))] overflow-hidden rounded-card border border-line bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Icon name="search" size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={function (event) {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search lessons, mappings, project steps..."
            aria-label="Search"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? "search-result-" + results[active].id : undefined}
            className="mono h-12 min-w-0 flex-1 bg-transparent text-[13px] text-paper placeholder:text-muted/60 focus:outline-none"
          />
          <kbd className="mono shrink-0 rounded border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted">
            Esc
          </kbd>
        </div>

        <div id="search-results" role="listbox" className="max-h-[58vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="mono text-[12px] text-muted">No matches for “{query}”.</p>
            </div>
          ) : (
            results.map(function (item, position) {
              const selected = position === active;
              return (
                <button
                  key={item.id}
                  id={"search-result-" + item.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={function () {
                    setActive(position);
                  }}
                  onClick={function () {
                    select(item);
                  }}
                  className={
                    "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors " +
                    (selected ? "bg-card2 text-paper" : "text-muted hover:bg-card2/60")
                  }
                >
                  <span className="mono mt-0.5 w-[70px] shrink-0 rounded border border-line bg-ink px-1.5 py-0.5 text-center text-[9px] uppercase tracking-wide text-muted">
                    {item.badge}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mono block truncate text-[11.5px] text-paper">{item.title}</span>
                    <span className="mono mt-0.5 block truncate text-[10px] text-muted">{item.sub}</span>
                  </span>
                  <Icon name="arrowRight" size={13} className="mt-1 shrink-0 text-muted" />
                </button>
              );
            })
          )}
        </div>

        <div className="mono flex items-center justify-between border-t border-line px-4 py-2 text-[10px] text-muted">
          <span>↑ ↓ navigate · Enter open · Esc close</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}
