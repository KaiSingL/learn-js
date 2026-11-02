import { useState } from "react";
import {
  CHEATSHEET,
  CHEATSHEET_CATEGORIES,
  filterCheatsheet,
} from "../data/cheatsheet.js";
import Icon from "./Icon.jsx";
import { PageHeader } from "./PageHeader.jsx";

export default function Cheatsheet({ onPlayground }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const rows = filterCheatsheet(query, category);

  return (
    <div>
      <PageHeader
        eyebrow="Section 03 — Cheatsheet"
        title={
          <>
            Sugar → Real
            <br />
            <span className="text-muted">mapping</span>
          </>
        }
        subtitle="Every row keeps the shortcut you see on the left and the code the engine actually runs on the right. The real column obeys the course rules."
        aside={
          <div className="flex w-full items-center gap-2 lg:w-[380px]">
            <div className="relative min-w-0 flex-1">
              <input
                value={query}
                onChange={function (event) {
                  setQuery(event.target.value);
                }}
                placeholder="Filter: arrow, class, ??, spread..."
                aria-label="Filter mappings"
                className="mono h-10 w-full rounded-lg border border-line bg-card px-3 pr-10 text-[12px] text-paper placeholder:text-muted/60 focus:border-accent/50 focus:outline-none"
              />
              <span className="mono pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted">
                {rows.length}
              </span>
            </div>
            <button
              type="button"
              onClick={function () {
                setQuery("");
                setCategory("all");
              }}
              className="btn h-10 shrink-0 px-3"
            >
              Clear
            </button>
          </div>
        }
      />

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {CHEATSHEET_CATEGORIES.map(function (item) {
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={function () {
                setCategory(item);
              }}
              aria-pressed={active}
              className={
                "mono shrink-0 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-wide transition-colors " +
                (active
                  ? "border-accent bg-accent text-black"
                  : "border-line bg-card2 text-muted hover:text-paper")
              }
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-card border border-line bg-card lg:block">
        <div className="mono grid h-11 grid-cols-[1.05fr_1.35fr_1fr_44px] items-center border-b border-line bg-card2 px-5 text-[10px] uppercase tracking-[0.14em] text-muted">
          <div>Sugar — what you see</div>
          <div>Real code — what runs</div>
          <div>Why it matters</div>
          <div />
        </div>
        <div className="divide-y divide-line/60">
          {rows.map(function (row, index) {
            return (
              <div
                key={row.sugar + index}
                className="grid grid-cols-[1.05fr_1.35fr_1fr_44px] items-start px-5 py-3 transition-colors hover:bg-card2/60"
              >
                <div className="mono break-all pr-4 text-[12px] leading-[1.55] text-accent/90">
                  {row.sugar}
                </div>
                <div className="mono break-all pr-4 text-[12px] leading-[1.55] text-paper/80">
                  {row.real}
                </div>
                <div className="pr-3 text-[12px] leading-[1.55] text-muted">{row.why}</div>
                <button
                  type="button"
                  onClick={function () {
                    onPlayground(row.real, "Cheatsheet: " + row.sugar);
                  }}
                  className="btn h-7 w-7"
                  title="Open this real code in the playground"
                  aria-label={"Open " + row.sugar + " in the playground"}
                >
                  <Icon name="play" size={11} />
                </button>
              </div>
            );
          })}
        </div>
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="mono text-[12px] text-muted">No mappings match that filter.</p>
            <button
              type="button"
              onClick={function () {
                setQuery("");
                setCategory("all");
              }}
              className="mono mt-2 text-[11px] text-accent underline underline-offset-2"
            >
              Reset filters
            </button>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 lg:hidden">
        {rows.map(function (row, index) {
          return (
            <div
              key={row.sugar + index}
              className="rounded-panel border border-line bg-card p-4"
            >
              <div className="mono mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted">
                <span>Sugar</span>
                <span className="rounded border border-line bg-card2 px-1.5 py-0.5 text-[9px]">
                  {row.cat}
                </span>
              </div>
              <div className="mono mb-3 break-all text-[12px] leading-[1.5] text-accent">{row.sugar}</div>
              <div className="mono mb-1 text-[10px] uppercase tracking-wide text-muted">Real</div>
              <div className="mono mb-3 break-all rounded-md border border-line bg-card2 p-2 text-[11.5px] leading-[1.55] text-paper">
                {row.real}
              </div>
              <div className="text-[12px] leading-[1.5] text-muted">{row.why}</div>
              <button
                type="button"
                onClick={function () {
                  onPlayground(row.real, "Cheatsheet: " + row.sugar);
                }}
                className="btn mt-3 h-8 w-full px-3"
              >
                <Icon name="play" size={11} />
                Open in playground
              </button>
            </div>
          );
        })}
        {rows.length === 0 ? (
          <div className="rounded-panel border border-dashed border-line p-6 text-center">
            <p className="mono text-[12px] text-muted">No mappings match that filter.</p>
          </div>
        ) : null}
      </div>

      <div className="mono mt-4 text-center text-[11px] text-muted">
        {rows.length} of {CHEATSHEET.length} mappings · search filters every column
      </div>
    </div>
  );
}
