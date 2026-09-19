"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import {
  LAND_MASK_B64,
  LAND_MASK_HEIGHT,
  LAND_MASK_WIDTH,
} from "./globe-land-mask";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Points on the full sphere. Dot spacing scales with the globe, so density is constant. */
const SPHERE_POINTS = 40000;
/** Only 1 in N ocean points is drawn, as faint "dust" that keeps the silhouette readable. */
const OCEAN_KEEP_EVERY = 3;

const START_LON = 18 * DEG;
const START_TILT = 22 * DEG;
const MIN_TILT = -0.12;
const MAX_TILT = 0.85;
/** rad/s. Negative: the surface drifts west to east, like the real Earth seen from above. */
const AUTO_SPEED = -0.055;
const MAX_DPR = 2;

const RED = "225, 6, 0";

/** Land dot colours from the limb (red) to the centre (near white). */
const LAND_COLORS = [
  `rgba(${RED}, 0.4)`,
  "rgba(236, 96, 86, 0.5)",
  "rgba(226, 196, 190, 0.62)",
  "rgba(233, 229, 225, 0.8)",
  "rgba(245, 245, 243, 0.95)",
];

/**
 * Decorative network nodes. Positions are only approximate spots on land and
 * do not represent real office locations.
 */
const NODES: ReadonlyArray<{ lat: number; lon: number }> = [
  { lat: 39, lon: -98 }, // North America
  { lat: -9, lon: -58 }, // South America
  { lat: 50, lon: 9 }, // Europe
  { lat: 8, lon: 38 }, // East Africa
  { lat: 25, lon: 47 }, // Middle East
  { lat: 21, lon: 78 }, // South Asia
  { lat: 34, lon: 110 }, // East Asia
  { lat: -26, lon: 134 }, // Australia
];

const ARCS: ReadonlyArray<readonly [number, number]> = [
  [0, 2],
  [2, 3],
  [2, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [1, 3],
  [0, 1],
  [3, 5],
];

const ARC_SEGMENTS = 56;
const TRAIL = 7;

/* -------------------------------------------------------------------------- */
/*  Static geometry (pure maths, safe to compute at module load)              */
/* -------------------------------------------------------------------------- */

function toVec(lat: number, lon: number): [number, number, number] {
  const phi = lat * DEG;
  const lam = lon * DEG;
  const c = Math.cos(phi);
  return [c * Math.sin(lam), Math.sin(phi), c * Math.cos(lam)];
}

const NODE_VECS = NODES.map((n) => toVec(n.lat, n.lon));

/** Great-circle arcs lifted above the surface, sampled as flat xyz triples. */
const ARC_GEOMS = ARCS.map(([a, b]) => {
  const A = NODE_VECS[a];
  const B = NODE_VECS[b];
  const dot = Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  const omega = Math.acos(dot);
  const sinO = Math.sin(omega);
  const lift = 0.05 + 0.2 * (omega / Math.PI);
  const pts = new Float32Array((ARC_SEGMENTS + 1) * 3);
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const s1 = Math.sin((1 - t) * omega) / sinO;
    const s2 = Math.sin(t * omega) / sinO;
    const r = 1 + lift * Math.sin(Math.PI * t);
    pts[i * 3] = (A[0] * s1 + B[0] * s2) * r;
    pts[i * 3 + 1] = (A[1] * s1 + B[1] * s2) * r;
    pts[i * 3 + 2] = (A[2] * s1 + B[2] * s2) * r;
  }
  return pts;
});

/** Land / ocean point clouds, built once on first use (client only). */
let pointCache: { land: Float32Array; ocean: Float32Array } | null = null;

function getPoints() {
  if (pointCache) return pointCache;

  const bin = atob(LAND_MASK_B64);
  const bits = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);

  const isLand = (lonDeg: number, latDeg: number) => {
    const col = Math.min(LAND_MASK_WIDTH - 1, Math.max(0, Math.floor(lonDeg + 180)));
    const row = Math.min(LAND_MASK_HEIGHT - 1, Math.max(0, Math.floor(90 - latDeg)));
    const idx = row * LAND_MASK_WIDTH + col;
    return (bits[idx >> 3] & (1 << (idx & 7))) !== 0;
  };

  const land: number[] = [];
  const ocean: number[] = [];
  let oceanSeen = 0;

  // Fibonacci lattice: near-uniform points on a sphere.
  for (let i = 0; i < SPHERE_POINTS; i++) {
    const y = 1 - (2 * (i + 0.5)) / SPHERE_POINTS;
    const r = Math.sqrt(1 - y * y);
    const theta = i * GOLDEN_ANGLE;
    const x = r * Math.sin(theta);
    const z = r * Math.cos(theta);
    const lat = Math.asin(y) / DEG;
    const lon = Math.atan2(x, z) / DEG;

    if (isLand(lon, lat)) land.push(x, y, z);
    else if (oceanSeen++ % OCEAN_KEEP_EVERY === 0) ocean.push(x, y, z);
  }

  pointCache = { land: new Float32Array(land), ocean: new Float32Array(ocean) };
  return pointCache;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

interface DottedGlobeProps {
  /** Change this value to send a brief pulse of energy across the network arcs. */
  pulseKey?: number;
  className?: string;
}

/**
 * Interactive dotted globe drawn on a canvas.
 * Fills its container width and shows the top of the sphere; the parent decides
 * how much of it is visible via its height (and can fade the bottom with a mask).
 * Drag to rotate. Pauses when off-screen and honours prefers-reduced-motion.
 */
export default function DottedGlobe({ pulseKey = 0, className }: DottedGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boostRef = useRef(1);

  useEffect(() => {
    boostRef.current = 1;
  }, [pulseKey]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const { land, ocean } = getPoints();

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reduceQuery.matches;

    // View state
    let w = 1;
    let h = 1;
    let yaw = START_LON;
    let tilt = START_TILT;
    let vel = reduce ? 0 : AUTO_SPEED;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let visible = false;
    let raf = 0;
    let prevNow = 0;

    // Per-frame projection state
    let R = 1;
    let cx = 0;
    let cy = 0;
    let cyw = 1;
    let syw = 0;
    let ct = 1;
    let st = 0;
    const P = { sx: 0, sy: 0, z: 0, ex: 0, ey: 0 };

    /** Orthographic projection of a unit-sphere point (or lifted arc point) into P. */
    const proj = (x: number, y: number, z: number) => {
      const x1 = x * cyw - z * syw;
      const z1 = x * syw + z * cyw;
      const y2 = y * ct - z1 * st;
      P.z = y * st + z1 * ct;
      P.ex = x1;
      P.ey = y2;
      P.sx = cx + x1 * R;
      P.sy = cy - y2 * R;
    };

    /** A lifted point is hidden when it sits behind the silhouette of the sphere. */
    const occluded = () => P.z < 0 && P.ex * P.ex + P.ey * P.ey < 1;

    const draw = (t: number) => {
      R = w / 2 - 1;
      cx = w / 2;
      cy = R + 1;
      cyw = Math.cos(yaw);
      syw = Math.sin(yaw);
      ct = Math.cos(tilt);
      st = Math.sin(tilt);
      const boost = reduce ? 0 : boostRef.current;

      ctx.clearRect(0, 0, w, h);

      // Sphere body, atmosphere and rim
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      const body = ctx.createRadialGradient(cx, cy - R * 0.4, R * 0.05, cx, cy, R);
      body.addColorStop(0, "#1b1b1b");
      body.addColorStop(0.6, "#0c0c0c");
      body.addColorStop(1, "#050505");
      ctx.fillStyle = body;
      ctx.fill();

      const rim = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
      rim.addColorStop(0, `rgba(${RED}, 0)`);
      rim.addColorStop(1, `rgba(${RED}, ${0.32 + boost * 0.22})`);
      ctx.fillStyle = rim;
      ctx.fill();

      ctx.lineWidth = 1.25;
      ctx.strokeStyle = `rgba(${RED}, ${0.7 + boost * 0.3})`;
      ctx.stroke();

      // Ocean dust
      const dust = new Path2D();
      const s = Math.max(0.55, R * 0.0024);
      for (let i = 0; i < ocean.length; i += 3) {
        proj(ocean[i], ocean[i + 1], ocean[i + 2]);
        if (P.z < 0.05 || P.sy > h + s) continue;
        dust.rect(P.sx - s, P.sy - s, s * 2, s * 2);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fill(dust);

      // Land dots, batched into one path per brightness bucket
      const dotR = Math.max(0.6, R * 0.0036);
      const buckets = LAND_COLORS.length;
      const landPaths = LAND_COLORS.map(() => new Path2D());
      for (let i = 0; i < land.length; i += 3) {
        proj(land[i], land[i + 1], land[i + 2]);
        if (P.z < 0.05 || P.sy > h + dotR) continue;
        const r = dotR * (0.4 + 0.6 * P.z);
        const p = landPaths[Math.min(buckets - 1, (P.z * buckets) | 0)];
        p.moveTo(P.sx + r, P.sy);
        p.arc(P.sx, P.sy, r, 0, TAU);
      }
      for (let b = 0; b < buckets; b++) {
        ctx.fillStyle = LAND_COLORS[b];
        ctx.fill(landPaths[b]);
      }

      // Network arcs
      ctx.lineWidth = 1 + boost * 0.8;
      ctx.strokeStyle = `rgba(${RED}, ${0.34 + boost * 0.4})`;
      for (let a = 0; a < ARC_GEOMS.length; a++) {
        const pts = ARC_GEOMS[a];
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= ARC_SEGMENTS; i++) {
          proj(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]);
          if (occluded()) {
            pen = false;
            continue;
          }
          if (pen) ctx.lineTo(P.sx, P.sy);
          else {
            ctx.moveTo(P.sx, P.sy);
            pen = true;
          }
        }
        ctx.stroke();
      }

      // Comets travelling along the arcs
      if (!reduce) {
        for (let a = 0; a < ARC_GEOMS.length; a++) {
          const pts = ARC_GEOMS[a];
          const period = 3.4 + (a % 4) * 0.6;
          const head = (t / period + a * 0.29) % 1;
          for (let k = TRAIL - 1; k >= 0; k--) {
            const tt = head - k * 0.014;
            if (tt <= 0) continue;
            const f = tt * ARC_SEGMENTS;
            const i = Math.min(ARC_SEGMENTS - 1, f | 0);
            const u = f - i;
            const o = i * 3;
            proj(
              pts[o] + (pts[o + 3] - pts[o]) * u,
              pts[o + 1] + (pts[o + 4] - pts[o + 1]) * u,
              pts[o + 2] + (pts[o + 5] - pts[o + 2]) * u,
            );
            if (occluded()) continue;
            const fade = 1 - k / TRAIL;
            const rad = R * 0.0055 * (0.5 + fade) * (1 + boost * 0.7);
            if (k === 0) {
              ctx.fillStyle = `rgba(${RED}, 0.3)`;
              ctx.beginPath();
              ctx.arc(P.sx, P.sy, rad * 3.2, 0, TAU);
              ctx.fill();
              ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
            } else {
              ctx.fillStyle = `rgba(${RED}, ${0.65 * fade})`;
            }
            ctx.beginPath();
            ctx.arc(P.sx, P.sy, rad, 0, TAU);
            ctx.fill();
          }
        }
      }

      // Network nodes
      for (let n = 0; n < NODE_VECS.length; n++) {
        const v = NODE_VECS[n];
        proj(v[0], v[1], v[2]);
        if (P.z < 0.06 || P.sy > h + 20) continue;
        const vis = Math.min(1, (P.z - 0.06) / 0.25);
        const r = Math.max(1.6, R * 0.0072);

        ctx.fillStyle = `rgba(${RED}, ${(0.2 + boost * 0.25) * vis})`;
        ctx.beginPath();
        ctx.arc(P.sx, P.sy, r * (3 + boost * 1.5), 0, TAU);
        ctx.fill();

        if (!reduce) {
          const ph = (t / 2.6 + n * 0.17) % 1;
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(${RED}, ${(1 - ph) * 0.6 * vis})`;
          ctx.beginPath();
          ctx.arc(P.sx, P.sy, r * (1.5 + ph * 5), 0, TAU);
          ctx.stroke();
        }

        ctx.fillStyle = `rgba(${RED}, ${vis})`;
        ctx.beginPath();
        ctx.arc(P.sx, P.sy, r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * vis})`;
        ctx.beginPath();
        ctx.arc(P.sx, P.sy, r * 0.38, 0, TAU);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = prevNow ? Math.min(0.05, (now - prevNow) / 1000) : 1 / 60;
      prevNow = now;

      const target = reduce ? 0 : AUTO_SPEED;
      if (!dragging) {
        yaw += vel * dt;
        vel += (target - vel) * (1 - Math.exp(-dt * 1.4));
        tilt += (START_TILT - tilt) * (1 - Math.exp(-dt * 0.9));
      }
      boostRef.current = Math.max(0, boostRef.current - dt / 1.8);

      draw(now / 1000);

      const settling =
        dragging ||
        Math.abs(vel - target) > 0.002 ||
        Math.abs(tilt - START_TILT) > 0.002 ||
        boostRef.current > 0.001;
      if (visible && (!reduce || settling)) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (raf || !visible) return;
      prevNow = 0;
      raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (visible) draw(performance.now() / 1000);
      kick();
    };

    /* ----------------------------- interaction ----------------------------- */

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      vel = 0;
      try {
        wrap.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
      kick();
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const radius = Math.max(1, w / 2);
      yaw -= dx / radius;
      tilt = Math.min(MAX_TILT, Math.max(MIN_TILT, tilt + (dy / radius) * 0.8));
      const dtSec = Math.max(1, now - lastT) / 1000;
      vel = 0.6 * vel + 0.4 * (-dx / radius / dtSec);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (performance.now() - lastT > 90) vel = 0;
      vel = Math.min(3, Math.max(-3, vel));
      try {
        wrap.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      kick();
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);

    const onReduceChange = () => {
      reduce = reduceQuery.matches;
      kick();
    };
    reduceQuery.addEventListener("change", onReduceChange);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
        else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      reduceQuery.removeEventListener("change", onReduceChange);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      data-cursor="DRAG"
      className={clsx("relative touch-pan-y select-none", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
