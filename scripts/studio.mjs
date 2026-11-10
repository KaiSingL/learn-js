#!/usr/bin/env node
// Concept Studio CLI — merge an exported edit back into src/data/lessons.js.
//
//   node scripts/studio.mjs merge concept-studio-export.json [--dry-run]
//   node scripts/studio.mjs validate
//
// Guards, in order (see plan/concept-studio/plan.md):
//   1. baseline — lessons.js must be unchanged since the export
//   2. round-trip — the serializer must reproduce every concept block byte-for-byte
//   3. quiz tags — every tests: tag must resolve in the same-or-earlier lesson
//   4. verify — the rebuilt file is imported from disk and compared to the
//      intended result before it replaces anything.

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { rebuildSource, getConceptBlock, replaceQuizTests, rewriteConceptBlock, roundTrip } from "../src/studio/serialize.js";
import { computeVerdict, edgeErrors, findCycles, quizTagErrors } from "../src/studio/model.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const LESSONS_PATH = join(ROOT, "src", "data", "lessons.js");
const GRAPH_PATH = join(ROOT, "concept-graph.json");
const VERIFY_PATH = join(ROOT, "src", "data", ".lessons.studio-verify.js");

async function importLessons(path) {
  // Cache-buster so repeated merges in one process see fresh bytes.
  const mod = await import(pathToFileURL(path).href + "?t=" + Date.now() + Math.random());
  return mod.LESSONS;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = canonical(value[key]);
    return out;
  }
  return value === undefined ? null : value;
}

function baselineOf(lessons) {
  return lessons.map((lesson) => ({
    id: lesson.id,
    concepts: lesson.concepts.map((c) => ({
      heading: c.heading,
      text: c.text,
      purpose: c.purpose,
      code: c.code,
      check: c.check ?? null,
      diagram: c.diagram ?? null,
    })),
  }));
}

function fail(message) {
  console.error("\n✗ MERGE ABORTED — " + message);
  process.exit(1);
}

function readExport(path) {
  const abs = resolve(process.cwd(), path);
  if (!existsSync(abs)) fail("export file not found: " + abs);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(abs, "utf8"));
  } catch (err) {
    fail("export file is not valid JSON: " + err.message);
  }
  if (parsed.version !== 1) fail("unsupported export version " + parsed.version);
  if (!parsed.baseline || !parsed.edited || !parsed.graph) fail("export is missing baseline/edited/graph");
  return parsed;
}

// ---------------------------------------------------------------------------

async function cmdMerge(exportPath, dryRun) {
  const exportFile = readExport(exportPath);

  // -- 1. baseline ----------------------------------------------------------
  const currentLessons = await importLessons(LESSONS_PATH);
  if (JSON.stringify(canonical(baselineOf(currentLessons))) !== JSON.stringify(canonical(exportFile.baseline.lessons))) {
    fail(
      "lessons.js changed since the export (or the export came from another file).\n" +
        "  Re-open the studio and export again — never merge a stale export."
    );
  }

  // -- 2. round-trip gate ---------------------------------------------------
  const source = readFileSync(LESSONS_PATH, "utf8");
  const gate = roundTrip(source);
  if (!gate.ok) {
    fail(
      "serializer round-trip gate failed:\n  " +
        gate.problems.map((p) => p.reason).join("\n  ") +
        "\n  lessons.js style drifted from what the serializer can reproduce; fix serialize.js first."
    );
  }
  const scan = gate.scan;
  const scanLessonIdxById = new Map(scan.lessons.map((l, i) => [l.id, i]));

  // -- build the intended result in memory ----------------------------------
  const resultLessons = currentLessons.map((lesson) => ({ ...lesson, concepts: lesson.concepts.slice() }));
  const byOrigin = new Map(); // "lessonId:index" -> concept object (identity)
  for (const lesson of currentLessons) {
    for (let i = 0; i < lesson.concepts.length; i += 1) {
      byOrigin.set(lesson.id + ":" + i, lesson.concepts[i]);
    }
  }

  const renames = []; // { from, to }
  const moves = [];   // { heading, fromLesson, toLesson }
  const fieldEdits = { heading: 0, text: 0, purpose: 0, code: 0 };
  const idRemap = new Map(); // origin id -> new id

  const editedLessons = exportFile.edited.lessons;
  if (editedLessons.length !== resultLessons.length) {
    fail("export has " + editedLessons.length + " lessons, lessons.js has " + resultLessons.length);
  }
  for (let li = 0; li < editedLessons.length; li += 1) {
    const editedLesson = editedLessons[li];
    if (editedLesson.id !== resultLessons[li].id) {
      fail("lesson order changed in export (" + editedLesson.id + " vs " + resultLessons[li].id + ") — v1 cannot reorder lessons");
    }
    const nextConcepts = [];
    for (let ci = 0; ci < editedLesson.concepts.length; ci += 1) {
      const def = editedLesson.concepts[ci];
      const originKey = def.origin.lesson + ":" + def.origin.index;
      const originConcept = byOrigin.get(originKey);
      if (!originConcept) fail("export references unknown concept origin " + originKey);
      const concept = {
        ...originConcept,
        heading: def.heading,
        text: def.text,
        purpose: def.purpose,
        code: def.code,
      };
      if (def.origin.lesson !== editedLesson.id) {
        moves.push({ heading: def.heading, fromLesson: def.origin.lesson, toLesson: editedLesson.id });
      }
      if (originConcept.heading !== def.heading) {
        renames.push({ from: originConcept.heading, to: def.heading });
        fieldEdits.heading += 1;
      }
      if (originConcept.text !== def.text) fieldEdits.text += 1;
      if (originConcept.purpose !== def.purpose) fieldEdits.purpose += 1;
      if (originConcept.code !== def.code) fieldEdits.code += 1;
      idRemap.set("L" + def.origin.lesson + ":" + def.origin.index, "L" + editedLesson.id + ":" + ci);
      nextConcepts.push(concept);
    }
    if (nextConcepts.length === 0) fail("lesson " + editedLesson.id + " would end up with zero concepts");
    resultLessons[li].concepts = nextConcepts;
  }

  // Apply heading renames to quiz tags in memory, then check the gate.
  for (const lesson of resultLessons) {
    for (const item of lesson.quiz || []) {
      const hit = renames.find((r) => r.from === item.tests);
      if (hit) item.tests = hit.to;
    }
  }
  const quizErrors = quizTagErrors(resultLessons);
  if (quizErrors.length > 0) {
    fail(
      "quiz-tag gate failed — fix these first (move the quiz item, move the concept back, or rename):\n  " +
        quizErrors.map((e) => e.reason).join("\n  ")
    );
  }

  // -- rebuild the file -----------------------------------------------------
  let newSource = source;
  if (renames.length > 0) {
    const patched = replaceQuizTests(newSource, renames);
    newSource = patched.source;
    console.log("quiz tags rewritten for " + renames.length + " renamed heading(s): " + patched.replaced + " tag(s)");
  }

  const perLessonBlocks = scan.lessons.map((_, li) => null);
  const editedLessonsById = new Map(editedLessons.map((l) => [l.id, l]));
  for (const [lessonId, editedLesson] of editedLessonsById) {
    const li = scanLessonIdxById.get(lessonId);
    perLessonBlocks[li] = editedLesson.concepts.map((def) => {
      const originLi = scanLessonIdxById.get(def.origin.lesson);
      const block = getConceptBlock(source, scan, originLi, def.origin.index);
      return rewriteConceptBlock(
        block,
        { heading: def.heading, text: def.text, purpose: def.purpose, code: def.code },
        scan.eol
      );
    });
  }
  newSource = rebuildSource(newSource, perLessonBlocks);

  // -- 4. verify by importing the rebuilt text ------------------------------
  writeFileSync(VERIFY_PATH, newSource);
  let verifiedLessons;
  try {
    verifiedLessons = await importLessons(VERIFY_PATH);
  } catch (err) {
    unlinkSync(VERIFY_PATH);
    fail("rebuilt file does not even import: " + err.message);
  }
  const expected = canonical(resultLessons);
  const actual = canonical(verifiedLessons);
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    // Surface the first divergence for debugging.
    const a = JSON.stringify(expected);
    const b = JSON.stringify(actual);
    let d = 0;
    while (a[d] === b[d]) d += 1;
    unlinkSync(VERIFY_PATH);
    fail(
      "verification failed — the rebuilt file does not match the intended result.\n" +
        "  first divergence at JSON char " +
        d +
        ":\n  expected …" +
        a.slice(Math.max(0, d - 60), d + 60) +
        "…\n  actual   …" +
        b.slice(Math.max(0, d - 60), d + 60) +
        "…"
    );
  }
  unlinkSync(VERIFY_PATH);

  // -- sidecar graph with remapped ids --------------------------------------
  const graph = exportFile.graph;
  const remapId = (id) => (id === null || id === undefined ? null : idRemap.get(id) ?? null);
  const nodes = {};
  const dropped = [];
  for (const [originId, entry] of Object.entries(graph.nodes || {})) {
    const newId = remapId(originId);
    if (!newId) {
      dropped.push(originId);
      continue;
    }
    nodes[newId] = { newNames: entry.newNames || [] };
  }
  const overrides = {};
  for (const [originId, value] of Object.entries(graph.overrides || {})) {
    const newId = remapId(originId);
    if (newId) overrides[newId] = value;
  }
  const positions = {};
  for (const [originId, pos] of Object.entries((graph.layout && graph.layout.positions) || {})) {
    const newId = remapId(originId);
    if (newId) positions[newId] = pos;
  }
  const edges = (graph.edges || [])
    .map((e) => ({ from: remapId(e.from), to: remapId(e.to), names: e.names || [] }))
    .filter((e) => e.from !== null);
  const sidecar = {
    version: 1,
    updatedAt: new Date().toISOString(),
    nodes,
    overrides,
    edges,
    layout: { positions, collapsedLessons: (graph.layout && graph.layout.collapsedLessons) || [] },
  };

  // -- report + write --------------------------------------------------------
  const verdictTotals = { unmarked: 0, ok: 0, consolidation: 0, heavy: 0, violation: 0 };
  const flatOrder = [];
  for (const lesson of resultLessons) {
    for (let i = 0; i < lesson.concepts.length; i += 1) flatOrder.push("L" + lesson.id + ":" + i);
  }
  for (const id of flatOrder) {
    const entry = nodes[id];
    verdictTotals[computeVerdict(entry ? entry.newNames : [], overrides[id] || null)] += 1;
  }

  console.log("");
  console.log("merge plan verified" + (dryRun ? " (dry run — nothing written)" : ""));
  console.log("  lessons: " + resultLessons.length + ", concepts: " + flatOrder.length);
  console.log("  moved across lessons: " + (moves.length ? moves.map((m) => "L" + m.fromLesson + "→L" + m.toLesson + " " + m.heading).join(" | ") : "none"));
  console.log("  field edits: heading " + fieldEdits.heading + ", text " + fieldEdits.text + ", purpose " + fieldEdits.purpose + ", code " + fieldEdits.code);
  console.log("  verdicts: " + verdictTotals.ok + " ok · " + verdictTotals.consolidation + " consolidation · " + verdictTotals.heavy + " heavy · " + verdictTotals.violation + " violation · " + verdictTotals.unmarked + " unmarked");
  const fwd = edgeErrors(edges, flatOrder.map((id, order) => ({ id, order })));
  const orphans = fwd.filter((p) => p.kind === "orphan-name");
  const forwards = fwd.filter((p) => p.kind === "forward-ref");
  console.log("  graph: " + edges.length + " edges — " + forwards.length + " forward ref(s), " + orphans.length + " orphan name(s), " + findCycles(edges).length + " cycle(s)");
  if (dropped.length) console.log("  dropped stale graph entries: " + dropped.join(", "));

  if (!dryRun) {
    writeFileSync(LESSONS_PATH, newSource);
    writeFileSync(GRAPH_PATH, JSON.stringify(sidecar, null, 2) + "\n");
    console.log("");
    console.log("✓ wrote " + relativeDisplay(LESSONS_PATH) + " (" + newSource.length + " bytes)");
    console.log("✓ wrote " + relativeDisplay(GRAPH_PATH));
    console.log("  refresh the studio page to continue from the new state; run `bun test` to confirm.");
  }
}

function relativeDisplay(path) {
  return path.replace(ROOT + "\\", "").replace(ROOT + "/", "");
}

// ---------------------------------------------------------------------------

async function cmdValidate() {
  const lessons = await importLessons(LESSONS_PATH);
  const source = readFileSync(LESSONS_PATH, "utf8");

  const gate = roundTrip(source);
  if (!gate.ok) {
    console.error("✗ round-trip gate FAILED:");
    for (const p of gate.problems) console.error("  " + p.reason);
    process.exit(1);
  }
  console.log("✓ round-trip gate: all concept blocks reproduce byte-for-byte");

  const quizErrors = quizTagErrors(lessons);
  if (quizErrors.length > 0) {
    console.error("✗ quiz-tag errors:");
    for (const e of quizErrors) console.error("  " + e.reason);
    process.exit(1);
  }
  console.log("✓ quiz tags: every tests: tag resolves to this-or-earlier lesson");

  if (existsSync(GRAPH_PATH)) {
    const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf8"));
    const flat = [];
    for (const lesson of lessons) {
      for (let i = 0; i < lesson.concepts.length; i += 1) {
        flat.push({ id: "L" + lesson.id + ":" + i, order: flat.length, heading: lesson.concepts[i].heading });
      }
    }
    const problems = edgeErrors(graph.edges || [], flat);
    const forwards = problems.filter((p) => p.kind === "forward-ref");
    const orphans = problems.filter((p) => p.kind === "orphan-name");
    const broken = problems.filter((p) => p.kind === "broken-edge");
    const cycles = findCycles(graph.edges || []);
    for (const p of forwards) console.log("⚠ forward ref: " + p.reason);
    for (const p of orphans) console.log("⚠ orphan name: " + p.reason);
    for (const p of broken) console.log("⚠ broken edge: " + p.reason);
    for (const c of cycles) console.log("⚠ cycle: " + c.join(" → "));
    console.log(
      "✓ concept-graph.json: " + (graph.edges || []).length + " edges — " +
        forwards.length + " forward, " + orphans.length + " orphan, " + broken.length + " broken, " + cycles.length + " cycles"
    );
  } else {
    console.log("– no concept-graph.json yet (create one by exporting from the studio)");
  }
}

// ---------------------------------------------------------------------------

const [command, ...rest] = process.argv.slice(2);
if (command === "merge") {
  const target = rest.find((a) => !a.startsWith("--"));
  const dryRun = rest.includes("--dry-run");
  if (!target) {
    console.error("usage: node scripts/studio.mjs merge <export.json> [--dry-run]");
    process.exit(2);
  }
  cmdMerge(target, dryRun).catch((err) => fail(err.stack || err.message));
} else if (command === "validate") {
  cmdValidate().catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
  });
} else {
  console.error("Concept Studio CLI");
  console.error("  node scripts/studio.mjs merge <export.json> [--dry-run]");
  console.error("  node scripts/studio.mjs validate");
  process.exit(2);
}
