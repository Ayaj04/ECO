"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { buildRibbon, type RibbonGeometry } from "./rkcaRibbon";
import { MAP_ARCS } from "./mapArcs";

const values = [
  { letter: "R", title: "Responsibility", side: "right" },
  { letter: "K", title: "Knowledge", side: "left" },
  { letter: "C", title: "Commitment", side: "right" },
  { letter: "A", title: "Accountability", side: "left" },
] as const;

/**
 * The world map artwork is 1774 x 887. These are positions inside it, in percent:
 * the hub the ribbon lands on (India) and the other city points. The arcs between
 * them are in mapArcs.ts, in the artwork's own units.
 */
const MAP = {
  width: 1774,
  height: 887,
  hub: { x: 65.44, y: 47.46 },
  dots: [
    { x: 18.15, y: 41.49 },
    { x: 42.11, y: 32.64 },
    { x: 57.27, y: 39.46 },
    { x: 57.33, y: 46.34 },
    { x: 49.04, y: 68.09 },
    { x: 84.39, y: 45.1 },
    { x: 85.91, y: 82.87 },
  ],
} as const;

/**
 * The map always fills the screen edge to edge. On screens narrower than the minimum it is kept at
 * that width and shifted so the hub stays in the middle, so it never shrinks to something unreadable.
 */
const MAP_WIDTH = "max(100%, 720px)";
const MAP_LEFT = `clamp(calc(100% - ${MAP_WIDTH}), calc(50% - ${MAP.hub.x / 100} * ${MAP_WIDTH}), 0px)`;

/** The map starts this far above the bottom of the diagram, so the ribbon has less distance to cover. */
const MAP_OVERLAP = "clamp(48px, 7vw, 150px)";

/** The artwork has empty space under the map. Pull the next section up into it. */
const MAP_TRIM = "clamp(20px, 4vw, 90px)";

/**
 * Layout scale (--k) and the sizes derived from it. Everything is CSS, so the
 * server and browser agree on first paint. The ribbon is then fitted to the
 * measured positions of the nodes and of the hub. How far the nodes swing out
 * to the sides (--amp) is set in globals.css.
 */
const STAGE_STYLE = {
  "--row": "max(104px, calc(132px * var(--k)))",
  "--top": "max(84px, calc(112px * var(--k)))",
  "--node": "max(44px, calc(84px * var(--k)))",
  "--gap": "max(6px, calc(13px * var(--k)))",
} as React.CSSProperties;

/**
 * On wide screens each label sits outside its node, towards the edge of the screen. Below that
 * there is no room out there, so it tucks in on the side that faces the middle.
 */
const LABEL = {
  right: {
    box: "right-[calc(100%_+_var(--gap))] min-[1000px]:right-auto min-[1000px]:left-[calc(100%_+_var(--gap))]",
    row: "flex-row-reverse min-[1000px]:flex-row",
    line: "-scale-x-100 min-[1000px]:scale-x-100",
  },
  left: {
    box: "left-[calc(100%_+_var(--gap))] min-[1000px]:left-auto min-[1000px]:right-[calc(100%_+_var(--gap))]",
    row: "flex-row min-[1000px]:flex-row-reverse",
    line: "min-[1000px]:-scale-x-100",
  },
} as const;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Fade the ribbon in at the top, under the heading. */
const RIBBON_FADE = "linear-gradient(to bottom, transparent 0px, #000 56px)";

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
  const uid = useId().replace(/:/g, "");

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [geo, setGeo] = useState<RibbonGeometry | null>(null);
  const [mapScale, setMapScale] = useState(0.8);
  const [reached, setReached] = useState(0);
  const [landed, setLanded] = useState(false);

  // Scroll drives how much of the ribbon is drawn. The track spans the ribbon's full height,
  // from the top of the stage down to the hub, so the tip stays near the same spot on screen.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 76%", "end 64%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.35 });
  const progress = useTransform(smooth, (v) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0));

  // How much of the ribbon's length is drawn. It follows how far down the page the reader has got,
  // so the tip keeps pace with the scroll even while it sweeps sideways.
  const drawn = useMotionValue(0);

  const sync = useCallback(
    (p: number, g: RibbonGeometry) => {
      drawn.set(g.lengthAt(p));
      setReached(g.fractions.filter((f) => p >= f - 0.012).length);
      setLanded(p >= 0.985);
    },
    [drawn],
  );

  useMotionValueEvent(progress, "change", (p) => {
    if (geo) sync(p, geo);
  });

  // Fit the ribbon to the real node and hub positions, and refit when the layout changes size.
  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const map = mapRef.current;
    if (!section || !stage || !map) return;

    const measure = () => {
      const end = endRef.current;
      const els = nodeRefs.current;
      if (!end || els.length < values.length || els.some((el) => !el)) return;

      const secRect = section.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      const k = parseFloat(getComputedStyle(stage).getPropertyValue("--k")) || 1;
      const nodes = els.map((el) => {
        const r = el!.getBoundingClientRect();
        return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top };
      });
      const er = end.getBoundingClientRect();

      const next = buildRibbon({
        width: sr.width,
        viewX: secRect.left - sr.left,
        viewW: secRect.width,
        k,
        nodes,
        end: { x: er.left - sr.left, y: er.top - sr.top },
      });
      setGeo(next);
      setMapScale(map.offsetWidth / MAP.width);
      sync(progress.get(), next);
    };

    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(stage);
    observer.observe(map);
    return () => observer.disconnect();
  }, [progress, sync]);

  // With reduced motion everything is simply shown, drawn and landed.
  const shownReached = reduceMotion ? values.length : reached;
  const isLanded = reduceMotion || landed;

  // The map is revealed outward from the hub once the ribbon lands there.
  const reveal = useMotionValue(0);
  useEffect(() => {
    const controls = animate(reveal, isLanded ? 1 : 0, {
      duration: reduceMotion ? 0 : isLanded ? 2.4 : 0.7,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [isLanded, reduceMotion, reveal]);

  const maskImage = useTransform(reveal, (t) => {
    const w = mapRef.current?.offsetWidth ?? 1400;
    const r = t * w * 1.05;
    return `radial-gradient(circle at ${MAP.hub.x}% ${MAP.hub.y}%, #000 ${r * 0.7}px, transparent ${r}px)`;
  });

  // The arcs draw outward from the hub while the map appears; the city points light up as they arrive.
  const arcProgress = useTransform(reveal, [0.08, 0.85], [0, 1]);
  const dotOpacity = useTransform(reveal, [0.5, 0.9], [0, 1]);
  const hubOpacity = useTransform(reveal, [0, 0.12], [0, 1]);
  const cometOpacity = useTransform(reveal, [0.85, 1], [0, 1]);

  const px = (n: number) => n / mapScale;

  return (
    <section
      ref={sectionRef}
      id="who-we-are"
      aria-labelledby="rkca-heading"
      className="relative w-full overflow-hidden bg-white pt-24 text-ecovis-black md:pt-32"
    >
      <div className="relative z-10 mx-auto max-w-[1920px] px-4 sm:px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          className="mb-8 flex flex-col items-center text-center md:mb-10"
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
          <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-gray-500 md:text-lg">
            A global network built on four core commitments.
          </p>
        </motion.div>

        {/* Ribbon and nodes */}
        <div
          ref={stageRef}
          style={STAGE_STYLE}
          className="rkca-stage relative mx-auto w-full max-w-[1600px] [--k:0.5] sm:[--k:0.7] md:[--k:0.85] min-[1200px]:[--k:1]"
        >
          <div
            ref={trackRef}
            data-rkca-track=""
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 w-px"
            style={{ height: geo ? Math.max(1, geo.height - 24) : 1 }}
          />

          {geo && (
            <svg
              aria-hidden="true"
              width={geo.viewW}
              height={geo.height}
              viewBox={`${geo.viewX} 0 ${geo.viewW} ${geo.height}`}
              className="pointer-events-none absolute top-0 z-[5] overflow-visible"
              style={{ left: geo.viewX, maskImage: RIBBON_FADE, WebkitMaskImage: RIBBON_FADE }}
            >
              <defs>
                <linearGradient id={`${uid}-fill`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#c50912" />
                  <stop offset="0.5" stopColor="#ee0d12" />
                  <stop offset="1" stopColor="#ff3d3a" />
                </linearGradient>
                <mask
                  id={`${uid}-reveal`}
                  maskUnits="userSpaceOnUse"
                  x={geo.viewX - 60}
                  y={-40}
                  width={geo.viewW + 120}
                  height={geo.height + 80}
                >
                  <motion.path d={geo.line} fill="none" stroke="#fff" strokeWidth={34 * geo.scale} strokeLinejoin="round" style={{ pathLength: reduceMotion ? 1 : drawn }} />
                </mask>
              </defs>

              <g mask={`url(#${uid}-reveal)`}>
                {/* Soft glow, made from two wide translucent strokes */}
                <path d={geo.line} fill="none" stroke="#e10600" strokeOpacity={0.035} strokeWidth={22 * geo.scale} strokeLinejoin="round" />
                <path d={geo.line} fill="none" stroke="#e10600" strokeOpacity={0.08} strokeWidth={9 * geo.scale} strokeLinejoin="round" />
                <path d={geo.shape} fill={`url(#${uid}-fill)`} />
              </g>
            </svg>
          )}

          <ol
            role="list"
            className="relative z-10 m-0 list-none p-0"
            style={{ paddingTop: "calc(var(--top) - var(--row) / 2)" }}
          >
            {values.map((v, i) => {
              const on = shownReached > i;
              const dir = v.side === "right" ? 1 : -1;
              const label = LABEL[v.side];

              return (
                <li key={v.letter} className="relative" style={{ height: "var(--row)" }}>
                  <div
                    ref={(el) => {
                      nodeRefs.current[i] = el;
                    }}
                    className="absolute"
                    style={{
                      top: "50%",
                      left: `calc(50% + ${dir} * var(--amp))`,
                      width: "var(--node)",
                      height: "var(--node)",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 18 }}
                    >
                      <div className="rkca-node grid h-full w-full place-items-center rounded-full">
                        <span
                          aria-hidden="true"
                          className="font-heading font-bold leading-none text-ecovis-red"
                          style={{ fontSize: "max(22px, calc(40px * var(--k)))" }}
                        >
                          {v.letter}
                        </span>
                      </div>
                    </motion.div>

                    <div className={clsx("absolute top-1/2 -translate-y-1/2", label.box)}>
                      <motion.div
                        className={clsx("flex items-center", label.row)}
                        initial={{ opacity: 0, x: dir * 14 }}
                        animate={on ? { opacity: 1, x: 0 } : { opacity: 0, x: dir * 14 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.12, ease: EASE_OUT }}
                      >
                        <span aria-hidden="true" className="block size-[5px] shrink-0 rounded-full bg-ecovis-red" />
                        <span
                          aria-hidden="true"
                          className={clsx("block h-px shrink-0", label.line)}
                          style={{
                            width: "max(16px, calc(52px * var(--k)))",
                            background: "linear-gradient(to right, rgba(225,6,0,0.75), rgba(225,6,0,0.22))",
                          }}
                        />
                        <span aria-hidden="true" className="block shrink-0" style={{ width: "var(--gap)" }} />
                        <span
                          className="whitespace-nowrap font-sans font-medium text-ecovis-black"
                          style={{
                            fontSize: "max(12px, calc(21px * var(--k)))",
                            letterSpacing: "max(0.04em, calc(0.1em * var(--k)))",
                          }}
                        >
                          {v.title}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* World map, edge to edge. It is revealed outward from the hub once the ribbon lands there. */}
      <div
        className="relative w-full overflow-hidden"
        style={{ marginTop: `calc(-1 * ${MAP_OVERLAP})`, marginBottom: `calc(-1 * ${MAP_TRIM})` }}
      >
        <div
          ref={mapRef}
          className="relative"
          style={{ width: MAP_WIDTH, left: MAP_LEFT, aspectRatio: `${MAP.width} / ${MAP.height}` }}
        >
          <span
            ref={endRef}
            aria-hidden="true"
            className="absolute size-0"
            style={{ left: `${MAP.hub.x}%`, top: `${MAP.hub.y}%` }}
          />

          {/* The map itself: grey land on a white sea, multiplied onto the page */}
          <motion.div
            className="absolute inset-0"
            style={{ maskImage, WebkitMaskImage: maskImage, mixBlendMode: "multiply" }}
          >
            <Image
              src="/images/rkca-map.webp"
              alt="A grey world map with red lines running from India to cities across the world."
              width={MAP.width}
              height={MAP.height}
              unoptimized
              loading="eager"
              draggable={false}
              className="h-full w-full select-none"
            />
          </motion.div>

          {/* Arcs, city points and the hub, drawn in red on top of the map */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ maskImage, WebkitMaskImage: maskImage }}
          >
            <svg
              viewBox={`0 0 ${MAP.width} ${MAP.height}`}
              preserveAspectRatio="none"
              fill="none"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              {Object.entries(MAP_ARCS).map(([name, d], n) => (
                <g key={name}>
                  <motion.path d={d} stroke="#e10600" strokeOpacity={0.16} strokeWidth={px(7)} strokeLinecap="round" style={{ pathLength: arcProgress }} />
                  <motion.path d={d} stroke="#f0281c" strokeWidth={px(1.8)} strokeLinecap="round" style={{ pathLength: arcProgress }} />
                  <motion.g style={{ opacity: cometOpacity }}>
                    <path
                      d={d}
                      pathLength={1}
                      stroke="#ff6a5c"
                      strokeWidth={px(3)}
                      strokeLinecap="round"
                      className="rkca-arc-comet"
                      style={{ animationDelay: `${(n * 0.75).toFixed(2)}s` }}
                    />
                  </motion.g>
                </g>
              ))}
            </svg>

            {/* Ripples spreading from the hub */}
            {[0, 1, 2].map((n) => (
              <span
                key={n}
                className="rkca-ripple pointer-events-none absolute rounded-[50%] border border-ecovis-red/50"
                style={{
                  left: `${MAP.hub.x}%`,
                  top: `${MAP.hub.y}%`,
                  width: "44%",
                  aspectRatio: "2 / 1",
                  animationDelay: `${n * 1.2}s`,
                }}
              />
            ))}

            {/* The hub: a small warm glow and a white-hot point */}
            <motion.span
              className="absolute"
              style={{ left: `${MAP.hub.x}%`, top: `${MAP.hub.y}%`, opacity: hubOpacity }}
            >
              <span
                className="rkca-glow absolute left-0 top-0 rounded-full"
                style={{
                  width: "clamp(70px, 6.5vw, 170px)",
                  aspectRatio: "1",
                  background:
                    "radial-gradient(closest-side, rgba(255,70,60,0.4), rgba(225,6,0,0.12) 55%, transparent 100%)",
                }}
              />
              <span
                className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: "clamp(10px, 0.8vw, 16px)",
                  aspectRatio: "1",
                  background: "radial-gradient(circle, #fff 0 32%, #ff3327 42% 100%)",
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.9), 0 0 16px 5px rgba(225,6,0,0.55)",
                }}
              />
            </motion.span>

            {/* City points */}
            {MAP.dots.map((d, n) => (
              <motion.span
                key={n}
                className="absolute"
                style={{ left: `${d.x}%`, top: `${d.y}%`, opacity: dotOpacity }}
              >
                <span
                  className="rkca-dot-ping absolute left-0 top-0 rounded-full border border-ecovis-red/70"
                  style={{
                    width: "clamp(11px, 0.95vw, 20px)",
                    aspectRatio: "1",
                    animationDelay: `${(n * 0.55).toFixed(2)}s`,
                  }}
                />
                <span
                  className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: "clamp(6px, 0.5vw, 10px)",
                    aspectRatio: "1",
                    background: "#f0281c",
                    boxShadow: "0 0 0 1.5px rgba(255,255,255,0.95), 0 0 12px 3px rgba(225,6,0,0.5)",
                  }}
                />
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
