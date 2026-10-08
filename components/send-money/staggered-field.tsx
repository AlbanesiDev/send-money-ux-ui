"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const ENTER_MS = 320;
const EXIT_MS = 240;
const STAGGER_MS = 55;

export function StaggeredField({
  show,
  enterIndex,
  exitIndex,
  children,
}: {
  show: boolean;
  enterIndex: number;
  exitIndex: number;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(show);
  const [phase, setPhase] = useState<"enter" | "shown" | "exit">(
    show ? "enter" : "exit",
  );
  const [activeIndex, setActiveIndex] = useState(enterIndex);
  const wasShowing = useRef(show);

  useEffect(() => {
    if (show) {
      setActiveIndex(enterIndex);
      setMounted(true);
      setPhase("enter");
      wasShowing.current = true;
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setPhase("shown"));
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (wasShowing.current) {
      setActiveIndex(exitIndex);
      setPhase("exit");
      wasShowing.current = false;
      const timeout = window.setTimeout(
        () => setMounted(false),
        EXIT_MS + exitIndex * STAGGER_MS,
      );
      return () => window.clearTimeout(timeout);
    }

    setMounted(false);
  }, [show, enterIndex, exitIndex]);

  if (!mounted) return null;

  return (
    <div
      className="quote-field-motion"
      data-phase={phase}
      style={{
        transitionDelay: `${activeIndex * STAGGER_MS}ms`,
        transitionDuration: phase === "exit" ? `${EXIT_MS}ms` : `${ENTER_MS}ms`,
      }}
    >
      {children}
    </div>
  );
}
