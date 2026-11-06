import { useEffect, useRef, useState } from "react";

// Site-styled hover/focus tooltip. The bubble uses fixed positioning
// computed from the trigger's rect so it escapes overflow-hidden ancestors
// (code blocks clip absolutely-positioned children), and flips below the
// trigger when there is no room above. Screen readers keep using the
// trigger's own aria-label; this bubble is the visual layer.
export default function Tooltip({ label, children }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const timerRef = useRef(null);
  const triggerRef = useRef(null);

  function openTooltip() {
    const node = triggerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setPos({
      top: rect.top < 64 ? rect.bottom + 8 : rect.top - 8,
      left: rect.left + rect.width / 2,
      below: rect.top < 64,
    });
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(function () {
      setOpen(true);
    }, 350);
  }

  function closeTooltip() {
    window.clearTimeout(timerRef.current);
    setOpen(false);
  }

  useEffect(function () {
    return function () {
      window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(function () {
    if (!open) return undefined;
    function onScroll() {
      setOpen(false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return function () {
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={openTooltip}
      onMouseLeave={closeTooltip}
      onFocus={openTooltip}
      onBlur={closeTooltip}
      onKeyDown={function (event) {
        if (event.key === "Escape") closeTooltip();
      }}
    >
      {children}
      {open && pos ? (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-[70] whitespace-nowrap rounded-md border border-line bg-ink px-2 py-1 shadow-lg mono text-[10px] leading-[1.4] text-paper"
          style={
            pos.below
              ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
              : { top: pos.top, left: pos.left, transform: "translate(-50%, -100%)" }
          }
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
