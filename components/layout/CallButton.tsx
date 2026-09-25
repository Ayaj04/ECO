"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

/** The button appears floating at the bottom right shortly after page load. */
const READY_AFTER_MS = 900;
/** Once, shortly after that, it opens to show its name, so its purpose is clear on touch screens. */
const PEEK_AFTER_MS = 1800;
const PEEK_FOR_MS = 2800;

interface CallButtonProps {
  /** Opens the contact form. */
  onOpen: () => void;
  /** Fades the button away if needed. */
  dimmed?: boolean;
}

/**
 * Floating contact/message button at the bottom-right of the screen.
 * On hover or focus the ring stretches out to spell "Contact Us".
 */
export default function CallButton({ onOpen, dimmed = false }: CallButtonProps) {
  const [ready, setReady] = useState(false);
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = [window.setTimeout(() => setReady(true), READY_AFTER_MS)];
    if (!reduce) {
      timers.push(window.setTimeout(() => setPeek(true), PEEK_AFTER_MS));
      timers.push(window.setTimeout(() => setPeek(false), PEEK_AFTER_MS + PEEK_FOR_MS));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const shown = ready && !dimmed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.85 }}
      transition={shown ? { type: "spring", stiffness: 260, damping: 20 } : { duration: 0.15 }}
      style={{ pointerEvents: shown ? "auto" : "none" }}
      className="relative z-10"
    >
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label="Contact us"
        data-peek={peek}
        data-cursor="CONTACT"
        className="group relative flex items-center rounded-full p-1 text-white shadow-[0_14px_30px_-10px_rgba(225,6,0,0.65)] transition-[box-shadow,scale] duration-300 hover:shadow-[0_18px_38px_-10px_rgba(225,6,0,0.85)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ecovis-red active:scale-95"
        style={{ background: "linear-gradient(135deg, #e10600 0%, #a80510 100%)" }}
      >
        <span
          aria-hidden="true"
          className="call-ripple pointer-events-none absolute inset-0 rounded-full border-2 border-ecovis-red/55 transition-opacity duration-300 group-hover:opacity-0"
        />
        <span
          aria-hidden="true"
          className="call-ripple pointer-events-none absolute inset-0 rounded-full border-2 border-ecovis-red/55 transition-opacity duration-300 [animation-delay:1.3s] group-hover:opacity-0"
        />

        {/* The name, hidden until the button opens */}
        <span
          aria-hidden="true"
          className="relative z-10 max-w-0 overflow-hidden opacity-0 transition-[max-width,opacity] duration-500 ease-out group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100 group-data-[peek=true]:max-w-40 group-data-[peek=true]:opacity-100"
        >
          <span className="block whitespace-nowrap pl-4 pr-2.5 font-heading text-[11px] font-bold uppercase tracking-widest">
            Contact Us
          </span>
        </span>

        <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-white shadow-[inset_0_-2px_6px_rgba(0,0,0,0.08)] md:size-12">
          <MessageSquare className="size-5 md:size-6 text-ecovis-red fill-ecovis-red transition-transform duration-300 group-hover:scale-110" />
        </span>
      </button>
    </motion.div>
  );
}
