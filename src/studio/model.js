// Pure model for the Concept Studio: identity, verdicts, order checks.
// No React, no DOM, no Node APIs — shared by the studio page, the CLI and tests.
//
// Identity scheme: a concept's id is "L{lessonId}:{index}" where index is the
// concept's position in its lesson AT LOAD TIME (its "origin"). Moving and
// reordering never changes an origin id inside a session; scripts/studio.mjs
// remaps ids to the new positions when the merge is written.

export function conceptId(lessonId, index) {
  return "L" + lessonId + ":" + index;
}

export function parseConceptId(id) {
  var m = /^L(\d+):(\d+)$/.exec(id);
  if (!m) throw new Error("Bad concept id: " + id);
  return { lessonId: Number(m[1]), index: Number(m[2]) };
}

// A flat, ordered model: every concept carries its origin id, its current
// lesson and its current index (which may differ from the origin after moves).
export function flatten(lessons) {
  var out = [];
  for (var li = 0; li < lessons.length; li += 1) {
    var lesson = lessons[li];
    for (var ci = 0; ci < lesson.concepts.length; ci += 1) {
      var concept = lesson.concepts[ci];
      out.push({
        id: conceptId(lesson.id, ci),
        lessonId: lesson.id,
        index: ci,
        order: out.length,
        heading: concept.heading,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Verdicts
//
// newNames: array of { name, glossed } — a "core" name is a genuinely new
// idea the section teaches; a "glossed" name rides along with a one-line
// explanation and gets its real treatment later (or nowhere).

export var VERDICTS = {
  unmarked: { key: "unmarked", label: "Unmarked", color: "#64748b", hint: "No new-name list recorded yet." },
  ok: { key: "ok", label: "1 new idea", color: "#059669", hint: "Exactly one core new name — the clean shape." },
  consolidation: { key: "consolidation", label: "0 new — consolidation", color: "#0284c7", hint: "Pure combination of earlier concepts, by design." },
  heavy: { key: "heavy", label: "1 idea, heavy names", color: "#d97706", hint: "One core idea with glossed names riding along." },
  violation: { key: "violation", label: "2+ new ideas", color: "#e11d48", hint: "Multiple core new names in one section — split it." },
};

export function computeVerdict(newNames, override) {
  if (override && VERDICTS[override] && override !== "unmarked") return override;
  if (override === "unmarked") return "unmarked";
  var list = newNames || [];
  var core = 0;
  var glossed = 0;
  for (var i = 0; i < list.length; i += 1) {
    if (list[i].glossed) glossed += 1;
    else core += 1;
  }
  if (list.length === 0) return "unmarked";
  if (core === 0) return "consolidation";
  if (core === 1 && glossed === 0) return "ok";
  if (core === 1) return "heavy";
  return "violation";
}

// ---------------------------------------------------------------------------
// Edges and order checks
//
// An edge { from, to, names } says: concept `from` USES the names that
// concept `to` teaches. `to: null` marks a name that no concept teaches.
// A forward reference is an edge whose teacher comes AFTER its user in the
// current global order — a name used before its lesson.

export function edgeErrors(edges, flat) {
  var byId = {};
  for (var i = 0; i < flat.length; i += 1) byId[flat[i].id] = flat[i];
  var problems = [];
  var seen = {};
  for (var e = 0; e < (edges || []).length; e += 1) {
    var edge = edges[e];
    var sig =
      edge.from +
      "->" +
      (edge.to === null || edge.to === undefined ? "null:" + (edge.names || []).join(",") : edge.to);
    if (seen[sig]) continue;
    seen[sig] = true;
    var user = byId[edge.from];
    if (!user) {
      problems.push({ kind: "broken-edge", edge: edge, reason: "Edge starts at unknown concept " + edge.from });
      continue;
    }
    if (edge.to === null || edge.to === undefined) {
      problems.push({
        kind: "orphan-name",
        edge: edge,
        user: user,
        reason:
          (edge.names || []).join(", ") + " used here but no concept teaches it — give it a homeland or fold it into this section's own list.",
      });
      continue;
    }
    var teacher = byId[edge.to];
    if (!teacher) {
      problems.push({ kind: "broken-edge", edge: edge, reason: "Edge points at unknown concept " + edge.to });
      continue;
    }
    if (teacher.order > user.order) {
      problems.push({
        kind: "forward-ref",
        edge: edge,
        user: user,
        teacher: teacher,
        reason:
          user.heading + " uses " + (edge.names || []).join(", ") + " before " + teacher.heading + " teaches it.",
      });
    }
  }
  return problems;
}

export function findCycles(edges) {
  var adj = {};
  var nodes = {};
  for (var i = 0; i < (edges || []).length; i += 1) {
    var e = edges[i];
    if (!e.to) continue;
    (adj[e.from] = adj[e.from] || []).push(e.to);
    nodes[e.from] = true;
    nodes[e.to] = true;
  }
  var state = {}; // 1 = visiting, 2 = done
  var stack = [];
  var cycles = [];
  function visit(id) {
    if (state[id] === 2) return false;
    if (state[id] === 1) {
      var at = stack.indexOf(id);
      cycles.push(stack.slice(at).concat([id]));
      return true;
    }
    state[id] = 1;
    stack.push(id);
    var next = adj[id] || [];
    for (var k = 0; k < next.length; k += 1) visit(next[k]);
    stack.pop();
    state[id] = 2;
    return false;
  }
  for (var id in nodes) visit(id);
  return cycles;
}

// ---------------------------------------------------------------------------
// Quiz tags — mirrors tests/content.test.js exactly: a quiz item's `tests`
// must name a concept heading taught in the same or an earlier lesson.
// `lessons` is the CURRENT (possibly rearranged) lesson array.

export function quizTagErrors(lessons) {
  var taught = {};
  var errors = [];
  for (var li = 0; li < lessons.length; li += 1) {
    var lesson = lessons[li];
    if (!lesson.concepts) continue;
    for (var c = 0; c < lesson.concepts.length; c += 1) {
      taught[lesson.concepts[c].heading] = true;
    }
    for (var q = 0; q < (lesson.quiz || []).length; q += 1) {
      var tag = lesson.quiz[q].tests;
      if (typeof tag !== "string" || !taught[tag]) {
        errors.push({
          lessonId: lesson.id,
          quizIndex: q,
          tag: tag,
          reason:
            "Lesson " + lesson.id + " quiz " + (q + 1) + " tests \"" + tag + "\" — not taught in this or an earlier lesson.",
        });
      }
    }
  }
  return errors;
}
