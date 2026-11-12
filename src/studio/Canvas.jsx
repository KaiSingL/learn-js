import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Diamond, Minus, Plus } from "lucide-react";
import NodeCard from "./NodeCard.jsx";
import LessonBlock from "./LessonBlock.jsx";

// Arrow anchor: point on `rect`'s boundary toward the other rect's center.
function anchorPoint(rect, toward) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const dx = (toward.x + toward.w / 2) - cx;
  const dy = (toward.y + toward.h / 2) - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scale = Math.min(rect.w / 2 / Math.abs(dx || 1e-6), rect.h / 2 / Math.abs(dy || 1e-6));
  return { x: cx + dx * scale * 0.96, y: cy + dy * scale * 0.96 };
}

function edgeGeometry(fromRect, toRect) {
  const start = anchorPoint(fromRect, toRect);
  const end = anchorPoint(toRect, fromRect);
  const mx = (start.x + end.x) / 2;
  const my = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  const bow = Math.min(40, len * 0.16);
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return {
    start: start,
    end: end,
    cx: cx,
    cy: cy,
    labelX: 0.25 * start.x + 0.5 * cx + 0.25 * end.x,
    labelY: 0.25 * start.y + 0.5 * cy + 0.25 * end.y,
    path: "M " + start.x + " " + start.y + " Q " + cx + " " + cy + " " + end.x + " " + end.y,
  };
}

const VERDICT_COLORS = {
  unmarked: "#94a3b8",
  ok: "#059669",
  consolidation: "#0284c7",
  heavy: "#d97706",
  violation: "#e11d48",
};

const LESSON_HUES = [225, 172, 26, 340, 262, 195, 145, 12, 310, 205, 150, 285, 45, 330];

export default function Canvas(props) {
  const { nodes, blocks, edges, selection, mode } = props;
  const hostRef = useRef(null);
  const [view, setView] = useState({ x: 30, y: 20, scale: 0.85 });
  const dragRef = useRef(null); // {kind:'pan'|'node'|'connect', ...}
  const [tempEdge, setTempEdge] = useState(null);
  const [spaceHeld, setSpaceHeld] = useState(false);

  const byId = useMemo(
    function () {
      const map = {};
      nodes.forEach(function (n) { map[n.id] = n; });
      return map;
    },
    [nodes]
  );

  const fit = useCallback(
    function () {
      const host = hostRef.current;
      if (!host || !nodes.length) return;
      const rect = host.getBoundingClientRect();
      const minX = Math.min.apply(null, nodes.map(function (n) { return n.x; })) - 130;
      const maxX = Math.max.apply(null, nodes.map(function (n) { return n.x + n.w; })) + 130;
      const minY = Math.min.apply(null, nodes.map(function (n) { return n.y; })) - 110;
      const maxY = Math.max.apply(null, nodes.map(function (n) { return n.y + n.h; })) + 90;
      const scale = Math.max(0.3, Math.min(1.4, Math.min((rect.width - 40) / (maxX - minX), (rect.height - 40) / (maxY - minY))));
      setView({ scale: scale, x: (rect.width - (maxX + minX) * scale) / 2, y: (rect.height - (maxY + minY) * scale) / 2 });
    },
    [nodes]
  );

  useEffect(function () {
    const t = setTimeout(fit, 120);
    return function () { clearTimeout(t); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const zoomAt = useCallback(function (factor, cx, cy) {
    setView(function (v) {
      const scale = Math.max(0.2, Math.min(1.8, v.scale * factor));
      const k = scale / v.scale;
      return { scale: scale, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });
  }, []);

  useEffect(function () {
    function down(e) { if (e.code === "Space") setSpaceHeld(true); }
    function up(e) { if (e.code === "Space") setSpaceHeld(false); }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return function () {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const toWorld = useCallback(
    function (clientX, clientY) {
      const rect = hostRef.current.getBoundingClientRect();
      return { x: (clientX - rect.left - view.x) / view.scale, y: (clientY - rect.top - view.y) / view.scale };
    },
    [view]
  );

  // ---- background interactions ------------------------------------------------
  function onBackgroundPointerDown(e) {
    if (e.button !== 0) return;
    props.onSelect(null);
    if (mode === "connect") props.onModeHandled();
    dragRef.current = { kind: "pan", startX: e.clientX, startY: e.clientY, origX: view.x, origY: view.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === "pan") {
      setView(function (v) { return { ...v, x: drag.origX + (e.clientX - drag.startX), y: drag.origY + (e.clientY - drag.startY) }; });
    } else if (drag.kind === "node") {
      const dx = (e.clientX - drag.startX) / view.scale;
      const dy = (e.clientY - drag.startY) / view.scale;
      props.onNodeDrag(drag.id, drag.origX + dx, drag.origY + dy);
    } else if (drag.kind === "connect") {
      const w = toWorld(e.clientX, e.clientY);
      setTempEdge({ from: drag.id, x: w.x, y: w.y });
    }
  }

  function onPointerUp(e) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.kind === "node" && drag.moved) {
      const w = toWorld(e.clientX, e.clientY);
      // membership: dropped inside another lesson block?
      const target = blocks.find(function (b) {
        return w.x >= b.x && w.x <= b.x + b.w && w.y >= b.y && w.y <= b.y + b.h;
      });
      const node = byId[drag.id];
      if (target && target.lessonPos !== node.lessonPos) {
        const members = nodes
          .filter(function (n) { return n.lessonPos === target.lessonPos; })
          .sort(function (a, b) { return a.y - b.y; });
        let insertAt = members.length;
        for (let i = 0; i < members.length; i += 1) {
          if (w.y < members[i].y) {
            insertAt = i;
            break;
          }
        }
        props.onDropIntoLesson(drag.id, target.lessonPos, insertAt);
      }
    }
    if (drag.kind === "connect") {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const host = el && el.closest("[data-node]");
      if (host) props.onConnect(drag.id, host.dataset.node);
      setTempEdge(null);
    }
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = hostRef.current.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - rect.left, e.clientY - rect.top);
  }

  // ---- node interactions ---------------------------------------------------
  function onNodePointerDown(e, node) {
    e.stopPropagation();
    if (mode === "connect") {
      props.onSelect({ type: "node", id: node.id });
      props.onConnect(connectSourceRef.current || node.id, node.id);
      connectSourceRef.current = null;
      props.onModeHandled();
      return;
    }
    props.onSelect({ type: "node", id: node.id });
    dragRef.current = { kind: "node", id: node.id, startX: e.clientX, startY: e.clientY, origX: node.x, origY: node.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  const connectSourceRef = useRef(null);

  function onConnectHandlePointerDown(e, node) {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { kind: "connect", id: node.id, startX: e.clientX, startY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setTempEdge({ from: node.id, x: node.x + node.w, y: node.y + node.h / 2 });
  }

  // Click-click connect mode.
  function handleNodeClickConnect(node) {
    if (!connectSourceRef.current) {
      connectSourceRef.current = node.id;
    } else if (connectSourceRef.current !== node.id) {
      props.onConnect(connectSourceRef.current, node.id);
      connectSourceRef.current = null;
      props.onModeHandled();
    }
  }

  // ---- render ----------------------------------------------------------------
  const renderedEdges = edges
    .map(function (edge, index) {
      const from = byId[edge.from];
      if (!from) return null;
      if (edge.to === null || edge.to === undefined) return { orphan: true, edge: edge, index: index, from: from };
      const to = byId[edge.to];
      if (!to) return null;
      const geom = edgeGeometry(from, to);
      const forward = to.order > from.order;
      const selected = selection && selection.type === "edge" && selection.index === index;
      return { orphan: false, edge: edge, index: index, from: from, to: to, geom: geom, forward: forward, selected: selected };
    })
    .filter(Boolean);

  return (
    <div
      ref={hostRef}
      className="canvas-grid absolute inset-0 overflow-hidden touch-none"
      style={{ cursor: dragRef.current && dragRef.kind === "pan" ? "grabbing" : spaceHeld ? "grab" : mode === "connect" ? "crosshair" : "default" }}
      onPointerDown={onBackgroundPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      role="application"
      aria-label="Concept map canvas"
    >
      <div
        className="absolute left-0 top-0 w-full h-full"
        style={{ transform: "translate(" + view.x + "px, " + view.y + "px) scale(" + view.scale + ")", transformOrigin: "0 0" }}
      >
        {/* lesson blocks (behind nodes) */}
        {blocks.map(function (block) {
          return (
            <LessonBlock
              key={block.lessonPos}
              block={block}
              hue={LESSON_HUES[block.lessonPos % LESSON_HUES.length]}
              onToggleCollapse={function () { props.onToggleCollapse(block.lessonPos); }}
            />
          );
        })}

        {/* edges */}
        <svg className="absolute left-0 top-0 w-full h-full overflow-visible pointer-events-none">
          <defs>
            <marker id="cs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7d8aa5" />
            </marker>
            <marker id="cs-arrow-sel" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
            </marker>
            <marker id="cs-arrow-warn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
            </marker>
          </defs>
          {tempEdge && byId[tempEdge.from] && (
            <line
              x1={byId[tempEdge.from].x + byId[tempEdge.from].w}
              y1={byId[tempEdge.from].y + byId[tempEdge.from].h / 2}
              x2={tempEdge.x}
              y2={tempEdge.y}
              stroke="#4f46e5"
              strokeWidth="2"
              strokeDasharray="6 5"
              markerEnd="url(#cs-arrow-sel)"
            />
          )}
          {renderedEdges.map(function (item) {
            if (item.orphan) return null;
            const stroke = item.forward ? "#e11d48" : item.selected ? "#4f46e5" : "#7d8aa5";
            const marker = item.forward ? "url(#cs-arrow-warn)" : item.selected ? "url(#cs-arrow-sel)" : "url(#cs-arrow)";
            const label = (item.edge.names || []).join(", ");
            const labelW = Math.max(30, label.length * 7 + 18);
            return (
              <g key={"e" + item.index} className="pointer-events-auto cursor-pointer" onPointerDown={function (e) { e.stopPropagation(); props.onSelect({ type: "edge", index: item.index }); }}>
                <path d={item.geom.path} stroke="transparent" strokeWidth="16" fill="none" />
                <path
                  d={item.geom.path}
                  stroke={stroke}
                  strokeWidth={item.selected ? 2.5 : 1.6}
                  strokeDasharray={item.forward ? "7 4" : undefined}
                  fill="none"
                  markerEnd={marker}
                />
                {label && (
                  <g transform={"translate(" + (item.geom.labelX - labelW / 2) + "," + (item.geom.labelY - 11) + ")"}>
                    <rect width={labelW} height="22" rx="11" fill="var(--paper)" stroke={item.forward ? "#fda4af" : "#cbd5e1"} />
                    <text x={labelW / 2} y="15" textAnchor="middle" fontSize="11" fontWeight="600" fill={item.forward ? "#be123c" : "#334155"}>
                      {label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* nodes */}
        {nodes
          .filter(function (n) {
            const block = blocks[n.lessonPos];
            return !block || !block.collapsed;
          })
          .map(function (node) {
            const selected = selection && selection.type === "node" && selection.id === node.id;
            return (
              <div key={node.id} data-node={node.id} className="absolute" style={{ left: node.x, top: node.y }}>
                <NodeCard
                  node={node}
                  selected={selected}
                  connectArmed={mode === "connect"}
                  color={VERDICT_COLORS[node.verdict]}
                  onPointerDown={function (e) {
                    if (mode === "connect") {
                      e.stopPropagation();
                      handleNodeClickConnect(node);
                      return;
                    }
                    onNodePointerDown(e, node);
                  }}
                  onDragMove={function (e) {
                    const drag = dragRef.current;
                    if (drag && drag.kind === "node") {
                      drag.moved = true;
                      onPointerMove(e);
                    }
                  }}
                  onConnectHandleDown={function (e) { onConnectHandlePointerDown(e, node); }}
                />
              </div>
            );
          })}

        {/* orphan name chips (edges with no teacher) */}
        {renderedEdges
          .filter(function (item) { return item.orphan; })
          .map(function (item) {
            const names = (item.edge.names || []).join(", ");
            return (
              <div
                key={"o" + item.index}
                className="absolute -translate-x-1/2 pointer-events-auto cursor-pointer"
                style={{ left: item.from.x + item.from.w / 2, top: item.from.y - 26 }}
                onPointerDown={function (e) { e.stopPropagation(); props.onSelect({ type: "edge", index: item.index }); }}
              >
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
                  <Diamond size={10} /> never taught: {names}
                </span>
              </div>
            );
          })}
      </div>

      {/* zoom controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10" onPointerDown={function (e) { e.stopPropagation(); }}>
        <button className="w-9 h-9 bg-cs-chip border border-cs-chip-line rounded-lg shadow grid place-items-center text-cs-chip-ink" onClick={function () { zoomAt(1.25, 200, 200); }} aria-label="Zoom in"><Plus size={16} /></button>
        <button className="w-9 h-9 bg-cs-chip border border-cs-chip-line rounded-lg shadow grid place-items-center text-cs-chip-ink" onClick={function () { zoomAt(0.8, 200, 200); }} aria-label="Zoom out"><Minus size={16} /></button>
        <button className="h-9 px-2 bg-cs-chip border border-cs-chip-line rounded-lg shadow text-xs font-semibold text-cs-chip-ink" onClick={fit}>Fit</button>
      </div>
      <div className="absolute left-3 bottom-3 bg-cs-chip border border-cs-chip-line rounded-xl shadow px-3 py-2 text-[11px] text-cs-chip-muted z-10 hidden xl:block">
        <p className="font-bold uppercase tracking-wider text-cs-chip-faint mb-1">Verdicts</p>
        <div className="grid grid-cols-[auto_auto] gap-x-2 gap-y-0.5">
          <span><Dot color={VERDICT_COLORS.ok} /> 1 new idea</span>
          <span><Dot color={VERDICT_COLORS.consolidation} /> consolidation</span>
          <span><Dot color={VERDICT_COLORS.heavy} /> 1 idea, heavy names</span>
          <span><Dot color={VERDICT_COLORS.violation} /> 2+ new ideas</span>
        </div>
        <p className="mt-1.5 text-cs-chip-faint">dashed red arrow = used before taught · <Diamond size={9} className="inline-block align-[-1px]" /> = never taught</p>
      </div>
    </div>
  );
}

function Dot(props) {
  return <span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: props.color }} />;
}
