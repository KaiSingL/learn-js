import React, { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight } from "lucide-react";

// The authoritative teaching order. Drag rows, use arrows, or move a concept
// to another lesson — this order is what the merge writes back to lessons.js.
export default function Outline(props) {
  const { lessons, order, items, verdictOf, selection } = props;
  const [dragging, setDragging] = useState(null); // {lessonPos, index}
  const [over, setOver] = useState(null); // {lessonPos, index}
  const [openLesson, setOpenLesson] = useState(null);

  function rowPointerDown(e, lessonPos, index) {
    e.stopPropagation();
    const id = order[lessonPos][index];
    props.onSelect(id);
  }

  function onDragStart(e, lessonPos, index) {
    setDragging({ lessonPos: lessonPos, index: index });
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", order[lessonPos][index]);
    } catch (err) {
      /* IE */
    }
  }

  function onDragOver(e, lessonPos, index) {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!over || over.lessonPos !== lessonPos || over.index !== index) setOver({ lessonPos: lessonPos, index: index });
  }

  function onDrop(e) {
    e.preventDefault();
    if (dragging && over) {
      const id = order[dragging.lessonPos][dragging.index];
      props.onMove(id, over.lessonPos, over.index);
    }
    setDragging(null);
    setOver(null);
  }

  function moveBy(lessonPos, index, delta) {
    const id = order[lessonPos][index];
    props.onMove(id, lessonPos, index + delta);
  }

  function moveToLesson(lessonPos, index, targetLessonPos) {
    const id = order[lessonPos][index];
    props.onMove(id, targetLessonPos, order[targetLessonPos].length);
  }

  const verdictDot = {
    unmarked: "bg-slate-400",
    ok: "bg-emerald-600",
    consolidation: "bg-sky-600",
    heavy: "bg-amber-600",
    violation: "bg-rose-600",
  };

  return (
    <aside
      className="w-[300px] shrink-0 bg-[var(--paper)] border-r border-[var(--line)] overflow-y-auto p-2"
      onDragOver={function (e) { if (dragging) e.preventDefault(); }}
      onDrop={onDrop}
      aria-label="Teaching order outline"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1.5 pb-1.5">
        Teaching order — this is what gets written back
      </p>
      {lessons.map(function (lesson, li) {
        const ids = order[li];
        const open = openLesson === null || openLesson === li;
        return (
          <div key={lesson.id} className="mb-1.5">
            <button
              className="w-full flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-700 text-left"
              onClick={function () { setOpenLesson(open ? -1 : li); }}
            >
              <span className="text-[10px] font-code font-bold text-slate-400 w-7 shrink-0">L{lesson.id}</span>
              <span className="text-xs font-semibold truncate flex-1">{lesson.title}</span>
              <span className="text-[10px] text-slate-400">{ids.length}</span>
              <span className="text-slate-400">{open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
            </button>
            {open &&
              ids.map(function (id, ci) {
                const item = items[id];
                const isSel = selection && selection.type === "node" && selection.id === id;
                const isOver = over && over.lessonPos === li && over.index === ci;
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={function (e) { onDragStart(e, li, ci); }}
                    onDragEnd={function () { setDragging(null); setOver(null); }}
                    onDragOver={function (e) { onDragOver(e, li, ci); }}
                    onPointerDown={function (e) { rowPointerDown(e, li, ci); }}
                    className={
                      "group flex items-center gap-1.5 pl-3 pr-1 py-1 rounded-md cursor-pointer text-[12px] " +
                      (isSel ? "bg-indigo-50 text-slate-700 ring-1 ring-indigo-300" : "hover:bg-slate-50 hover:text-slate-700") +
                      (isOver ? " border-t-2 border-indigo-500" : "")
                    }
                  >
                    <span className={"w-1.5 h-1.5 rounded-full shrink-0 " + verdictDot[verdictOf(id)]} />
                    <span className="text-[9px] font-code text-slate-400 w-6 shrink-0 text-right">{ci + 1}</span>
                    <span className="truncate flex-1" title={item.heading}>
                      {item.heading}
                    </span>
                    <span className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                      <MiniBtn title="Move up" disabled={ci === 0} onClick={function () { moveBy(li, ci, -1); }}><ArrowUp size={9} /></MiniBtn>
                      <MiniBtn
                        title="Move down"
                        disabled={ci === ids.length - 1}
                        onClick={function () { moveBy(li, ci, 1); }}
                      ><ArrowDown size={9} /></MiniBtn>
                      <select
                        className="text-[9px] border border-slate-200 rounded bg-white px-0.5 py-0 text-slate-500 w-11 h-4"
                        title="Move to lesson"
                        value=""
                        onPointerDown={function (e) { e.stopPropagation(); }}
                        onChange={function (e) {
                          if (e.target.value !== "") moveToLesson(li, ci, Number(e.target.value));
                        }}
                      >
                        <option value="">⇄</option>
                        {lessons.map(function (target, tl) {
                          return tl === li ? null : (
                            <option key={target.id} value={tl}>
                              L{target.id}
                            </option>
                          );
                        })}
                      </select>
                    </span>
                  </div>
                );
              })}
          </div>
        );
      })}
    </aside>
  );
}

function MiniBtn(props) {
  return (
    <button
      title={props.title}
      disabled={props.disabled}
      onPointerDown={function (e) { e.stopPropagation(); }}
      onClick={props.onClick}
      className={
        "w-4 h-4 grid place-items-center rounded border text-[9px] leading-none " +
        (props.disabled ? "opacity-30 border-slate-200 text-slate-300" : "border-slate-300 text-slate-600 hover:bg-slate-100")
      }
    >
      {props.children}
    </button>
  );
}
