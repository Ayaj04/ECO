/**
 * Geometry for the RKCA ribbon.
 *
 * The ribbon zig-zags down the page. It starts at the top centre, swings out to each node in
 * turn (right, left, right, left) and finishes on the hub of the map. Because it sweeps across
 * the screen instead of running straight down, the four nodes need far less height.
 * Node centres come from the DOM, so the ribbon always passes through them.
 */

export interface Pt {
  x: number;
  y: number;
}

/** Ribbon width in design px: full beside each node, thinner between them, fine at both ends. */
const THICK = 9;
const THIN = 4;
const TIP = 2;

/** Points per swing between two waypoints. */
const STEPS = 72;

/** One swing is a half wave: it leaves and arrives heading straight down, and sweeps across in between. */
const swing = (u: number) => (1 - Math.cos(Math.PI * u)) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => t * t * (3 - 2 * t);

export interface RibbonGeometry {
  /** Height of the drawing area, in CSS px. */
  height: number;
  /** Left edge and width of the drawing area, in stage coordinates. It can be wider than the stage. */
  viewX: number;
  viewW: number;
  /** Centre line as a polyline path. Used to reveal the ribbon along its length. */
  line: string;
  /** Outline of the ribbon, with its width varying along the length. */
  shape: string;
  /** How far down the page (0 to 1) each node sits. */
  fractions: number[];
  /** Design scale the geometry was built at. */
  scale: number;
  /** Turns how far down the page the ribbon has been drawn (0 to 1) into the share of its length that covers. */
  lengthAt: (down: number) => number;
}

interface BuildInput {
  /** Width of the stage in px. */
  width: number;
  /** Left edge and width of the area the ribbon may draw in, in stage coordinates. */
  viewX: number;
  viewW: number;
  /** Design scale: 1 at full desktop size. Drives the ribbon's width. */
  k: number;
  /** Node centres relative to the stage, in R, K, C, A order. */
  nodes: Pt[];
  /** Where the ribbon lands, relative to the stage. */
  end: Pt;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

export function buildRibbon({ width, viewX, viewW, k, nodes, end }: BuildInput): RibbonGeometry {
  // Top centre, the four nodes, then the hub. Each waypoint has to be lower than the one before.
  const way: Pt[] = [{ x: width / 2, y: 0 }, ...nodes, end];
  for (let i = 1; i < way.length; i++) way[i] = { x: way[i].x, y: Math.max(way[i].y, way[i - 1].y + 1) };
  const endY = way[way.length - 1].y;

  const pts: Pt[] = [];
  for (let s = 0; s < way.length - 1; s++) {
    const a = way[s];
    const b = way[s + 1];
    for (let i = s === 0 ? 0 : 1; i <= STEPS; i++) {
      const u = i / STEPS;
      pts.push({ x: a.x + (b.x - a.x) * swing(u), y: a.y + (b.y - a.y) * u });
    }
  }

  // Width by height: thin at the very top, full at a node, thinner half way to the next, then tapering onto the hub.
  const widthAt = (y: number) => {
    if (y <= way[1].y) return lerp(TIP, THICK, easeInOut(y / way[1].y));
    for (let i = 1; i < 4; i++) {
      if (y <= way[i + 1].y) {
        const u = (y - way[i].y) / (way[i + 1].y - way[i].y);
        const bump = Math.pow((1 + Math.cos(2 * Math.PI * u)) / 2, 0.9);
        return lerp(THIN, THICK, bump);
      }
    }
    const u = (y - way[4].y) / (way[5].y - way[4].y);
    return lerp(THICK + 1, TIP + 0.5, easeInOut(Math.min(1, u)));
  };

  // How far along the ribbon each point is, and how far down the page.
  const len: number[] = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = len[len.length - 1];
  const down = pts.map((p) => p.y / endY);
  const along = len.map((l) => l / total);

  const lengthAt = (t: number) => {
    const d = Math.min(1, Math.max(0, t));
    let lo = 0;
    let hi = pts.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (down[mid] <= d) lo = mid;
      else hi = mid;
    }
    const span = down[hi] - down[lo] || 1;
    return along[lo] + ((d - down[lo]) / span) * (along[hi] - along[lo]);
  };

  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[Math.max(0, i - 1)];
    const q = pts[Math.min(pts.length - 1, i + 1)];
    const tx = q.x - p.x;
    const ty = q.y - p.y;
    const m = Math.hypot(tx, ty) || 1;
    const nx = -ty / m;
    const ny = tx / m;
    const half = Math.max(0.65, widthAt(pts[i].y) * k * 0.5);
    left.push(`${r1(pts[i].x + nx * half)} ${r1(pts[i].y + ny * half)}`);
    right.push(`${r1(pts[i].x - nx * half)} ${r1(pts[i].y - ny * half)}`);
  }

  return {
    height: endY + 24,
    viewX,
    viewW,
    line: "M" + pts.map((p) => `${r1(p.x)} ${r1(p.y)}`).join("L"),
    shape: "M" + left.join("L") + "L" + right.reverse().join("L") + "Z",
    fractions: nodes.map((n) => n.y / endY),
    scale: k,
    lengthAt,
  };
}
