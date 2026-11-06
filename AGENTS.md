# AGENTS.md — learn-js

Working rules for this repo, learned the hard way.

## Lesson content authoring

- One concept = one idea: heading states the idea, text is 1-3 sentences,
  code is a self-contained 4-12 line snippet that runs on its own.
- Every snippet carries a `purpose` line telling the student where to look
  before they read the code. Code comments announce output: `// -> result`.
- Teach the model, not syntax trivia. "= never declares" beats "a = 1 is bad".
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

## Mechanical edits to structured data

- When transforming lessons.js or similar, remove one field at a time with
  independently verified patterns: assert match count AND max match size
  before writing. A combined lazy regex can span records and swallow whole
  lessons (this once deleted lessons 3, 8 and 13 — recovered from git).
