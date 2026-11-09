# AGENTS.md — learn-js

Working rules for this repo, learned the hard way.

## Lesson content authoring

- One concept = one idea: heading states the idea, text is 1-3 sentences,
  code is a self-contained 4-12 line snippet that runs on its own.
- Every snippet carries a `purpose` line telling the student where to look
  before they read the code. Code comments announce output: `// -> result`.
- Teach the model, not syntax trivia. "= never declares" beats "a = 1 is bad".
- Terse must not mean unclear: a single-sentence concept must still be
  self-explanatory. No dangling referents ("a method that always walks" —
  name the methods: map/filter/reduce), no term from a later lesson without
  a named pointer ("Symbol, lesson 12"), and every term the heading promises
  must appear complete in the text (a "state machine" heading needs all
  three states named, not two). When a compressed phrase hides reasoning
  that took two facts to get ("by queue time"), expand the steps instead.
  (All four examples come from real concept rewrites in this repo.)
- Inline `check` questions go at the point of surprise. Quiz items are tagged
  `tests: "<concept heading>"`; the build fails if the tag does not resolve to
  this or an earlier lesson. Never test what was not taught.
- Order concepts so each only uses what earlier concepts taught. Reorder when
  it makes snippets self-contained (typeof moved before the globals concept).
- Use MemoryDiagram (value / reference / scope) when the model is spatial.

## Content must be true in the real runtime

- The sandbox default runner is a Worker: sloppy-mode eval, no `window`.
  Use `globalThis` for global access. Verify shipped snippets by running
  them in the real playground (Playwright: fill textarea → Run code →
  assert console) before committing.
- Never demonstrate what the sandbox cannot show (e.g. top-level var does
  not land on the global object inside the sandbox — defer such claims to
  the lesson that can prove them). Lesson 9's `window.z` bug is the
  cautionary example.

## Every name has a homeland

- Teaching flows strictly forward: a concept may use only (1) ordinary
  English, (2) names an earlier lesson taught, or (3) a name it teaches
  right now, backed by its own concept and code.
- If a concept needs a name the reader does not have yet, first give the
  reasoning in plain words ("one shared object every function looks to"),
  then add a named pointer to where the real term arrives ("lesson 5 names
  it the prototype"). Never rely on the later term alone (lesson 4's
  call/apply/bind is the cautionary case).
- When a lesson builds on an earlier chain, name the step it stands on in
  the first concept that uses it ("the functions-are-objects fact from
  lesson 3"). One clause of pointer is the unit; never re-teach an earlier
  lesson unless something is judged necessary.
- Trace the chain to the bottom: the terms inside a new concept's own
  explanation must resolve backward too. Every pointer ("Symbol, lesson
  12", "the rule the previous concept taught") must name a real concept or
  lesson that exists — vague toward a later lesson is a bug, not a hedge.

## Mechanical edits to structured data

- When transforming lessons.js or similar, remove one field at a time with
  independently verified patterns: assert match count AND max match size
  before writing. A combined lazy regex can span records and swallow whole
  lessons (this once deleted lessons 3, 8 and 13 — recovered from git).
