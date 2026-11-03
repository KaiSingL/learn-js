export function PageHeader({ eyebrow, title, subtitle, aside, compact = false }) {
  return (
    <header className={compact ? "mb-6" : "mb-8 lg:mb-10"}>
      <div className="eyebrow mb-5 flex items-center gap-2">
        <span className="rule" />
        {eyebrow}
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1
            className={
              "font-bold tracking-[-0.02em] leading-[0.98] " +
              (compact ? "text-[26px] lg:text-[32px]" : "text-[30px] lg:text-[40px]")
            }
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-prose text-[14px] leading-[1.65] text-muted">{subtitle}</p>
          ) : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  );
}

export function ProgressBar({ value, total, label, className = "" }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div
      className={"h-1.5 w-full overflow-hidden rounded-full bg-line " + className}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-label={label || "Course progress"}
    >
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
        style={{ width: pct + "%" }}
      />
    </div>
  );
}

export function Pill({ children, tone = "muted" }) {
  const tones = {
    muted: "border-line bg-card2 text-muted",
    accent: "border-accent/30 bg-accent/10 text-accent",
    good: "border-good/30 bg-good/10 text-good",
    danger: "border-danger/30 bg-danger/10 text-danger",
  };
  return (
    <span
      className={
        "mono inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide " +
        (tones[tone] || tones.muted)
      }
    >
      {children}
    </span>
  );
}
