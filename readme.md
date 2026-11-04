# Learn JS — JavaScript Without the Magic

Learn JavaScript by reading only what the engine actually executes. No transpiled shortcuts — the course reverses the learning order: we start where Babel ends.

**Live site: https://kaisingl.github.io/learn-js/**

## The three-tier ruleset

- **Tier 0 — primitives you must master**: `var`, `function`, `if`/`else`, `for(;;)`/`while`, `new`, `this`, `prototype`
- **Tier 1 — allowed but explicit** (real ES5+ semantics, each with a hidden default you must know): `let`/`const` throw in the temporal dead zone, `Object.defineProperty` defaults every missing flag to `false`, `Object.create` links without running a constructor, `"use strict"` turns silent globals into loud errors, `arguments` is array-like and not an Array
- **Tier 2 — banned sugar, shown only in translation**: arrow functions, template literals, `class`/`extends`, destructuring, spread, default parameters, `++`/`--`/`+=`, `?.`, `??`, `for...of`/`for...in`, `async`/`await`, `import`/`export`, `**`, black-box array methods

Rule #0: **If you cannot write it with `var` + `function` + `prototype`, you do not understand it yet.**

## What's in the app

| Section | What it does |
| --- | --- |
| **Rules** | The three-tier ruleset, with the hidden default each Tier 1 feature carries |
| **Lessons** | 14 lessons — every one has real code, a *Break It* snippet (the sugared version), a predict quiz, a translate exercise, and runnable solutions |
| **Cheatsheet** | Sugar → real mapping, plus a table of hidden defaults that bite |
| **De-sugar Lab** | Paste modern sugar, get tier-tagged analysis and the Tier 0/1 equivalent |
| **Playground** | Runs your code in a sandboxed worker/iframe; Tier 2 sugar blocks Run, Tier 1 runs fine with notes |
| **Final project** | EventEmitter, manual Promise and IIFE module built from primitives |

## Curriculum (14 lessons)

1. Variables, Types & Reference vs Value
2. Scope, Hoisting & TDZ
3. Functions Are Objects + arguments
4. this, call, apply, bind
5. Objects & Prototype — The Real Class
6. Property Descriptors — defineProperty
7. Coercion & Equality — `+`, `==`/`===`, ToPrimitive
8. Arrays Without Magic
9. Global Pollution & Strict Mode
10. Event Loop — Stack, WebAPI, Queue
11. Async Without Sugar
12. Generators & Iterators — Manual State Machines
13. Building Real Things — EventEmitter, Manual Promise, IIFE Module
14. Shallow Copy & Deep Copy — Same Shell vs New Shell

## Development

Requires [Bun](https://bun.sh):

```bash
bun install
bun run dev          # dev server on :5180
bun test             # 72 unit tests — content shape, tier-aware linter, router
bun run build        # single-file bundle in dist/ (vite-plugin-singlefile)
bun scripts/e2e.js   # Playwright checks (needs: bunx playwright install chromium)
```

## Deployment

Every push to `master` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): the test suite gates the build, and `dist/` is published to GitHub Pages at **https://kaisingl.github.io/learn-js/**.
