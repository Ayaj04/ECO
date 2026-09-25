"use client";

import { useEffect, useRef } from "react";

/**
 * Serpentine scroll-progress line.
 *
 * Path layout (document coordinates):
 *   Logo → RIGHT edge  (horizontal, top of page 1)
 *   RIGHT edge → RIGHT edge bottom of page 1  (vertical, right side)
 *   RIGHT → LEFT at bottom of page 1 / top of page 2  (horizontal connector)
 *   LEFT → LEFT bottom of page 2  (vertical, left side)
 *   LEFT → RIGHT at top of page 3  (horizontal connector)
 *   … repeats until end of document
 *
 * The SVG is fixed/full-viewport. All document-space y-coordinates are
 * shifted by -scrollY so the path always appears in the right place.
 * Only the portion up to the current scroll position is drawn in red;
 * the rest shows as a subtle grey track.
 */

const STROKE = 4;          // px – "thick" line
const CORNER_R = 28;       // px – bezier corner radius for smooth turns
const PAD_LEFT  = 24;      // distance from left viewport edge
const PAD_RIGHT = 24;      // distance from right viewport edge

/** Top-right start point for the serpentine scroll line */
function getScrollLineAnchor(vw: number): [number, number] {
  return [vw - PAD_RIGHT, 0];
}

/** Build the full list of "key" points in document space. */
function buildDocumentPoints(
  vw: number,
  vh: number,
  docH: number,
  startX: number,
  startY: number,
) {
  const LEFT_GUTTER  = PAD_LEFT;
  const RIGHT_GUTTER = vw - PAD_RIGHT;

  const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));

  if (sections.length >= 3) {
    // 1. Starts directly below the Contact Us button
    const pts: [number, number][] = [
      [startX, startY],
    ];

    // Transition 1: Space between Hero and IntroSection (sweeps from button across to left margin)
    const introTop = sections[1].offsetTop;
    const t1 = Math.max(startY + 40, introTop - 28);
    pts.push([startX, t1]);
    pts.push([LEFT_GUTTER, t1]);

    // Current side is now LEFT (travels down past IntroSection AND ExpertiseSection safely on the left gutter)
    // This prevents cutting through interactive arrows on the right side of ExpertiseSection
    let currentSide: "RIGHT" | "LEFT" = "LEFT";

    for (let i = 3; i < sections.length; i++) {
      const section = sections[i];
      const prevY = pts[pts.length - 1][1];
      const transitionY = Math.round(section.offsetTop - 32);

      // Ensure generous spacing (at least 380px) between major crossovers for clean design rhythm
      if (transitionY <= prevY + 380) continue;

      const currentX: number = currentSide === "RIGHT" ? RIGHT_GUTTER : LEFT_GUTTER;
      const nextX: number    = currentSide === "RIGHT" ? LEFT_GUTTER : RIGHT_GUTTER;

      pts.push([currentX, transitionY]);
      pts.push([nextX, transitionY]);

      currentSide = currentSide === "RIGHT" ? "LEFT" : "RIGHT";
    }

    const finalX: number = currentSide === "RIGHT" ? RIGHT_GUTTER : LEFT_GUTTER;
    pts.push([finalX, docH]);

    return pts;
  }

  // Fallback if sections are not yet available in DOM
  const pts: [number, number][] = [
    [startX, startY],
  ];
  let y = vh;
  let side: "RIGHT" | "LEFT" = "RIGHT";
  while (y < docH) {
    const curX: number = side === "RIGHT" ? RIGHT_GUTTER : LEFT_GUTTER;
    const nxtX: number = side === "RIGHT" ? LEFT_GUTTER : RIGHT_GUTTER;
    pts.push([curX, y]);
    pts.push([nxtX, y]);
    side = side === "RIGHT" ? "LEFT" : "RIGHT";
    y += vh;
  }
  pts.push([side === "RIGHT" ? RIGHT_GUTTER : LEFT_GUTTER, docH]);
  return pts;
}

/**
 * Convert document-space points to an SVG path string with rounded corners.
 * Each "turn" (where direction changes) uses a short quadratic bezier.
 */
function pointsToPath(
  pts: [number, number][],
  scrollY: number,
  r: number
): string {
  if (pts.length < 2) return "";

  // Shift y by -scrollY for viewport-space
  const p = pts.map(([x, y]) => [x, y - scrollY] as [number, number]);

  let d = `M ${p[0][0]} ${p[0][1]}`;

  for (let i = 1; i < p.length; i++) {
    const prev = p[i - 1];
    const curr = p[i];
    const next = p[i + 1];

    if (!next) {
      // Last point — just line to it
      d += ` L ${curr[0]} ${curr[1]}`;
      continue;
    }

    // Direction vectors
    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    const cr = Math.min(r, len1 / 2, len2 / 2);

    // Approach point (before the corner)
    const ax = curr[0] - (dx1 / len1) * cr;
    const ay = curr[1] - (dy1 / len1) * cr;
    // Depart point (after the corner)
    const bx = curr[0] + (dx2 / len2) * cr;
    const by = curr[1] + (dy2 / len2) * cr;

    d += ` L ${ax} ${ay} Q ${curr[0]} ${curr[1]} ${bx} ${by}`;
  }

  return d;
}

/** Calculate how much path length to reveal so the line is fast and in sync with the user's mouse scroll. */
function getRevealedLength(
  pts: [number, number][],
  sy: number,
  vh: number,
  docH: number,
): number {
  if (pts.length < 2 || sy <= 0) return 0;

  // Cumulative distance along the path at each waypoint
  const cumLengths: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    cumLengths.push(cumLengths[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalLen = cumLengths[cumLengths.length - 1];

  // Check if Our People section is in the document to allow dedicated slower pacing
  const boardEl = typeof document !== "undefined" ? document.getElementById("our-board") : null;
  const boardTop = boardEl ? boardEl.offsetTop : -1;
  const boardBottom = boardEl ? boardTop + boardEl.offsetHeight : -1;

  // Distribute scroll triggers along the path so horizontal crossovers and vertical travel happen at a relaxed, elegant pace
  const targetScroll: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const isHorizontal = Math.abs(pts[i][1] - pts[i - 1][1]) < 2;
    const midY = (pts[i][1] + pts[i - 1][1]) / 2;
    const isBoard = boardTop > 0 && midY >= boardTop - 80 && midY <= boardBottom + 80;

    if (isHorizontal) {
      // Natural, smooth crossover duration (slower 640px for Our People, 320px elsewhere)
      const crossoverSpan = isBoard ? 640 : 320;
      targetScroll.push(targetScroll[i - 1] + crossoverSpan);
    } else {
      // Vertical segment: scaled by verticalDamper so vertical travel is noticeably slower and more relaxed
      const docDist = Math.max(1, pts[i][1] - pts[i - 1][1]);
      const verticalDamper = isBoard ? 2.2 : 1.45;
      const segmentSpan = docDist * verticalDamper;
      targetScroll.push(targetScroll[i - 1] + segmentSpan);
    }
  }

  const maxTargetScroll = targetScroll[targetScroll.length - 1] || 1;
  const maxSy = Math.max(1, docH - vh);

  // Calm, steady 1.0x scroll mapping so the line glides down at a controlled pace and never races ahead
  const scrollRatio = maxSy > 0 ? Math.min(1, Math.max(0, sy / maxSy)) : 0;
  const effectiveScroll = scrollRatio * maxTargetScroll;

  if (effectiveScroll >= maxTargetScroll) return totalLen;

  let idx = 0;
  while (idx < targetScroll.length - 1 && targetScroll[idx + 1] <= effectiveScroll) {
    idx++;
  }

  if (idx >= targetScroll.length - 1) return totalLen;

  const segmentScrollSpan = targetScroll[idx + 1] - targetScroll[idx];
  const t = segmentScrollSpan > 0 ? (effectiveScroll - targetScroll[idx]) / segmentScrollSpan : 0;
  const clampedT = Math.max(0, Math.min(1, t));

  return cumLengths[idx] + (cumLengths[idx + 1] - cumLengths[idx]) * clampedT;
}

/**
 * Build a partial polyline up to `targetLen` and convert it to a path string.
 * Returns the path string AND the endpoint [x, y] in viewport space.
 */
function buildPartialPath(
  pts: [number, number][],
  targetLen: number,
  scrollY: number,
  r: number
): { d: string; tip: [number, number] | null } {
  if (pts.length < 2 || targetLen <= 0) return { d: "", tip: null };

  let remaining = targetLen;
  const partial: [number, number][] = [pts[0]];
  let tip: [number, number] = [pts[0][0], pts[0][1]];

  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (remaining <= 0) break;

    if (remaining >= segLen) {
      partial.push(pts[i]);
      tip = pts[i];
      remaining -= segLen;
    } else {
      const t = remaining / segLen;
      const x = pts[i - 1][0] + dx * t;
      const y = pts[i - 1][1] + dy * t;
      partial.push([x, y]);
      tip = [x, y];
      remaining = 0;
      break;
    }
  }

  const d = pointsToPath(partial, scrollY, r);
  const tipViewport: [number, number] = [tip[0], tip[1] - scrollY];
  return { d, tip: tipViewport };
}

export default function ScrollLine() {
  const lineRef      = useRef<SVGPathElement>(null);
  const dotRef       = useRef<SVGCircleElement>(null);
  const glowRef      = useRef<SVGCircleElement>(null);
  const leftClipRef  = useRef<SVGRectElement>(null);
  const rightClipRef = useRef<SVGRectElement>(null);
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const render = () => {
      const vw    = window.innerWidth;
      const vh    = window.innerHeight;
      const docH  = document.documentElement.scrollHeight;
      const sy    = window.scrollY;
      const maxSy = docH - vh;
      const frac  = maxSy > 0 ? Math.min(sy / maxSy, 1) : 0;

      // Start from the top right gutter
      const [startX, startY] = getScrollLineAnchor(vw);
      const pts         = buildDocumentPoints(vw, vh, docH, startX, startY);
      const revealedLen = getRevealedLength(pts, sy, vh, docH);

      // Clip path: line is visible across the viewport
      if (leftClipRef.current) {
        leftClipRef.current.setAttribute("x", "0");
        leftClipRef.current.setAttribute("y", "0");
        leftClipRef.current.setAttribute("width", String(vw));
        leftClipRef.current.setAttribute("height", String(vh));
      }
      if (rightClipRef.current) {
        rightClipRef.current.setAttribute("x", "0");
        rightClipRef.current.setAttribute("y", "0");
        rightClipRef.current.setAttribute("width", String(vw));
        rightClipRef.current.setAttribute("height", String(vh));
      }

      // Red revealed portion + dot
      const { d: partialD, tip } = buildPartialPath(pts, revealedLen, sy, CORNER_R);
      if (lineRef.current) {
        lineRef.current.setAttribute("d", partialD);
      }
      if (tip && dotRef.current && glowRef.current) {
        dotRef.current.setAttribute("cx", String(tip[0]));
        dotRef.current.setAttribute("cy", String(tip[1]));
        glowRef.current.setAttribute("cx", String(tip[0]));
        glowRef.current.setAttribute("cy", String(tip[1]));
        dotRef.current.setAttribute("opacity", frac > 0 ? "1" : "0");
        glowRef.current.setAttribute("opacity", frac > 0 ? "1" : "0");
      }

      rafRef.current = 0;
    };

    const schedule = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(render);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    render();

    // Re-sample anchor as CallButton animates in and settles
    const t1 = setTimeout(schedule, 300);
    const t2 = setTimeout(schedule, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-visible"
      style={{ width: "100vw", height: "100vh" }}
    >
      <defs>
        {/* Glow filter for the dot */}
        <filter id="scrollLineGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip path: guarantees no line or glow is EVER rendered above the Contact Us button on the right */}
        <clipPath id="scrollLineClip">
          <rect ref={leftClipRef} x="0" y="0" width="100%" height="100%" />
          <rect ref={rightClipRef} x="0" y="0" width="100%" height="100%" />
        </clipPath>
      </defs>

      <g clipPath="url(#scrollLineClip)">
        {/* Brand-red revealed portion */}
        <path
          ref={lineRef}
          fill="none"
          stroke="#c8102e"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Outer glow ring */}
        <circle
          ref={glowRef}
          r={10}
          fill="rgba(200,16,46,0.25)"
          filter="url(#scrollLineGlow)"
          opacity={0}
        />

        {/* Solid dot at tip */}
        <circle
          ref={dotRef}
          r={5}
          fill="#c8102e"
          opacity={0}
        />
      </g>
    </svg>
  );
}
