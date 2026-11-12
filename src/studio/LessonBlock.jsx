import React from "react";
import { Check, Circle, TriangleAlert } from "lucide-react";

// A lesson container drawn behind its concept cards. Hue per lesson position.
export default function LessonBlock(props) {
  const { block, hue } = props;
  const tint = "hsla(" + hue + ", 70%, 55%, 0.05)";
  const border = "hsla(" + hue + ", 45%, 55%, 0.45)";
  const dot = "hsl(" + hue + ", 55%, 45%)";

  const counts = block.counts;
  const summary = (
    <span className="inline-flex items-center gap-1">
      <TriangleAlert size={10} className="text-rose-600" /> {counts.violation}
      <Circle size={8} fill="currentColor" stroke="none" className="text-[#d97706]" /> {counts.heavy}
      <Check size={10} className="text-emerald-600" /> {counts.ok}
      {counts.unmarked}·
    </span>
  );

  return (
    <section
      className="absolute rounded-[22px] border-2 border-dashed"
      style={{ left: block.x, top: block.y, width: block.w, height: block.h, borderColor: border, background: tint }}
      aria-label={"Lesson block " + block.title}
    >
      <div
        className="absolute -top-5 left-3 right-3 flex items-center gap-2 text-[12px]"
        style={{ pointerEvents: "none" }}
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dot }} />
        <span className="font-bold truncate" style={{ color: dot }}>
          L{block.lessonId} · {block.title}
        </span>
        <span className="ml-auto text-slate-400 whitespace-nowrap font-medium">
          {block.total} concepts · {summary}
        </span>
      </div>
      <button
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--paper)] border text-slate-500 hover:text-indigo-700 hover:border-indigo-300 whitespace-nowrap shadow-sm"
        style={{ borderColor: border }}
        onPointerDown={function (e) { e.stopPropagation(); }}
        onClick={function (e) { e.stopPropagation(); props.onToggleCollapse(); }}
      >
        {block.collapsed ? "expand lesson" : "collapse lesson"}
      </button>
    </section>
  );
}
