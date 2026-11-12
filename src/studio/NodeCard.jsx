import React from "react";
import { Plus, TriangleAlert } from "lucide-react";

const VERDICT_LABELS = {
  unmarked: "unmarked",
  ok: "1 new",
  consolidation: "0 new",
  heavy: "heavy",
  violation: "2+ new",
};

export default function NodeCard(props) {
  const { node, selected, color, connectArmed } = props;
  return (
    <article
      className={
        "node-card bg-[var(--paper)] rounded-xl border text-left shadow-[0_6px_18px_rgba(15,23,42,0.09)] cursor-grab active:cursor-grabbing " +
        (selected ? "border-indigo-500 ring-2 ring-indigo-400" : "border-slate-200 hover:border-slate-300")
      }
      onPointerDown={props.onPointerDown}
      onPointerMove={props.onDragMove}
    >
      <div className="px-3 pt-2 pb-2 h-full flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: color }}>
            {VERDICT_LABELS[node.verdict]}
          </span>
          <span className="ml-auto text-[10px] text-slate-400 font-code">
            L{node.lessonId}·{node.index + 1}
          </span>
          {node.touched && (
            <span className="text-rose-600 font-bold text-[11px] flex items-center" title="Uses a name before it is taught (or never taught)">
              <TriangleAlert size={11} />
            </span>
          )}
        </div>
        <h3 className="mt-1 font-semibold text-[13px] leading-snug line-clamp-2">{node.heading}</h3>
        <p className="mt-auto text-[11px] text-[color:var(--muted)] truncate">{node.purpose}</p>
      </div>
      <button
        aria-label={"Connect from " + node.heading}
        onPointerDown={props.onConnectHandleDown}
        className={
          "absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-white grid place-items-center shadow transition z-10 " +
          (connectArmed ? "bg-rose-500 scale-110" : "bg-indigo-600 hover:bg-indigo-700 hover:scale-110")
        }
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </article>
  );
}
