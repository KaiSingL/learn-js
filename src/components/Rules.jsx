import {
  ALLOWED,
  CHECK_RULE,
  FORBIDDEN,
  TIER0,
  TIER1,
  TIER2,
} from "../data/rules.js";
import { navigate } from "../lib/router.js";
import CodeBlock from "./CodeBlock.jsx";
import Icon from "./Icon.jsx";
import { PageHeader, Pill } from "./PageHeader.jsx";

const SUGAR_SAMPLE = `class Counter {
  count = 0
  inc = () => this.count++
}

const msg = \`count is \${counter?.count ?? 0}\`
for (let x of items) { console.log(x) }
const { a, b } = obj`;

const REAL_SAMPLE = `function Counter() {
  this.count = 0;
}
Counter.prototype.inc = function () {
  this.count = this.count + 1;
  return this.count;
};

var c = new Counter();
var msg;
if (c.count === undefined) { msg = "count is 0"; }
else { msg = "count is " + c.count; }

for (var i = 0; i < items.length; i = i + 1) {
  console.log(items[i]);
}

var a = obj.a;
var b = obj.b;`;

export default function Rules({ onPlayground }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Section 01 — The three-tier ruleset"
        title="Tier 0, Tier 1, Tier 2"
        subtitle="Tier 0 primitives are all you write. Tier 1 is allowed but explicit — each carries a hidden default you must know. Tier 2 sugar is banned in exercises and shown only in translation."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-card border border-line bg-card">
          <div className="flex h-11 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-good" />
              <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">Tier 0 — Primitive</span>
            </div>
            <span className="mono text-[10px] text-muted">you must master</span>
          </div>
          <div className="divide-y divide-line/60 p-4">
            {TIER0.map(function (item) {
              return (
                <div key={item.code} className="flex items-baseline gap-3 py-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-good/70" />
                  <span className="mono min-w-0 text-[12px] leading-[1.5] text-paper/80">
                    <span className="text-good">{item.code}</span>
                    <span className="text-muted"> — {item.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <CodeBlock label="Tier 0 example" code={REAL_SAMPLE} minimal onPlayground={onPlayground} />
          </div>
        </div>

        <div className="overflow-hidden rounded-card border border-accent/30 bg-accent/[0.04]">
          <div className="flex h-11 items-center justify-between border-b border-accent/30 px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">Tier 1 — Real ES5+</span>
            </div>
            <span className="mono text-[10px] text-muted">allowed, but explicit</span>
          </div>
          <div className="divide-y divide-accent/30 p-4">
            {TIER1.map(function (item) {
              return (
                <div key={item.code} className="flex items-baseline gap-3 py-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/60" />
                  <span className="mono min-w-0 text-[12px] leading-[1.5] text-paper/80">
                    <span className="text-accent">{item.code}</span>
                    <span className="text-muted"> — {item.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="p-4 space-y-2">
            {TIER1.map(function (item) {
              return (
                <div key={item.code} className="rounded-md border border-line/30 bg-card/50 p-3">
                  <div className="mono mb-1 text-[10px] uppercase tracking-wide text-accent/70">
                    {item.label}
                  </div>
                  <p className="mono text-[11px] leading-[1.55] text-muted">{item.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-card">
          <div className="flex h-11 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-danger" />
              <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">Tier 2 — Sugar</span>
            </div>
            <span className="mono text-[10px] text-muted">banned, translate only</span>
          </div>
          <div className="divide-y divide-line/60 p-4">
            {TIER2.map(function (item) {
              return (
                <div key={item.code} className="flex items-baseline gap-3 py-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger/60" />
                  <span className="mono min-w-0 text-[12px] leading-[1.5] text-paper/80">
                    <span className="text-danger/90">{item.label}</span>
                    <span className="text-muted"> — {item.replaces}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <CodeBlock label="Tier 2 example" code={SUGAR_SAMPLE} minimal onPlayground={onPlayground} />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-panel border border-accent/20 bg-accent/[0.06] px-4 py-3">
        <Icon name="warning" size={15} className="mt-0.5 shrink-0 text-accent" />
        <p className="mono text-[11.5px] leading-[1.6] text-paper/75">
          Tier 1 is allowed because it is real semantics, not sugar. <span className="text-paper">let</span> throws in the
          temporal dead zone before its line. <span className="text-paper">Object.defineProperty</span> defaults every
          missing flag to false — including <span className="text-paper">enumerable:false</span>, which hides properties
          from Object.keys. <span className="text-paper">"use strict"</span> turns silent globals into loud
          ReferenceErrors. Know the default before you use the feature.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-card bg-accent p-5 text-black">
          <div className="mono mb-2 text-[10px] uppercase tracking-[0.12em] opacity-60">Rule #0</div>
          <div className="text-[16px] font-semibold leading-[1.35]">{CHECK_RULE}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={function () {
                navigate("/lessons");
              }}
              className="mono rounded-md bg-black px-3 py-2 text-[10px] uppercase tracking-wide text-accent"
            >
              Start lesson 01
            </button>
            <button
              type="button"
              onClick={function () {
                navigate("/cheatsheet");
              }}
              className="mono rounded-md border border-black/20 px-3 py-2 text-[10px] uppercase tracking-wide text-black"
            >
              See the mappings
            </button>
          </div>
        </div>

        <div className="rounded-card border border-line bg-card p-5">
          <div className="mono mb-2 text-[10px] uppercase tracking-[0.12em] text-muted">
            Platform APIs are not sugar
          </div>
          <p className="text-[13px] leading-[1.65] text-muted">
            The rules are about syntax. Runtime APIs such as{" "}
            <span className="mono text-paper">Object.keys</span>,{" "}
            <span className="mono text-paper">Object.create</span>,{" "}
            <span className="mono text-paper">Object.defineProperty</span>,{" "}
            <span className="mono text-paper">Promise</span>,{" "}
            <span className="mono text-paper">setTimeout</span> and{" "}
            <span className="mono text-paper">document</span> are allowed. They are not hiding a different control flow.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="good">Object.create</Pill>
            <Pill tone="good">Object.defineProperty</Pill>
            <Pill tone="good">Promise</Pill>
            <Pill tone="good">setTimeout</Pill>
            <Pill tone="good">document</Pill>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-line bg-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.12em] text-muted">
              The checker is tier-aware
            </div>
            <p className="mt-1 max-w-[56ch] text-[13px] leading-[1.6] text-muted">
              Tier 2 sugar is an error and blocks Run in the playground. Tier 1 features run fine but show a note about
              the hidden default they carry. Paste the Tier 2 sample into the playground to see every violation by line
              and column, with the replacement to write instead.
            </p>
          </div>
          <button
            type="button"
            onClick={function () {
              onPlayground(SUGAR_SAMPLE, "rules sample");
            }}
            className="btn h-10 shrink-0 px-4"
          >
            <Icon name="play" size={13} />
            Open sugar sample
          </button>
        </div>
      </div>
    </div>
  );
}
