import React, { useState } from "react";
import { Check, Diamond, X } from "lucide-react";
import { VERDICTS } from "./model.js";

// Edit a concept: the four text fields, its new-name list, verdict override,
// its edges, and the exact serialized block the merge will produce.
export default function Inspector(props) {
  const { id, item, verdict, newNames, override, edges, nodes, flat } = props;
  const [tab, setTab] = useState("fields"); // fields | names | edges | preview

  const node = nodes.find(function (n) { return n.id === id; }) || flat.find(function (f) { return f.id === id; });
  const nameById = {};
  nodes.forEach(function (n) {
    nameById[n.id] = "L" + n.lessonId + "·" + (n.index + 1) + " " + n.heading;
  });

  const outEdges = edges
    .map(function (e, i) { return { ...e, index: i }; })
    .filter(function (e) { return e.from === id; });
  const inEdges = edges
    .map(function (e, i) { return { ...e, index: i }; })
    .filter(function (e) { return e.to === id; });

  const verdictInfo = VERDICTS[verdict];
  const coreCount = newNames.filter(function (n) { return !n.glossed; }).length;
  const glossedCount = newNames.length - coreCount;

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            {id} {node ? "· lesson " + node.lessonId + " · position " + (node.index + 1) : ""}
          </p>
          <h2 className="font-display text-lg font-bold leading-tight mt-0.5 truncate" title={item.heading}>
            {item.heading}
          </h2>
        </div>
      </div>

      <div className="mt-2 rounded-xl border p-2.5" style={{ borderColor: verdictInfo.color + "55", background: verdictInfo.color + "0d" }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: verdictInfo.color }} />
          <span className="font-semibold text-[13px]" style={{ color: verdictInfo.color }}>
            {verdictInfo.label}
          </span>
          {override && <span className="text-[10px] text-slate-400">(override)</span>}
        </div>
        <p className="text-[11px] text-[color:var(--muted)] mt-1 leading-snug">{verdictInfo.hint}</p>
        <div className="mt-2 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-[color:var(--muted)]">{coreCount} core · {glossedCount} glossed</span>
          <select
            className="ml-auto text-[11px] text-slate-700 border border-slate-200 rounded-md px-1.5 py-1 bg-white"
            value={override || ""}
            onChange={function (e) { props.onOverride(id, e.target.value || null); }}
          >
            <option value="">verdict: auto</option>
            <option value="ok">force: 1 new idea</option>
            <option value="consolidation">force: consolidation</option>
            <option value="heavy">force: heavy</option>
            <option value="violation">force: violation</option>
            <option value="unmarked">force: unmarked</option>
          </select>
        </div>
      </div>

      <div className="flex gap-1 mt-3 text-[11px] font-semibold">
        {["fields", "names", "edges", "preview"].map(function (t) {
          return (
            <button
              key={t}
              onClick={function () { setTab(t); }}
              className={
                "px-2.5 py-1 rounded-lg border " +
                (tab === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
              }
            >
              {t === "fields" ? "Text" : t === "names" ? "New names (" + newNames.length + ")" : t === "edges" ? "Edges (" + (outEdges.length + inEdges.length) + ")" : "Serialized"}
            </button>
          );
        })}
      </div>

      {tab === "fields" && (
        <div className="mt-3 space-y-3">
          <Field label="Heading" hint="Renaming patches quiz tests: tags automatically on merge.">
            <input
              className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-[13px] font-medium"
              value={item.heading}
              onFocus={props.onSnapshot}
              onChange={function (e) { props.onField(id, "heading", e.target.value); }}
            />
          </Field>
          <Field label="Text (1–3 sentences)">
            <textarea
              rows={5}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-[12px] leading-relaxed"
              value={item.text}
              onFocus={props.onSnapshot}
              onChange={function (e) { props.onField(id, "text", e.target.value); }}
            />
          </Field>
          <Field label="Purpose line">
            <input
              className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-[12px]"
              value={item.purpose}
              onFocus={props.onSnapshot}
              onChange={function (e) { props.onField(id, "purpose", e.target.value); }}
            />
          </Field>
          <Field label="Code" hint={item.code.split("\n").length + " lines · check & diagram carry over verbatim"}>
            <textarea
              rows={9}
              spellCheck={false}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-[11px] font-code leading-relaxed"
              value={item.code}
              onFocus={props.onSnapshot}
              onChange={function (e) { props.onField(id, "code", e.target.value); }}
            />
          </Field>
          <div className="flex gap-3 text-[11px] text-slate-400">
            {item.hasCheck && <span className="flex items-center gap-1"><Check size={10} /> has inline check</span>}
            {item.diagram && <span className="flex items-center gap-1"><Check size={10} /> diagram: {item.diagram}</span>}
          </div>
        </div>
      )}

      {tab === "names" && (
        <div className="mt-3">
          <p className="text-[11px] text-[color:var(--muted)] leading-snug mb-2">
            Mark every name this section introduces. <b>Core</b> = a genuinely new idea it teaches.{" "}
            <b>Glossed</b> = rides along with a one-line explanation and gets its real treatment later.
          </p>
          <NameEditor names={newNames} onChange={function (names) { props.onNewNames(id, names); }} />
        </div>
      )}

      {tab === "edges" && (
        <div className="mt-3 space-y-3 text-[12px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Uses (this concept is the student)</p>
            {outEdges.length === 0 && <p className="text-slate-400 text-[11px]">None — drag the + handle to a teacher.</p>}
            {outEdges.map(function (e) {
              return (
                <EdgeRow
                  key={e.index}
                  edge={e}
                  label={e.to === null ? "never taught" : nameById[e.to] || e.to}
                  orphan={e.to === null}
                  onSelect={function () { props.onSelect({ type: "edge", index: e.index }); }}
                  onRemove={function () { props.onRemoveEdge(e.index); }}
                  onUpdate={function (names) { props.onUpdateEdge(e.index, { names: names }); }}
                />
              );
            })}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Teaches (earlier concepts lean on this one)</p>
            {inEdges.length === 0 && <p className="text-slate-400 text-[11px]">None yet.</p>}
            {inEdges.map(function (e) {
              return (
                <EdgeRow
                  key={e.index}
                  edge={e}
                  label={(nameById[e.from] || e.from) + " → this"}
                  onSelect={function () { props.onSelect({ type: "edge", index: e.index }); }}
                  onRemove={function () { props.onRemoveEdge(e.index); }}
                  onUpdate={function (names) { props.onUpdateEdge(e.index, { names: names }); }}
                />
              );
            })}
          </div>
        </div>
      )}

      {tab === "preview" && (
        <div className="mt-3">
          <p className="text-[11px] text-[color:var(--muted)] mb-1.5">
            {props.canPreviewReal
              ? "Exactly what the merge writes for this concept (check & diagram verbatim):"
              : "Field summary (raw source not available in this build):"}
          </p>
          <pre className="text-[10px] text-slate-700 font-code leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-2.5 overflow-x-auto whitespace-pre">{props.preview}</pre>
        </div>
      )}
    </div>
  );
}

function Field(props) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-[color:var(--muted)] mb-1">
        {props.label}
        {props.hint && <span className="ml-1.5 font-medium normal-case tracking-normal text-slate-400">{props.hint}</span>}
      </span>
      {props.children}
    </label>
  );
}

function NameEditor(props) {
  const [draft, setDraft] = useState("");
  const [glossedDraft, setGlossedDraft] = useState(false);

  function add() {
    const name = draft.trim();
    if (!name) return;
    props.onChange(props.names.concat([{ name: name, glossed: glossedDraft }]));
    setDraft("");
  }

  return (
    <div>
      {props.names.map(function (entry, i) {
        return (
          <div key={i} className="flex items-center gap-1.5 mb-1.5">
            <button
              className={
                "px-2 py-1 rounded-full text-[10px] font-bold border " +
                (entry.glossed
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200")
              }
              title="Toggle core / glossed"
              onClick={function () {
                const next = props.names.slice();
                next[i] = { name: entry.name, glossed: !entry.glossed };
                props.onChange(next);
              }}
            >
              {entry.glossed ? "glossed" : "core"}
            </button>
            <input
              className="flex-1 min-w-0 border border-slate-200 rounded-md px-2 py-1 text-[12px]"
              value={entry.name}
              onChange={function (e) {
                const next = props.names.slice();
                next[i] = { ...entry, name: e.target.value };
                props.onChange(next);
              }}
            />
            <button
              className="w-6 h-6 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Remove name"
              onClick={function () {
                props.onChange(props.names.filter(function (_, j) { return j !== i; }));
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
      <div className="flex items-center gap-1.5 mt-2">
        <input
          className="flex-1 min-w-0 border border-slate-300 rounded-md px-2 py-1.5 text-[12px]"
          placeholder="e.g. call, prototype, recursion…"
          value={draft}
          onChange={function (e) { setDraft(e.target.value); }}
          onKeyDown={function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <label className="flex items-center gap-1 text-[11px] text-[color:var(--muted)] whitespace-nowrap">
          <input type="checkbox" checked={glossedDraft} onChange={function (e) { setGlossedDraft(e.target.checked); }} />
          glossed
        </label>
        <button className="px-2.5 py-1.5 rounded-md bg-indigo-600 text-white text-[11px] font-semibold" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}

function EdgeRow(props) {
  const edge = props.edge;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState((edge.names || []).join(", "));

  return (
    <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2 py-1.5 mb-1.5 bg-white">
      <button className="flex-1 min-w-0 text-left truncate text-[12px] text-slate-700 hover:text-indigo-700" onClick={props.onSelect} title="Select this edge">
        {props.orphan && <Diamond size={10} className="inline-block align-[-1px] mr-1" />}
        {props.label}
        <span className="block text-[10px] text-slate-400 truncate">
          {editing ? "" : (edge.names || []).join(", ") || "no names yet"}
        </span>
      </button>
      {editing ? (
        <>
          <input
            autoFocus
            className="flex-1 min-w-0 border border-slate-300 rounded px-1.5 py-1 text-[11px] text-slate-700"
            value={draft}
            onChange={function (e) { setDraft(e.target.value); }}
            onKeyDown={function (e) {
              if (e.key === "Enter") {
                props.onUpdate(
                  draft.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
                );
                setEditing(false);
              }
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <button
            className="text-[10px] font-bold text-indigo-700"
            onClick={function () {
              props.onUpdate(draft.split(",").map(function (s) { return s.trim(); }).filter(Boolean));
              setEditing(false);
            }}
          >
            save
          </button>
        </>
      ) : (
        <>
          <button className="text-[10px] font-bold text-indigo-700" onClick={function () { setDraft((edge.names || []).join(", ")); setEditing(true); }}>
            names
          </button>
          <button className="w-5 h-5 rounded text-slate-400 hover:text-rose-600 grid place-items-center" title="Delete edge" onClick={props.onRemove}>
            <X size={11} />
          </button>
        </>
      )}
    </div>
  );
}
