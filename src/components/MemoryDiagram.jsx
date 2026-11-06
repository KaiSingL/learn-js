// Small memory sketches for the concepts that need a spatial model.
// kind="value"     — two names, two independent boxes (primitives)
// kind="reference" — two names, one shared object (objects and arrays)
// kind="scope"     — var stays in the function; loose assignment leaks to global
// kind="closure"   — a returned function keeps its birthplace scope alive
// kind="loop-var"  — one var in a loop is one binding, left at 3 when the calls happen
// kind="iife"      — an IIFE per pass gives each callback its own j (0, 1, 2)
export default function MemoryDiagram({ kind }) {
  if (kind === "value") {
    return (
      <div className="mt-3 rounded-md border border-line bg-card2 px-3 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Binding name="a" value="5" />
          <Binding name="b" value="10" />
        </div>
        <p className="mono mt-2 text-[10px] leading-[1.5] text-muted">
          = copied the value — two independent boxes; re-pointing b never touches a
        </p>
      </div>
    );
  }
  if (kind === "reference") {
    return (
      <div className="mt-3 rounded-md border border-line bg-card2 px-3 py-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex flex-col gap-1.5">
            <span className="mono rounded border border-line bg-card px-1.5 py-0.5 text-[11px] text-paper">
              user
            </span>
            <span className="mono rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">
              alias
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="h-px w-5 bg-line" />
            <Arrow className="text-muted" />
            <span className="h-px w-5 bg-accent/60" />
          </div>
          <div className="mono rounded-md border border-line bg-card px-2.5 py-2 text-[11px] text-paper">
            {'{ name: "Lydia" }'}
          </div>
        </div>
        <p className="mono mt-2 text-[10px] leading-[1.5] text-muted">
          = copied the reference — two names, one object; a change through either name is visible
          through both
        </p>
      </div>
    );
  }
  if (kind === "scope") {
    return (
      <div className="mt-3 rounded-md border border-line bg-card2 px-3 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-line bg-card px-2.5 py-2">
            <div className="mono mb-1.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
              function run
            </div>
            <span className="mono rounded border border-line bg-card2 px-1.5 py-0.5 text-[11px] text-paper">
              inside
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="mono text-[10px] text-accent">leaked</span>
            <span className="flex items-center gap-0.5 text-accent">
              <Arrow />
              <Arrow />
            </span>
          </div>
          <div className="rounded-md border border-accent/40 bg-accent/10 px-2.5 py-2">
            <div className="mono mb-1.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
              global object
            </div>
            <span className="mono rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">
              leaked
            </span>
          </div>
        </div>
        <p className="mono mt-2 text-[10px] leading-[1.5] text-muted">
          var stays inside the function; a loose assignment escapes all the way out to the global
          object
        </p>
      </div>
    );
  }
  if (kind === "closure") {
    return (
      <div className="mt-3 rounded-md border border-line bg-card2 px-3 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-md border border-accent/40 bg-accent/10 px-2.5 py-2">
            <div className="mono mb-1.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
              returned function
            </div>
            <span className="mono rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">
              increment
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="mono text-[10px] leading-none text-muted">holds</span>
            <Arrow className="text-muted" />
          </div>
          <div className="rounded-md border border-line bg-card px-2.5 py-2">
            <div className="mono mb-1.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
              birthplace scope
            </div>
            <span className="mono rounded border border-line bg-card2 px-1.5 py-0.5 text-[11px] text-paper">
              count
            </span>
          </div>
        </div>
        <p className="mono mt-2 text-[10px] leading-[1.5] text-muted">
          the GC frees only unreachable memory — the returned function keeps its birthplace scope
          reachable, so count stays alive and every call finds it
        </p>
      </div>
    );
  }
  if (kind === "loop-var") {
    return (
      <div className="mt-3 rounded-md border border-line bg-card2 px-3 py-3">
        <div className="mono mb-1.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
          while looping — each pass only creates a function
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
          <IterationCard i="0" fn="fns[0]" />
          <Arrow className="text-muted" />
          <IterationCard i="1" fn="fns[1]" />
          <Arrow className="text-muted" />
          <IterationCard i="2" fn="fns[2]" />
          <Arrow className="text-muted" />
          <div className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1.5">
            <div className="mono text-[11px] leading-[1.4] text-accent">i = 3</div>
            <div className="mono text-[10px] leading-[1.4] text-muted">ends</div>
          </div>
        </div>
        <div className="mono mt-1 text-[10px] leading-[1.5] text-muted">
          creating a function stores nothing
        </div>
        <div className="mono mb-1.5 mt-3 text-[9.5px] uppercase tracking-[0.12em] text-muted">
          when called — all three read the one binding
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <div className="flex flex-col gap-1.5">
            <Chip>fns[0]()</Chip>
            <Chip>fns[1]()</Chip>
            <Chip>fns[2]()</Chip>
          </div>
          <div className="flex flex-col items-start justify-around self-stretch py-1">
            <Arrow className="text-muted" />
            <Arrow className="text-muted" />
            <Arrow className="text-muted" />
          </div>
          <span className="mono text-[10px] text-muted">reads i</span>
          <Arrow className="text-muted" />
          <div className="rounded-md border border-accent/40 bg-accent/10 px-2.5 py-2">
            <div className="mono mb-1.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
              one shared binding
            </div>
            <div className="flex items-center gap-2">
              <span className="mono rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[11px] text-accent">
                i : 3
              </span>
              <span className="mono text-[11px] text-accent">→ 3, 3, 3</span>
            </div>
          </div>
        </div>
        <p className="mono mt-2 text-[10px] leading-[1.5] text-muted">
          each call reads the binding as it is at call time — the loop left it at 3
        </p>
      </div>
    );
  }
  if (kind === "iife") {
    return (
      <div className="mt-3 rounded-md border border-line bg-card2 px-3 py-3">
        <div className="mono mb-1.5 text-[9.5px] uppercase tracking-[0.12em] text-muted">
          while looping — each pass runs the IIFE, i → a fresh j
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
          <IterationCard i="0" j="0" fn="fns[0]" />
          <Arrow className="text-muted" />
          <IterationCard i="1" j="1" fn="fns[1]" />
          <Arrow className="text-muted" />
          <IterationCard i="2" j="2" fn="fns[2]" />
          <Arrow className="text-muted" />
          <div className="rounded-md border border-line bg-card px-2 py-1.5">
            <div className="mono text-[11px] leading-[1.4] text-paper">i = 3</div>
            <div className="mono text-[10px] leading-[1.4] text-muted">ends</div>
          </div>
        </div>
        <div className="mono mt-1 text-[10px] leading-[1.5] text-muted">
          each IIFE call copies this pass&apos;s value into a new j
        </div>
        <div className="mono mb-1.5 mt-3 text-[9.5px] uppercase tracking-[0.12em] text-muted">
          when called — each reads its own j
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <div className="flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-2">
              <Chip>fns[0]()</Chip>
              <Arrow className="text-muted" />
              <OwnBinding value="0" />
            </div>
            <div className="flex items-center gap-2">
              <Chip>fns[1]()</Chip>
              <Arrow className="text-muted" />
              <OwnBinding value="1" />
            </div>
            <div className="flex items-center gap-2">
              <Chip>fns[2]()</Chip>
              <Arrow className="text-muted" />
              <OwnBinding value="2" />
            </div>
          </div>
          <span className="mono text-[11px] text-accent">→ 0, 1, 2</span>
        </div>
        <p className="mono mt-2 text-[10px] leading-[1.5] text-muted">
          each j was captured when the IIFE ran — the calls never read i, which the loop still left
          at 3
        </p>
      </div>
    );
  }
  return null;
}

function Binding({ name, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mono rounded border border-line bg-card px-1.5 py-0.5 text-[11px] text-paper">
        {name}
      </span>
      <Arrow className="text-muted" />
      <span className="mono rounded-md border border-line bg-card px-2 py-0.5 text-[11px] text-paper">
        {value}
      </span>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="mono rounded border border-line bg-card px-1.5 py-0.5 text-[11px] text-paper">
      {children}
    </span>
  );
}

function OwnBinding({ value }) {
  return (
    <span className="mono rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] text-accent">
      j : {value}
    </span>
  );
}

function IterationCard({ i, fn, j }) {
  return (
    <div className="rounded-md border border-line bg-card px-2 py-1.5">
      <div className="mono text-[11px] leading-[1.4] text-paper">
        i = {i}
        {j ? (
          <span>
            {" → "}
            <span className="text-accent">j = {j}</span>
          </span>
        ) : null}
      </div>
      <div className="mono text-[10px] leading-[1.4] text-muted">+ {fn}</div>
    </div>
  );
}

// A real arrow (shaft + head) instead of the ▶ glyph: crisp at any size and
// identical across fonts.
function Arrow({ className = "" }) {
  return (
    <svg
      viewBox="0 0 16 7"
      aria-hidden="true"
      className={"shrink-0 h-[7px] w-4 " + className}
    >
      <line x1="0" y1="3.5" x2="11" y2="3.5" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="11,0.5 15,3.5 11,6.5" fill="currentColor" />
    </svg>
  );
}
