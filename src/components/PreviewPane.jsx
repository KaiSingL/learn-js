import { useEffect, useRef } from "react";
import { runInIframe } from "../lib/sandbox.js";

export default function PreviewPane({
  code,
  html,
  runSignal,
  onEvent,
  height = 260,
  placeholder = "Run the code to see the preview.",
}) {
  const hostRef = useRef(null);
  const runnerRef = useRef(null);
  const codeRef = useRef(code);
  const htmlRef = useRef(html);
  const eventRef = useRef(onEvent);

  codeRef.current = code;
  htmlRef.current = html;
  eventRef.current = onEvent;

  useEffect(
    function () {
      if (!runSignal) return undefined;

      if (runnerRef.current) {
        runnerRef.current.destroy();
        runnerRef.current = null;
      }
      if (!hostRef.current) return undefined;

      runnerRef.current = runInIframe({
        code: codeRef.current,
        html: htmlRef.current,
        container: hostRef.current,
        onEvent: function (event) {
          if (eventRef.current) eventRef.current(event);
        },
      });

      return function () {
        if (runnerRef.current) {
          runnerRef.current.destroy();
          runnerRef.current = null;
        }
      };
    },
    [runSignal]
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-md border border-line bg-ink"
      style={{ height }}
    >
      <div ref={hostRef} className="h-full w-full" />
      {!runSignal ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
          <p className="mono max-w-[34ch] text-center text-[11px] leading-[1.5] text-muted">
            {placeholder}
          </p>
        </div>
      ) : null}
    </div>
  );
}
