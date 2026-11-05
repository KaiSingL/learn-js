import CodeBlock from "./CodeBlock.jsx";
import MemoryDiagram from "./MemoryDiagram.jsx";
import Quiz from "./Quiz.jsx";

// The migrated lesson body: numbered concept segments, one idea each.
// A segment is heading -> short text -> purpose-labelled snippet, plus an
// optional memory sketch and an optional inline check question.
export default function Concepts({ concepts, onPlayground }) {
  return (
    <div>
      <div className="mono mb-2 text-[10px] uppercase tracking-[0.14em] text-muted">
        Concepts — {concepts.length} small steps, one idea each
      </div>
      <div className="space-y-4">
        {concepts.map(function (concept, index) {
          return (
            <div
              key={concept.heading}
              className="rounded-panel border border-line bg-card p-4"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="mono shrink-0 rounded border border-line bg-card2 px-1.5 py-0.5 text-[10px] leading-[1.6] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[13.5px] font-semibold leading-[1.3] text-paper">
                  {concept.heading}
                </h3>
              </div>
              <p className="text-[12.5px] leading-[1.65] text-paper/80">{concept.text}</p>
              <CodeBlock
                label={concept.purpose}
                code={concept.code}
                onPlayground={onPlayground}
              />
              {concept.diagram ? <MemoryDiagram kind={concept.diagram} /> : null}
              {concept.check ? (
                <div className="mt-2">
                  <Quiz items={[concept.check]} label="Quick check" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
