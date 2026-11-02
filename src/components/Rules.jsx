import { ALLOWED, CHECK_RULE, FORBIDDEN } from "../data/rules.js";
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
        eyebrow="Section 01 — The no-sugar ruleset"
        title="Allowed vs forbidden"
        subtitle="Lint it in your mind. Every forbidden token has a real equivalent on the right. We only write the right side."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-card border border-line bg-card">
          <div className="flex h-11 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-danger" />
              <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">Forbidden</span>
            </div>
            <span className="mono text-[10px] text-muted">// sugar — do not use</span>
          </div>
          <div className="divide-y divide-line/60 p-4">
            {FORBIDDEN.map(function (item) {
              return (
                <div key={item.code} className="flex items-baseline gap-3 py-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger/60" />
                  <span className="mono min-w-0 text-[12px] leading-[1.5] text-paper/80">
                    <span className="text-danger/90">{item.code}</span>
                    <span className="text-muted"> — {item.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <CodeBlock label="forbidden example" code={SUGAR_SAMPLE} minimal onPlayground={onPlayground} />
          </div>
        </div>

        <div className="overflow-hidden rounded-card border border-line bg-card">
          <div className="flex h-11 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-good" />
              <span className="mono text-[11px] font-semibold uppercase tracking-[0.14em]">Allowed</span>
            </div>
            <span className="mono text-[10px] text-muted">// real — only this</span>
          </div>
          <div className="divide-y divide-line/60 p-4">
            {ALLOWED.map(function (item) {
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
            <CodeBlock label="allowed equivalent" code={REAL_SAMPLE} minimal onPlayground={onPlayground} />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-panel border border-accent/20 bg-accent/[0.06] px-4 py-3">
        <Icon name="warning" size={15} className="mt-0.5 shrink-0 text-accent" />
        <p className="mono text-[11.5px] leading-[1.6] text-paper/75">
          Check rule: arrow functions hide this binding. Template literals hide concatenation. ++ hides{" "}
          <span className="text-paper">a = a + 1</span>. class hides prototype. If you use it, rewrite
          it without it.
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
            <span className="mono text-paper">Promise</span>,{" "}
            <span className="mono text-paper">setTimeout</span> and{" "}
            <span className="mono text-paper">document</span> are allowed. They are not hiding a
            different control flow.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="good">Object.create</Pill>
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
              The checker is not a suggestion
            </div>
            <p className="mt-1 max-w-[56ch] text-[13px] leading-[1.6] text-muted">
              Paste the forbidden example into the playground and the linter marks every violation by
              line and column, with the replacement to write instead. Execution is still allowed.
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
