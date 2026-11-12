import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Check, Columns3, Diamond, Download, TriangleAlert, Undo2, X } from "lucide-react";
import { LESSONS } from "../data/lessons.js";
import { computeVerdict, edgeErrors, findCycles, parseConceptId, quizTagErrors } from "./model.js";
import { rewriteConceptBlock, roundTrip, scanLessons, getConceptBlock } from "./serialize.js";
import Canvas from "./Canvas.jsx";
import Outline from "./Outline.jsx";
import Inspector from "./Inspector.jsx";
import ChecksPanel from "./ChecksPanel.jsx";

const NODE_W = 216;
const NODE_H = 118;
const AUTO_X_GAP = 330;
const AUTO_Y_GAP = 152;

function emptyGraph() {
  return {
    version: 1,
    nodes: {},
    overrides: {},
    edges: [],
    layout: { positions: {}, collapsedLessons: [] },
  };
}

function initialDoc() {
  const items = {};
  const origById = {};
  LESSONS.forEach(function (lesson) {
    lesson.concepts.forEach(function (concept, i) {
      const id = "L" + lesson.id + ":" + i;
      items[id] = {
        heading: concept.heading,
        text: concept.text,
        purpose: concept.purpose,
        code: concept.code,
        hasCheck: Boolean(concept.check),
        diagram: concept.diagram || null,
      };
      origById[id] = concept;
    });
  });
  const order = LESSONS.map(function (lesson) {
    return lesson.concepts.map(function (_, i) {
      return "L" + lesson.id + ":" + i;
    });
  });
  return { items: items, order: order, origById: origById, graph: emptyGraph() };
}

export default function Studio() {
  const [doc, setDoc] = useState(initialDoc);
  const [history, setHistory] = useState([]);
  const docRef = useRef(doc);
  useEffect(function () {
    docRef.current = doc;
  }, [doc]);

  const [selection, setSelection] = useState(null); // {type:'node'|'edge', id|index}
  const [mode, setMode] = useState("select"); // 'select' | 'connect'
  const [status, setStatus] = useState("Loading concept graph…");
  const [source, setSource] = useState(null); // raw lessons.js text (dev server only)
  const [gate, setGate] = useState({ state: "pending" }); // pending | ok | failed | off
  const [panel, setPanel] = useState("checks"); // 'checks' | 'inspector'
  const [graphFile, setGraphFile] = useState(null);

  // ---- undo -----------------------------------------------------------------
  const updateDoc = useCallback(function (fn, undoable) {
    const prev = docRef.current;
    const next = fn(prev);
    docRef.current = next;
    if (undoable !== false) setHistory(function (h) { return h.slice(-49).concat([prev]); });
    setDoc(next);
  }, []);

  const undo = useCallback(function () {
    setHistory(function (h) {
      if (!h.length) return h;
      docRef.current = h[h.length - 1];
      setDoc(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  // ---- initial loads (graph sidecar + raw source for the live gate) ---------
  useEffect(function () {
    fetch("/concept-graph.json")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (g) {
        if (g && g.version === 1) {
          updateDoc(function (d) { return { ...d, graph: { ...emptyGraph(), ...g, layout: { positions: {}, collapsedLessons: [], ...(g.layout || {}) } } }; }, false);
          setStatus("Loaded concept-graph.json — " + (g.edges || []).length + " edges, " + Object.keys(g.nodes || {}).length + " marked concepts.");
        } else {
          setStatus("No concept-graph.json found — starting from an empty graph.");
        }
      })
      .catch(function () { setStatus("concept-graph.json not readable in this build — dev server recommended."); });
    // Vite's ?raw import returns the file text as a string — works in dev and
    // is inlined in the portable build. A plain fetch would get a wrapped module.
    import("../data/lessons.js?raw")
      .then(function (mod) {
        const text = mod.default;
        if (!text) {
          setGate({ state: "off" });
          return;
        }
        setSource(text);
        const result = roundTrip(text);
        setGate(result.ok ? { state: "ok" } : { state: "failed", problems: result.problems });
      })
      .catch(function () { setGate({ state: "off" }); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- derived ---------------------------------------------------------------
  const scan = useMemo(function () { return source ? scanLessons(source) : null; }, [source]);

  const displayLessons = useMemo(
    function () {
      return LESSONS.map(function (lesson, li) {
        return {
          ...lesson,
          concepts: doc.order[li].map(function (id) {
            const item = doc.items[id];
            const orig = doc.origById[id];
            return { ...orig, heading: item.heading, text: item.text, purpose: item.purpose, code: item.code };
          }),
        };
      });
    },
    [doc.items, doc.order, doc.origById]
  );

  // Flat current order, keyed by the stable origin id.
  const flat = useMemo(
    function () {
      const out = [];
      doc.order.forEach(function (ids, li) {
        ids.forEach(function (id, ci) {
          out.push({
            id: id,
            lessonId: LESSONS[li].id,
            lessonPos: li,
            index: ci,
            order: out.length,
            heading: doc.items[id].heading,
          });
        });
      });
      return out;
    },
    [doc.order, doc.items]
  );

  const verdictOf = useCallback(
    function (id) {
      const entry = doc.graph.nodes[id];
      return computeVerdict(entry ? entry.newNames : [], doc.graph.overrides[id] || null);
    },
    [doc.graph]
  );

  const problems = useMemo(
    function () {
      const edgeProblems = edgeErrors(doc.graph.edges, flat);
      return {
        forward: edgeProblems.filter(function (p) { return p.kind === "forward-ref"; }),
        orphan: edgeProblems.filter(function (p) { return p.kind === "orphan-name"; }),
        broken: edgeProblems.filter(function (p) { return p.kind === "broken-edge"; }),
        cycles: findCycles(doc.graph.edges),
        quiz: quizTagErrors(displayLessons),
      };
    },
    [doc.graph.edges, flat, displayLessons]
  );

  const posOf = useCallback(
    function (id) {
      const stored = doc.graph.layout.positions[id];
      if (stored) return stored;
      let lessonPos = 0;
      let index = 0;
      for (let li = 0; li < doc.order.length; li += 1) {
        const ci = doc.order[li].indexOf(id);
        if (ci !== -1) {
          lessonPos = li;
          index = ci;
          break;
        }
      }
      return { x: 60 + lessonPos * AUTO_X_GAP, y: 70 + index * AUTO_Y_GAP };
    },
    [doc.order, doc.graph.layout.positions]
  );

  const nodes = useMemo(
    function () {
      return flat.map(function (entry) {
        const pos = posOf(entry.id);
        return {
          ...entry,
          x: pos.x,
          y: pos.y,
          w: NODE_W,
          h: NODE_H,
          verdict: verdictOf(entry.id),
          touched: problems.forward.some(function (p) { return p.user && p.user.id === entry.id; }) ||
            problems.orphan.some(function (p) { return p.user && p.user.id === entry.id; }),
        };
      });
    },
    [flat, posOf, verdictOf, problems]
  );

  const collapsedLessons = doc.graph.layout.collapsedLessons || [];

  const blocks = useMemo(
    function () {
      return LESSONS.map(function (lesson, li) {
        const members = nodes.filter(function (n) { return n.lessonPos === li; });
        const xs = members.map(function (n) { return n.x; });
        const ys = members.map(function (n) { return n.y; });
        const padX = 34;
        const headerH = 46;
        const padTop = headerH + 16;
        const padBottom = 30;
        return {
          lessonPos: li,
          lessonId: lesson.id,
          title: lesson.title,
          collapsed: collapsedLessons.indexOf(li) !== -1,
          x: Math.min.apply(null, xs) - padX,
          y: Math.min.apply(null, ys) - padTop,
          w: Math.max.apply(null, xs) + NODE_W + padX - (Math.min.apply(null, xs) - padX),
          h: Math.max.apply(null, ys) + NODE_H + padBottom - (Math.min.apply(null, ys) - padTop),
          headerH: headerH,
          counts: members.reduce(
            function (acc, n) {
              acc[n.verdict] += 1;
              return acc;
            },
            { unmarked: 0, ok: 0, consolidation: 0, heavy: 0, violation: 0 }
          ),
          total: members.length,
        };
      });
    },
    [nodes, collapsedLessons]
  );

  // ---- actions ---------------------------------------------------------------
  const updateField = useCallback(
    function (id, field, value) {
      updateDoc(function (d) {
        return { ...d, items: { ...d.items, [id]: { ...d.items[id], [field]: value } } };
      }, false);
    },
    [updateDoc]
  );

  const snapshot = useCallback(
    function () {
      updateDoc(function (d) { return d; }, true);
    },
    [updateDoc]
  );

  const setNewNames = useCallback(
    function (id, newNames) {
      updateDoc(function (d) {
        return { ...d, graph: { ...d.graph, nodes: { ...d.graph.nodes, [id]: { ...(d.graph.nodes[id] || {}), newNames: newNames } } } };
      });
    },
    [updateDoc]
  );

  const setOverride = useCallback(
    function (id, value) {
      updateDoc(function (d) {
        const overrides = { ...d.graph.overrides };
        if (value) overrides[id] = value;
        else delete overrides[id];
        return { ...d, graph: { ...d.graph, overrides: overrides } };
      });
    },
    [updateDoc]
  );

  const addEdge = useCallback(
    function (from, to) {
      if (from === to) {
        setStatus("A concept cannot use itself — pick a different teacher.");
        return;
      }
      updateDoc(function (d) {
        if (d.graph.edges.some(function (e) { return e.from === from && e.to === to; })) {
          setStatus("That edge already exists.");
          return d;
        }
        return { ...d, graph: { ...d.graph, edges: d.graph.edges.concat([{ from: from, to: to, names: [] }]) } };
      });
      setSelection({ type: "edge", index: -1 });
      setStatus("Edge created — select it to name what it uses.");
    },
    [updateDoc]
  );

  const updateEdge = useCallback(
    function (index, patch) {
      updateDoc(function (d) {
        const edges = d.graph.edges.map(function (e, i) { return i === index ? { ...e, ...patch } : e; });
        return { ...d, graph: { ...d.graph, edges: edges } };
      }, false);
    },
    [updateDoc]
  );

  const removeEdge = useCallback(
    function (index) {
      updateDoc(function (d) {
        return { ...d, graph: { ...d.graph, edges: d.graph.edges.filter(function (_, i) { return i !== index; }) } };
      });
      setSelection(null);
    },
    [updateDoc]
  );

  const setPosition = useCallback(
    function (id, x, y) {
      updateDoc(function (d) {
        return {
          ...d,
          graph: { ...d.graph, layout: { ...d.graph.layout, positions: { ...d.graph.layout.positions, [id]: { x: x, y: y } } } },
        };
      }, false);
    },
    [updateDoc]
  );

  const toggleLessonCollapse = useCallback(
    function (li) {
      updateDoc(function (d) {
        const list = (d.graph.layout.collapsedLessons || []).slice();
        const at = list.indexOf(li);
        if (at === -1) list.push(li);
        else list.splice(at, 1);
        return { ...d, graph: { ...d.graph, layout: { ...d.graph.layout, collapsedLessons: list } } };
      }, false);
    },
    [updateDoc]
  );

  const moveConcept = useCallback(
    function (id, toLessonPos, toIndex) {
      // Final-position semantics: after the move, the concept sits at
      // toIndex in lesson toLessonPos.
      updateDoc(function (d) {
        const order = d.order.map(function (ids) { return ids.slice(); });
        let fromLessonPos = -1;
        let fromIndex = -1;
        for (let li = 0; li < order.length; li += 1) {
          const ci = order[li].indexOf(id);
          if (ci !== -1) {
            fromLessonPos = li;
            fromIndex = ci;
            break;
          }
        }
        if (fromLessonPos === -1) return d;
        order[fromLessonPos].splice(fromIndex, 1);
        toIndex = Math.max(0, Math.min(toIndex, order[toLessonPos].length));
        order[toLessonPos].splice(toIndex, 0, id);
        return { ...d, order: order };
      });
    },
    [updateDoc]
  );

  const applyColumnLayout = useCallback(function () {
    updateDoc(function (d) {
      const positions = {};
      d.order.forEach(function (ids, li) {
        ids.forEach(function (id, ci) {
          positions[id] = { x: 60 + li * AUTO_X_GAP, y: 70 + ci * AUTO_Y_GAP };
        });
      });
      return { ...d, graph: { ...d.graph, layout: { ...d.graph.layout, positions: positions } } };
    });
    setStatus("Column layout applied — one lesson per column, teaching order top to bottom.");
  }, [updateDoc]);

  // ---- export ----------------------------------------------------------------
  const buildExport = useCallback(
    function () {
      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        baseline: {
          lessons: LESSONS.map(function (lesson) {
            return {
              id: lesson.id,
              concepts: lesson.concepts.map(function (c) {
                return {
                  heading: c.heading,
                  text: c.text,
                  purpose: c.purpose,
                  code: c.code,
                  check: c.check ?? null,
                  diagram: c.diagram ?? null,
                };
              }),
            };
          }),
        },
        edited: {
          lessons: doc.order.map(function (ids, li) {
            return {
              id: LESSONS[li].id,
              concepts: ids.map(function (id) {
                const item = doc.items[id];
                const origin = parseConceptId(id);
                return {
                  origin: { lesson: origin.lessonId, index: origin.index },
                  heading: item.heading,
                  text: item.text,
                  purpose: item.purpose,
                  code: item.code,
                };
              }),
            };
          }),
        },
        graph: doc.graph,
      };
    },
    [doc]
  );

  const download = useCallback(function (name, data, type) {
    const blob = new Blob([data], { type: type || "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportMergeFile = useCallback(function () {
    const payload = buildExport();
    download("concept-studio-export.json", JSON.stringify(payload, null, 2));
    const moved = payload.edited.lessons.reduce(function (acc, l) {
      return acc + l.concepts.filter(function (c) { return c.origin.lesson !== l.id; }).length;
    }, 0);
    setStatus(
      "Exported concept-studio-export.json (" + flat.length + " concepts, " + moved + " moved). Run: npm run studio:merge concept-studio-export.json"
    );
  }, [buildExport, download, flat.length]);

  const loadGraphBackup = useCallback(function (file) {
    file
      .text()
      .then(function (text) {
        const g = JSON.parse(text);
        if (!g || g.version !== 1) throw new Error("not a concept-graph.json backup");
        updateDoc(function (d) { return { ...d, graph: { ...emptyGraph(), ...g } }; });
        setStatus("Graph backup loaded.");
      })
      .catch(function (err) {
        setStatus("Backup failed to load: " + err.message);
      });
  }, [updateDoc]);

  // ---- serialized preview for the inspector ----------------------------------
  const previewBlock = useCallback(
    function (id) {
      const item = doc.items[id];
      if (!scan) {
        return (
          "{\n" +
          '  heading: "' + item.heading + '",\n' +
          '  text: ' + JSON.stringify(item.text).length + " chars,\n" +
          '  purpose: "' + item.purpose + '",\n' +
          "  code: `" + item.code.split("\n").length + " lines`,\n" +
          "  …check and diagram carry over verbatim…\n}"
        );
      }
      const origin = parseConceptId(id);
      const li = scan.lessons.findIndex(function (l) { return l.id === origin.lessonId; });
      if (li === -1 || !scan.lessons[li].concepts[origin.index]) return "(concept not found in source)";
      const block = getConceptBlock(source, scan, li, origin.index);
      return rewriteConceptBlock(
        block,
        { heading: item.heading, text: item.text, purpose: item.purpose, code: item.code },
        scan.eol
      );
    },
    [scan, source, doc.items]
  );

  // ---- keyboard ----------------------------------------------------------------
  useEffect(function () {
    function onKey(e) {
      const inField = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement;
      if (e.key === "Escape") {
        setSelection(null);
        setMode("select");
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selection && !inField) {
        e.preventDefault();
        if (selection.type === "edge") removeEdge(selection.index);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !inField) {
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener("keydown", onKey);
    return function () { window.removeEventListener("keydown", onKey); };
  }, [selection, removeEdge, undo]);

  useEffect(
    function () {
      if (selection && selection.type === "node") setPanel("inspector");
      if (selection && selection.type === "edge") setPanel("inspector");
    },
    [selection]
  );

  const selectedNode = selection && selection.type === "node" ? doc.items[selection.id] : null;
  const blocking = problems.quiz.length + problems.broken.length;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none" style={{ minWidth: 1080 }}>
      <header className="shrink-0 bg-cs-paper border-b border-cs-line px-4 py-2 flex flex-wrap items-center gap-2 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold font-display">CS</div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold leading-none tracking-tight">Concept Studio</h1>
            <p className="text-[11px] text-cs-muted mt-0.5">
              14 lessons · {flat.length} concepts · dev tool — edits go through the merge CLI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          <GateBadge gate={gate} />
          <ToolbarButton onClick={undo} disabled={!history.length} title="Ctrl+Z"><Undo2 size={13} /> Undo</ToolbarButton>
          <ToolbarButton onClick={applyColumnLayout} title="One lesson per column, order top to bottom"><Columns3 size={13} /> Columns</ToolbarButton>
          <ToolbarButton onClick={function () { setMode(mode === "connect" ? "select" : "connect"); }} active={mode === "connect"} title="Click a user, then its teacher">
            <ArrowLeftRight size={13} /> Connect{mode === "connect" ? <Check size={13} /> : ""}
          </ToolbarButton>
          <ToolbarButton onClick={exportMergeFile} primary title="Download the file for npm run studio:merge"><Download size={13} /> Export merge file</ToolbarButton>
          <ToolbarButton onClick={function () { download("concept-graph-backup.json", JSON.stringify(doc.graph, null, 2)); }} title="Graph metadata backup">Graph backup</ToolbarButton>
          <label className="h-8 px-3 rounded-lg border border-cs-chip-edge bg-cs-chip text-cs-chip-ink text-xs font-medium flex items-center gap-1.5 cursor-pointer hover:bg-cs-chip-soft">
            Load backup
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={function (e) { if (e.target.files[0]) loadGraphBackup(e.target.files[0]); e.target.value = ""; }}
            />
          </label>
        </div>
      </header>

      <div className="status-shrink shrink-0 bg-cs-paper border-b border-cs-line px-4 py-1.5 text-xs text-cs-muted flex items-center gap-3 flex-wrap">
        <span className={(blocking ? "text-rose-700 font-medium" : "text-emerald-700") + " flex items-center gap-1"}>
          {blocking === 0 ? <Check size={12} /> : <X size={12} />}
          {blocking === 0 ? "quiz tags resolve" : blocking + " blocking problem(s)"}
        </span>
        <span className="text-amber-700 flex items-center gap-1">
          <TriangleAlert size={12} /> {problems.forward.length} forward ref(s)
        </span>
        <span className="text-amber-700 flex items-center gap-1">
          <Diamond size={11} /> {problems.orphan.length} orphan name(s)
        </span>
        <span className="text-cs-faint">·</span>
        <span className="text-cs-muted flex-1 truncate">{status}</span>
      </div>

      <div className="flex-1 flex min-h-0">
        <Outline
          lessons={LESSONS}
          order={doc.order}
          items={doc.items}
          verdictOf={verdictOf}
          selection={selection}
          onSelect={function (id) { setSelection({ type: "node", id: id }); }}
          onMove={moveConcept}
        />
        <main className="flex-1 relative min-w-0">
          <Canvas
            nodes={nodes}
            blocks={blocks}
            edges={doc.graph.edges}
            selection={selection}
            mode={mode}
            onSelect={setSelection}
            onSelectLesson={function () {}}
            onNodeDrag={setPosition}
            onDropIntoLesson={moveConcept}
            onConnect={addEdge}
            onToggleCollapse={toggleLessonCollapse}
            onModeHandled={function () { setMode("select"); }}
          />
        </main>
        <aside className="w-[350px] shrink-0 bg-cs-paper border-l border-cs-line flex flex-col min-h-0">
          <div className="flex border-b border-cs-line shrink-0">
            <button
              className={"flex-1 py-2 text-xs font-semibold " + (panel === "inspector" ? "bg-cs-chip-strong text-cs-chip-strong-ink" : "text-cs-muted hover:bg-cs-chip-soft hover:text-cs-chip-muted")}
              onClick={function () { setPanel("inspector"); }}
            >
              Inspector
            </button>
            <button
              className={"flex-1 py-2 text-xs font-semibold " + (panel === "checks" ? "bg-cs-chip-strong text-cs-chip-strong-ink" : "text-cs-muted hover:bg-cs-chip-soft hover:text-cs-chip-muted")}
              onClick={function () { setPanel("checks"); }}
            >
              Discipline check
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {panel === "inspector" ? (
              selectedNode ? (
                <Inspector
                  id={selection.id}
                  item={selectedNode}
                  verdict={verdictOf(selection.id)}
                  newNames={(doc.graph.nodes[selection.id] && doc.graph.nodes[selection.id].newNames) || []}
                  override={doc.graph.overrides[selection.id] || null}
                  edges={doc.graph.edges}
                  nodes={nodes}
                  flat={flat}
                  preview={previewBlock(selection.id)}
                  canPreviewReal={Boolean(scan)}
                  onField={updateField}
                  onSnapshot={snapshot}
                  onNewNames={setNewNames}
                  onOverride={setOverride}
                  onSelect={setSelection}
                  onRemoveEdge={removeEdge}
                  onUpdateEdge={updateEdge}
                />
              ) : (
                <EmptyInspector />
              )
            ) : (
              <ChecksPanel
                lessons={LESSONS}
                order={doc.order}
                verdictOf={verdictOf}
                problems={problems}
                gate={gate}
                onWarnClick={function (id) { setSelection({ type: "node", id: id }); setPanel("inspector"); }}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function GateBadge(props) {
  const gate = props.gate;
  if (gate.state === "ok") {
    return (
      <span className="h-8 px-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
        <Check size={12} /> serializer gate
      </span>
    );
  }
  if (gate.state === "failed") {
    return (
      <span
        className="h-8 px-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5"
        title={gate.problems && gate.problems.map(function (p) { return p.reason; }).join("\n")}
      >
        <X size={12} /> serializer gate — merge blocked
      </span>
    );
  }
  if (gate.state === "off") {
    return (
      <span className="h-8 px-2.5 rounded-lg bg-cs-chip-soft text-cs-chip-muted border border-cs-chip-line text-xs font-semibold flex items-center">
        gate n/a (no source)
      </span>
    );
  }
  return (
    <span className="h-8 px-2.5 rounded-lg bg-cs-chip-soft text-cs-chip-faint border border-cs-chip-line text-xs font-semibold flex items-center">
      checking gate…
    </span>
  );
}

function ToolbarButton(props) {
  return (
    <button
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      className={
        "h-8 px-3 rounded-lg text-xs font-semibold border transition inline-flex items-center justify-center gap-1.5 " +
        (props.primary
          ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
          : props.active
            ? "bg-indigo-50 text-indigo-800 border-indigo-300"
            : "bg-cs-chip text-cs-chip-ink border-cs-chip-edge hover:bg-cs-chip-soft") +
        (props.disabled ? " opacity-40 cursor-default" : "")
      }
    >
      {props.children}
    </button>
  );
}

function EmptyInspector() {
  return (
    <div className="text-xs text-cs-muted leading-relaxed">
      <p className="font-semibold text-sm text-cs-ink mb-2">Nothing selected</p>
      <p className="mb-2">Click a concept card or an edge on the canvas, or a row in the outline.</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Drag a card's <b>+</b> handle onto its teacher to record a "uses" edge.</li>
        <li>Reorder in the <b>outline</b> (left) — that order is what gets written back.</li>
        <li>Watch forward refs flip as you rearrange.</li>
        <li><b>Export merge file</b>, then run <code className="font-code">npm run studio:merge concept-studio-export.json</code>.</li>
      </ul>
    </div>
  );
}
