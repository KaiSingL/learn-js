# Teach `new` Before Its First Use (lesson 4 new concept)

> Superseded 2026-11-07: executed, then rethought with the author — the lesson 4 concept was removed and `new`'s homeland is now lesson 5 concept 1 ("new builds the object in four steps"), which carries the full behavior including the object-return rule. Lesson 4's var-self concept no longer uses `new` (plain-object counter with a detached inner call). This document is kept for the decision trail.

> **For Hermes:** Execute task-by-task; content rules live in AGENTS.md and the learn-js-dev skill.

**Goal:** `new` becomes a taught keyword before lesson 4 concept 5 (`var self = this`) uses `new Counter()` in its code. Today its mechanic is taught in lesson 5 concept 1, so the first use predates its homeland.

**Architecture:** Insert one new concept into lesson 4's `concepts` array, positioned immediately before "var self = this keeps the call site's this". It teaches the minimal true mechanic of `new` (build fresh object, call once with `this` set to it, hand it back), keeps its own code snippet, and leaves the FULL four-step story (including the prototype link and the return-value edge case) in lesson 5 concept 1, which stays the expansion, not a re-teach. No lesson renumbering, no quiz-tag changes.

**Tech Stack:** Bun + Vite SPA, content string literals in `src/data/lessons.js`, tier linter (`src/lib/lint.js`), bun test gate.

**Constraints (from AGENTS.md / learn-js-dev skill):**
- One concept = one idea; heading states the idea; text 1-3 sentences; code self-contained 4-12 lines.
- Code must pass the tier linter; never use terms without a homeland (no `prototype`, no `instanceof`, no `hasOwnProperty` in this concept).
- Result comments `// -> output` must be verified by real execution, never hand-written.
- Playwright browser check in the real playground before push.
- Keep the deploy diff reviewable: do not touch unrelated fields.

---

### Task 1: Run the concept snippet with Bun to verify claimed outputs

**Objective:** Never annotate by hand; prove `// -> Milo` and `// -> object` are what the runtime prints.

**Files:**
- Create: `/Users/oxs1/.hermes/cache/scratch/verify_new_concept.mjs` (scratch, not committed)

**Step 1: Write a temporary runner** containing exactly the planned snippet body:

```js
function Cat(name) {
  // inside a constructor body, this is the fresh object new built
  this.name = name;
}

var milo = new Cat("Milo");

console.log(milo.name);
console.log(typeof milo);
console.log(typeof Cat);
```

**Step 2: Run it**

Run: `bun /Users/oxs1/.hermes/cache/scratch/verify_new_concept.mjs`
Expected output, in order:
```
Milo
object
function
```
If anything differs, STOP and redesign the snippet text/comments before proceeding.

---

### Task 2: Insert the new concept into lesson 4 (`src/data/lessons.js`)

**Objective:** The `new` keyword has a homeland: a concept with heading, text, purpose, code, teachable before `var self` uses it.

**Files:**
- Modify: `src/data/lessons.js`, lesson 4 `concepts` array; insert the new object between the "bind returns a new function with this locked" object and the "var self = this keeps the call site's this" object.

**Step 1: Insert this exact object** (shape and voice matching the neighboring concepts):

```js
      {
        heading: "new builds the object, then calls the function once",
        text: "new is another way to call a function, and one lesson 4 still needs: new Cat(\"Milo\") first builds a fresh object, then runs Cat once with this pointed at that fresh object, then hands the object back. The name says the two halves in order — build, then call. The full four steps, including the link every built object gets, are lesson 5's opening concept.",
        purpose: "Watch new build first, call after, and hand the fresh object back.",
        code: `function Cat(name) {
  // inside a constructor body, this is the fresh object new built
  this.name = name;
}

var milo = new Cat("Milo");

console.log(milo.name);   // -> Milo
console.log(typeof milo); // -> object — a fresh object, not a call result
console.log(typeof Cat);  // -> function — the constructor stays a function`,
      },
```

Notes:
- The heading deliberately says "calls the function once" — "constructor" is not yet taught either; it arrives in lesson 5.
- The pointer to lesson 5 points at CONTENT (an expansion), not at an unused term, which is the AGENTS.md-compliant shape.

**Step 2: Lint the file**

Run: `bun test` (content-shape + tier lint gate runs with it)
Expected: 0 fail.

---

### Task 3: Rewire lesson 4's intro and the "var self" concept to lean on the new concept

**Objective:** The intro's "four ways" and the var-self text stop carrying second-hand `new` explanations that belonged to the new concept.

**Files:**
- Modify: `src/data/lessons.js` lesson 4 `intro` string and the "var self = this keeps the call site's this" concept `text`.

**Step 1: Intro** — current sentence: "The object before the dot, call, apply or bind: four ways to set it, each with a different way of passing the rest of the arguments." → replace with:

"A real function does not own this — every call supplies it. The object before the dot, call, apply or bind: four ways you control here, and new (the next-but-one concept) supplies it while building an object. And when a nested call would lose the right this, an ordinary variable holds onto it. None of these are new syntax: call, apply and bind come with every function, found on one shared object rather than written onto each one."

("next-but-one" is fragile wording; simpler final wording: "and a fifth, new, builds it into an object before calling — its own concept comes first." Keep whichever reads best after writing; the principle is: name the five suppliers, point at the new concept without hard vocabulary.)

**Step 2: var-self concept `text`** — current (after the interim patch): "...An inner function called on its own does not inherit the outer call's this — the call site decides, and a plain call supplies none. new Counter() is one more way to call: it first builds a fresh object, then runs the function once with this pointed at that object (the full four steps are lesson 5's opening concept). The fix is..." → replace the middle sentence with:

"new Counter() runs Counter the new way — fresh object first, then one call with this on it (the previous concept)."

Final text body:

"An inner function called on its own does not inherit the outer call's this — the call site decides, and a plain call supplies none. new Counter() runs Counter the new way, fresh object first, then one call with this on it (the previous concept). The fix is to capture this in an ordinary variable while it is still correct, and use that variable inside."

**Step 3: Lint + unit tests**

Run: `bun test`
Expected: 96 pass / 0 fail (concept count grows, all shape invariants hold).

---

### Task 4: Headless runtime verification of the shipped snippet

**Objective:** Prove the snippet, as shipped in `lessons.js`, really prints the annotated outputs (the scratch run in Task 1 is the source text, not the shipped file).

**Files:**
- Create: `/Users/oxs1/.hermes/cache/scratch/extract_new_concept.mjs`

**Step 1: Extract-and-run** — script imports `getLesson(4)`, finds the concept whose heading starts with "new builds the object", writes nothing, executes `c.code` in a Worker-free plain scope (console.log capture) and prints captured lines.

Expected (in order): `Milo`, `object`, `function`.

---

### Task 5: Browser (real playground) verification

**Objective:** AGENTS.md rule: verify shipped snippets in the real playground before committing.

**Files:** none (browser only, dev server on :5180)

**Step 1:** Start `bun run dev --host 127.0.0.1 --port 5180` (background if not already running).
**Step 2:** Open lesson 4, collapse to concept 5/6 region, paste the snippet body (without result comments) into the playground textarea, press Run, assert console shows `Milo`, `object`, `function`.
**Step 3:** Also eyeball the new concept renders in the lesson body with the new heading between "bind..." and "var self...".

---

### Task 6: Emulator check at 390px (mobile-web-ux house rule)

**Objective:** Any new grid/flex column in a lesson body needs `min-w-0`; the new concept uses only the standard `Concepts` card, so the check is confirmation, not new CSS.

**Step 1:** In the browser session, emulate 390x844, open lesson 4 expanded, scroll to the new concept.
**Step 2:** Assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (no horizontal overflow).
**Step 3:** Screenshot for the record.

---

### Task 7: Commit and push

**Objective:** Land the change with a reviewable, single-purpose diff.

**Step 1:** `git add src/data/lessons.js`
**Step 2:** Commit message:

```
feat(lessons): teach new before its first use (lesson 4 concept)

New concept "new builds the object, then calls the function once":
fresh object first, one call with this on it, object handed back.
Lesson 5 concept 1 stays the four-step expansion (prototype link,
return-value edge), not a re-teach. Intro lists the five this
suppliers; var-self concept leans back on the new concept instead
of restating the mechanic. 96/96 tests pass.
```

**Step 3:** `git push origin master` and verify the GitHub Pages run on the new sha reaches `completed / success`, then grep the live page for the new heading.

---

## Out of scope (deferred)

- No lesson renumbering (lesson ids, cross-lesson pointers, and GitHub Pages anchors are all lesson-id bound; the ripple outweighs the gain).
- No inline `check` question on the new concept for now (lesson 5 concept 1 has the four steps; a check can be added later if the reader trails).
- AGENTS.md needs no edit: rule 1 already covers "a name it teaches right now, backed by its own concept and code", which is exactly what this plan does.

## Pre-execution state (context for the implementer)

- `src/data/lessons.js` currently carries UNCOMMITTED edits from this session: lesson 4 origin-chain rework (call/apply/bind from a shared object), the L5 backward-naming loop on "Prototype methods are shared", sloppy-mode homeland (L1 concept 3), L11 executor/reactions/settle/microtask glosses, L13 listener gloss, L14 circular-reference gloss, L7 checklist pointer, and the interim "new Counter()" sentence in var-self that Task 3 replaces. Handle commit shape: either commit the pending teaching fixes first as their own commit, or fold everything into one content commit; never mix AGENTS.md changes into the content commit.
