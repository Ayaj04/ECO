"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView } from "framer-motion";
import { Pause, Play } from "lucide-react";
import clsx from "clsx";
import DottedGlobe from "@/components/ui/DottedGlobe";

const rkcaValues = [
  {
    letter: "R",
    title: "Responsibility",
    desc: "Unwavering ethical stewardship, transparency, and accountability across every jurisdiction.",
  },
  {
    letter: "K",
    title: "Knowledge",
    desc: "Deep multidisciplinary intelligence across finance, technology, compliance, and law.",
  },
  {
    letter: "C",
    title: "Commitment",
    desc: "Enduring partnership dedicated to navigating complex landscapes and building enterprise value.",
  },
  {
    letter: "A",
    title: "Acknowledgment",
    desc: "Respecting the uniqueness of each business challenge and driving shared, measurable success.",
  },
];

/** Time each value stays selected while the diagram cycles on its own. */
const AUTOPLAY_MS = 5600;

/*
 * Connector geometry, in SVG user units. The four nodes sit in a 4-column grid,
 * so their centres are at 12.5% / 37.5% / 62.5% / 87.5% of the width, which is
 * 125 / 375 / 625 / 875 on a 1000-wide canvas. All lines converge on the hub.
 */
const VB_W = 1000;
const VB_H = 240;
const HUB_X = VB_W / 2;
const NODE_X = [125, 375, 625, 875];

const connectorPaths = NODE_X.map((x) => {
  const dx = x - HUB_X;
  const outer = Math.abs(dx) > 300;
  const c1y = outer ? 96 : 120;
  const c2x = HUB_X + dx * (outer ? 0.34 : 0.16);
  const c2y = outer ? VB_H - 8 : VB_H - 78;
  return `M ${x} 0 C ${x} ${c1y}, ${c2x} ${c2y}, ${HUB_X} ${VB_H}`;
});

/** Stroke width is in user units, which get scaled with the SVG, so it shrinks less on small screens. */
const LINE_WIDTH = "[stroke-width:2.6px] sm:[stroke-width:2px] lg:[stroke-width:1.4px]";
const GLOW = "drop-shadow(0 0 5px rgba(225, 6, 0, 0.75))";
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Reads prefers-reduced-motion without a hydration mismatch: the server snapshot
 * is always false, so the first client render matches the server HTML and React
 * then switches to the real value.
 */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export default function RKCAGlobalSection() {
  const reduceMotion = usePrefersReducedMotion();
  const diagramRef = useRef<HTMLDivElement>(null);
  const revealed = useInView(diagramRef, { once: true, amount: 0.15 });
  const onScreen = useInView(diagramRef, { amount: 0.3 });

  const [active, setActive] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const running = autoplay && onScreen && !reduceMotion;

  // Cycle through the four values until the visitor takes over.
  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => {
      setActive((a) => (a + 1) % rkcaValues.length);
      setPulse((p) => p + 1);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [running, active, pulse]);

  const select = (index: number) => {
    setAutoplay(false);
    setActive(index);
    setPulse((p) => p + 1);
  };

  const drawIn = (i: number) =>
    reduceMotion ? { duration: 0 } : { duration: 1.5, delay: 0.25 + i * 0.12, ease: EASE_OUT };

  return (
    <section
      id="how-we-are"
      aria-labelledby="rkca-heading"
      className="relative w-full overflow-hidden bg-ecovis-black pb-20 pt-28 text-ecovis-white md:pb-28 md:pt-40"
    >
      {/* Ambient background: faint grid that fades out, plus a crimson wash at the top */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 55%, #000, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 35% at 50% 8%, rgba(225, 6, 0, 0.1), transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1920px] px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="mb-14 flex flex-col items-center text-center md:mb-20"
        >
          <span className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-ecovis-red md:text-sm">
            Global Vision · Unified Values
          </span>
          <h2
            id="rkca-heading"
            className="font-heading text-5xl font-bold uppercase leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Ideas without <br />
            <span className="text-ecovis-red">borders.</span>
          </h2>
          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-gray-400 md:text-lg">
            A global network built on four core commitments.
          </p>
        </motion.div>

        {/* Diagram */}
        <div ref={diagramRef} className="relative mx-auto w-full max-w-6xl">
          {/* Readout: every value is in the DOM, only the selected one is shown */}
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
            <div id="rkca-readout" aria-live={autoplay ? "off" : "polite"} className="grid">
              {rkcaValues.map((v, i) => {
                const on = i === active;
                return (
                  <div
                    key={v.letter}
                    aria-hidden={!on}
                    className={clsx(
                      "col-start-1 row-start-1 flex flex-col items-center transition-all duration-700 ease-out",
                      on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
                    )}
                  >
                    <span className="mb-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-ecovis-red md:text-xs">
                      <span className="tabular-nums">0{i + 1}</span>
                      <span className="h-px w-8 bg-ecovis-red/50" />
                      <span>{v.title}</span>
                    </span>
                    <p className="font-heading text-xl font-medium leading-snug text-white/95 md:text-2xl">
                      {v.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setAutoplay((a) => !a)}
                aria-label={autoplay ? "Pause automatic cycling" : "Resume automatic cycling"}
                data-cursor={autoplay ? "PAUSE" : "PLAY"}
                className="mt-6 inline-flex items-center gap-2 rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 outline-none transition-colors hover:text-white focus-visible:text-white focus-visible:ring-2 focus-visible:ring-ecovis-red/70"
              >
                {autoplay ? (
                  <Pause className="size-3 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="size-3 fill-current" aria-hidden="true" />
                )}
                {autoplay ? "Pause" : "Play"}
              </button>
            )}
          </div>

          {/* R K C A nodes */}
          <div role="group" aria-label="Core values" className="relative grid grid-cols-4">
            {rkcaValues.map((v, i) => {
              const isActive = i === active;
              const ringRunning = isActive && running;
              return (
                <button
                  key={v.letter}
                  type="button"
                  aria-pressed={isActive}
                  aria-controls="rkca-readout"
                  aria-label={v.title}
                  onClick={() => select(i)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse" && !isActive) select(i);
                  }}
                  data-cursor="VIEW"
                  className="group relative flex flex-col items-center gap-3 rounded-md pb-1 outline-none focus-visible:ring-2 focus-visible:ring-ecovis-red/70 focus-visible:ring-offset-4 focus-visible:ring-offset-ecovis-black md:gap-4"
                >
                  <span
                    className={clsx(
                      "relative grid size-14 place-items-center rounded-full border font-heading text-2xl font-bold transition-all duration-500 sm:size-16 md:size-[4.5rem] md:text-3xl",
                      isActive
                        ? "scale-105 border-ecovis-red bg-ecovis-red text-white shadow-[0_0_56px_rgba(225,6,0,0.5)]"
                        : "border-white/15 bg-white/[0.04] text-white/75 group-hover:border-ecovis-red/60 group-hover:text-white",
                    )}
                  >
                    {/* Track ring, plus a progress ring that fills while autoplay counts down */}
                    <svg
                      viewBox="0 0 100 100"
                      className="pointer-events-none absolute -inset-2 -rotate-90"
                      aria-hidden="true"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="rgba(225, 6, 0, 0.2)"
                        strokeWidth="1"
                      />
                      <motion.circle
                        key={isActive ? `on-${pulse}-${running}` : "off"}
                        cx="50"
                        cy="50"
                        r="48"
                        fill="none"
                        stroke="#E10600"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: ringRunning ? 0 : isActive ? 1 : 0 }}
                        animate={{ pathLength: isActive ? 1 : 0 }}
                        transition={
                          ringRunning
                            ? { duration: AUTOPLAY_MS / 1000, ease: "linear" }
                            : { duration: 0.5, ease: "easeOut" }
                        }
                      />
                    </svg>
                    {v.letter}
                  </span>

                  <span
                    className={clsx(
                      "hidden font-heading text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 sm:block md:text-xs",
                      isActive ? "text-white" : "text-white/45 group-hover:text-white/80",
                    )}
                  >
                    {v.title}
                  </span>

                  <span
                    aria-hidden="true"
                    className={clsx(
                      "block h-px bg-ecovis-red transition-all duration-500",
                      isActive ? "w-10" : "w-4 group-hover:w-7",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Lines converging on the hub */}
          <div className="relative h-[110px] w-full sm:h-[160px] md:h-[210px]">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="none"
              fill="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              {connectorPaths.map((d, i) => {
                const isActive = i === active;
                return (
                  <g key={d}>
                    <motion.path
                      d={d}
                      stroke="rgba(255, 255, 255, 0.16)"
                      className={LINE_WIDTH}
                      initial={false}
                      animate={{ pathLength: revealed ? 1 : 0 }}
                      transition={drawIn(i)}
                    />
                    <motion.path
                      d={d}
                      stroke="#E10600"
                      className={LINE_WIDTH}
                      style={{ filter: GLOW }}
                      initial={false}
                      animate={{ pathLength: revealed ? 1 : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ pathLength: drawIn(i), opacity: { duration: 0.45 } }}
                    />
                    {isActive && revealed && !reduceMotion && (
                      <path
                        key={`comet-${i}-${pulse}`}
                        d={d}
                        pathLength={1}
                        stroke="#FFFFFF"
                        strokeLinecap="round"
                        className={clsx(LINE_WIDTH, "rkca-comet")}
                        style={{ filter: GLOW }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hub */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-1/2 z-10 size-3.5 -translate-x-1/2 translate-y-1/2"
            >
              <span className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ecovis-red/40 [animation-duration:3s] motion-safe:animate-ping" />
              <span className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ecovis-red/15" />
              <span className="relative block size-3.5 rounded-full bg-ecovis-red shadow-[0_0_28px_8px_rgba(225,6,0,0.55)]" />
            </div>
          </div>

          {/* Line from the hub down to the globe */}
          <div
            aria-hidden="true"
            className="relative mx-auto h-12 w-px bg-gradient-to-b from-ecovis-red to-ecovis-red/40 sm:h-16 md:h-20"
          >
            {revealed && !reduceMotion && (
              <span
                key={`drop-${pulse}`}
                className="rkca-drop absolute left-1/2 h-6 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-white/70 to-white"
              />
            )}
            <span className="absolute -bottom-[3px] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-ecovis-red shadow-[0_0_12px_3px_rgba(225,6,0,0.7)]" />
          </div>

          {/* Globe */}
          <div className="relative mx-auto w-full max-w-[820px]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 aspect-square w-[132%] -translate-x-1/2 -translate-y-[12%] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(225,6,0,0) 0%, rgba(225,6,0,0) 68%, rgba(225,6,0,0.2) 76%, rgba(225,6,0,0.06) 88%, rgba(225,6,0,0) 100%)",
              }}
            />
            {revealed && !reduceMotion && (
              <div
                key={`flash-${pulse}`}
                aria-hidden="true"
                className="rkca-flash pointer-events-none absolute left-1/2 top-0 h-28 w-72 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(255,110,100,0.55), rgba(225,6,0,0.18) 55%, transparent 100%)",
                }}
              />
            )}
            {/* The lower part of the sphere fades into the section background */}
            <DottedGlobe
              pulseKey={pulse}
              className="aspect-[100/60] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_55%,transparent_100%)] [mask-image:linear-gradient(to_bottom,#000_0%,#000_55%,transparent_100%)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
