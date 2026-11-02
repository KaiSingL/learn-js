import { CHEATSHEET } from "../data/cheatsheet.js";
import { LESSONS } from "../data/lessons.js";
import { PROJECT_STEPS } from "../data/project.js";
import { navigate } from "../lib/router.js";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line pb-10 pt-10">
      <div className="flex flex-col justify-between gap-6 lg:flex-row">
        <div>
          <div className="flex items-center gap-2">
            <span className="mono flex h-6 w-6 items-center justify-center bg-accent text-[12px] font-black text-black">
              R
            </span>
            <span className="mono text-[12px] font-bold tracking-[0.14em]">
              REAL.JS — NO SUGAR, NO SHORTHAND
            </span>
          </div>
          <p className="mono mt-2 max-w-[52ch] text-[11px] leading-[1.6] text-muted">
            Built for engineers who debug transpiled code. Every lesson uses var, function and
            prototype. No arrow, no class, no magic.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={function () {
                navigate("/lessons");
              }}
              className="mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper"
            >
              Lessons
            </button>
            <span className="mono text-[10px] text-muted/30">/</span>
            <button
              type="button"
              onClick={function () {
                navigate("/cheatsheet");
              }}
              className="mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper"
            >
              Cheatsheet
            </button>
            <span className="mono text-[10px] text-muted/30">/</span>
            <button
              type="button"
              onClick={function () {
                navigate("/playground");
              }}
              className="mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper"
            >
              Playground
            </button>
            <span className="mono text-[10px] text-muted/30">/</span>
            <button
              type="button"
              onClick={function () {
                navigate("/project");
              }}
              className="mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper"
            >
              Project
            </button>
          </div>
        </div>

        <div className="mono text-[10px] leading-[1.7] text-muted/60">
          <div>
            {LESSONS.length} lessons · {CHEATSHEET.length} mappings · {PROJECT_STEPS.length} project
            steps
          </div>
          <div>Background #0E0E10 · Card #17171A · Accent #FFC52C</div>
          <div className="mt-2 text-muted">© {new Date().getFullYear()} REAL.JS course spec</div>
          <div className="mt-1">
            <span className="rounded border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
              Ctrl K
            </span>{" "}
            to search anywhere
          </div>
        </div>
      </div>
    </footer>
  );
}
