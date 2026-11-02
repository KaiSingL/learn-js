import { useState } from "react";
import Icon from "./Icon.jsx";

export default function Quiz({ items, label = "Knowledge check" }) {
  const [picked, setPicked] = useState({});
  const answered = Object.keys(picked).length === items.length;

  function choose(question, option) {
    if (picked[question] !== undefined) return;
    const next = {};
    for (const key in picked) next[key] = picked[key];
    next[question] = option;
    setPicked(next);
  }

  function reset() {
    setPicked({});
  }

  return (
    <div className="rounded-panel border border-line bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="mono text-[11px] font-semibold uppercase tracking-[0.12em]">{label}</span>
        </div>
        <span className="mono text-[10px] text-muted">
          {Object.keys(picked).length}/{items.length}
        </span>
      </div>

      <div className="space-y-4">
        {items.map(function (item, questionIndex) {
          const selected = picked[questionIndex];
          const revealed = selected !== undefined;
          const correct = selected === item.answer;

          return (
            <div key={questionIndex} role="group" aria-label={"Question " + (questionIndex + 1)}>
              <p className="text-[12.5px] leading-[1.55] text-paper/85">
                <span className="mono mr-1.5 text-muted">{questionIndex + 1}.</span>
                {item.q}
              </p>
              <div className="mt-2 space-y-1.5">
                {item.options.map(function (option, optionIndex) {
                  const isAnswer = optionIndex === item.answer;
                  const isPicked = selected === optionIndex;
                  let tone = "border-line bg-card2 text-muted hover:text-paper";
                  if (revealed && isAnswer) tone = "border-good/40 bg-good/10 text-good";
                  else if (revealed && isPicked) tone = "border-danger/40 bg-danger/10 text-danger";
                  else if (revealed) tone = "border-line/60 bg-card2/60 text-muted/70";

                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={revealed}
                      aria-pressed={isPicked}
                      onClick={function () {
                        choose(questionIndex, optionIndex);
                      }}
                      className={
                        "flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors disabled:cursor-default " +
                        tone
                      }
                    >
                      <span className="mono mt-0.5 text-[10px] opacity-60">
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      <span className="mono min-w-0 text-[11.5px] leading-[1.45]">{option}</span>
                      {revealed && isAnswer ? (
                        <Icon name="check" size={12} className="ml-auto mt-0.5 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {revealed ? (
                <p
                  className={
                    "mono mt-2 text-[10.5px] leading-[1.5] " +
                    (correct ? "text-good" : "text-muted")
                  }
                >
                  {correct ? "Correct. " : "Not quite. "}
                  {item.why}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {Object.keys(picked).length > 0 ? (
        <button
          type="button"
          onClick={reset}
          className="mono mt-3 text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-paper"
        >
          {answered ? "Try again" : "Reset answers"}
        </button>
      ) : null}
    </div>
  );
}
