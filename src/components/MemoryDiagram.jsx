// Small memory sketches for the two meanings of =.
// kind="value"     — two names, two independent boxes (primitives)
// kind="reference" — two names, one shared object (objects and arrays)
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
            <span className="mono text-[12px] leading-none text-muted">▶</span>
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
  return null;
}

function Binding({ name, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mono rounded border border-line bg-card px-1.5 py-0.5 text-[11px] text-paper">
        {name}
      </span>
      <span className="mono text-[12px] leading-none text-muted">▶</span>
      <span className="mono rounded-md border border-line bg-card px-2 py-0.5 text-[11px] text-paper">
        {value}
      </span>
    </div>
  );
}
