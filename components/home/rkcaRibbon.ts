/**
 * Geometry for the RKCA ribbon.
 *
 * The weave through the four nodes was measured from the 1024 x 1536 design
 * artwork, so "poster" coordinates below are pixels of that artwork.
 * buildRibbon() maps them onto the real page layout: node centres come from
 * the DOM, so the ribbon always passes through the nodes, whatever the screen
 * size. After the last node the ribbon sweeps down to wherever it has to land.
 */

export interface Pt {
  x: number;
  y: number;
}

/** Poster x of the vertical axis the ribbon weaves around. */
export const POSTER_CENTER_X = 508;

/** Poster x offset of each node from the axis (R, K, C, A). */
export const NODE_OFFSETS = [-18, 32, -26, 32] as const;

/** Poster y of the four nodes. */
const NODE_Y = [170, 390, 637, 872] as const;

/** Where the poster ribbon would end. Only used to spread the width taper over the final stretch. */
const POSTER_END_Y = 1080;

/** Centre line of the ribbon down to just past the last node, poster coordinates. Gaps are where a node covers the ribbon. */
const CENTERLINE: ReadonlyArray<readonly [number, number]> = [
  [511, 0], [511, 40], [508, 52], [505, 60], [502, 70], [498, 80], [494, 90], [489, 100],
  [483, 110], [479, 128], [477, 150], [477, 172], [479, 200], [482, 215], [486, 230],
  [494, 240], [504, 250], [514, 260], [524, 270], [533, 280], [541, 290], [548, 300],
  [554, 310], [557, 320], [561, 330], [564, 345], [565, 360], [564, 378], [560, 400],
  [555, 420], [549, 438], [543, 450], [535, 460], [525, 470], [515, 480], [503, 490],
  [491, 500], [481, 510], [471, 520], [462, 530], [456, 540], [451, 550], [446, 560],
  [444, 570], [441, 590], [440, 610], [441, 625], [446, 645], [458, 665], [470, 685],
  [482, 700], [491, 710], [501, 720], [512, 730], [522, 740], [532, 750], [541, 760],
  [549, 770], [555, 780], [560, 790], [564, 800], [567, 810], [570, 830], [571, 850],
  [569, 870], [563, 888], [554, 904],
];

/** Ribbon width by poster y: wide beside each node, thin between them, tapering to the end. */
const WIDTH: ReadonlyArray<readonly [number, number]> = [
  [0, 2], [50, 2], [70, 3], [90, 6], [110, 9], [200, 9], [230, 9], [245, 7], [255, 6],
  [265, 4], [295, 4], [310, 6], [325, 6], [340, 8], [440, 9], [455, 9], [462, 7],
  [472, 5], [485, 4], [520, 4], [535, 5], [550, 6], [565, 7], [580, 8], [680, 9],
  [700, 9], [712, 7], [722, 5], [750, 5], [765, 6], [790, 7], [810, 8], [830, 9],
  [915, 10], [930, 10], [940, 7], [950, 6], [960, 5], [970, 4], [985, 3], [1000, 2],
  [1080, 3],
];

function widthAt(y: number): number {
  if (y <= WIDTH[0][0]) return WIDTH[0][1];
  for (let i = 1; i < WIDTH.length; i++) {
    const [y1, w1] = WIDTH[i];
    if (y <= y1) {
      const [y0, w0] = WIDTH[i - 1];
      return w0 + ((y - y0) / (y1 - y0)) * (w1 - w0);
    }
  }
  return WIDTH[WIDTH.length - 1][1];
}

/** Dense Catmull-Rom samples through the centre line, in poster space. */
function sampleCenterline(stepsPerSpan = 3): Pt[] {
  const n = CENTERLINE.length;
  const at = (i: number) => CENTERLINE[Math.min(n - 1, Math.max(0, i))];
  const out: Pt[] = [];
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = at(i - 1);
    const [x1, y1] = at(i);
    const [x2, y2] = at(i + 1);
    const [x3, y3] = at(i + 2);
    for (let s = 0; s < stepsPerSpan; s++) {
      const t = s / stepsPerSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x: 0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3),
        y: 0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3),
      });
    }
  }
  const [lx, ly] = at(n - 1);
  out.push({ x: lx, y: ly });
  return out;
}

const SAMPLES = sampleCenterline();

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
  /** How far along the ribbon (0 to 1) each node sits. */
  fractions: number[];
  /** Design scale the geometry was built at. */
  scale: number;
}

interface BuildInput {
  /** Width of the stage in px. */
  width: number;
  /** Left edge and width of the area the ribbon may draw in, in stage coordinates. */
  viewX: number;
  viewW: number;
  /** Design scale: 1 at full desktop size. Drives the ribbon's width. */
  k: number;
  /** Horizontal stretch. Above k, the waves swing wider than the artwork, so the ribbon curves more. */
  kx: number;
  /** Node centres relative to the stage, in R, K, C, A order. */
  nodes: Pt[];
  /** Where the ribbon lands, relative to the stage. */
  end: Pt;
}

const r1 = (v: number) => Math.round(v * 10) / 10;

export function buildRibbon({ width, viewX, viewW, k, kx, nodes, end }: BuildInput): RibbonGeometry {
  const cx = width / 2;
  const yDom = [0, nodes[0].y, nodes[1].y, nodes[2].y, nodes[3].y];
  const lastNodeY = NODE_Y[3];
  const rowScale = (nodes[3].y - nodes[2].y) / (NODE_Y[3] - NODE_Y[2]);

  // Poster y to page y: stretch each gap between anchors to fit, then keep the same pace after the last node.
  const anchorsP = [0, ...NODE_Y];
  const mapY = (y: number) => {
    if (y >= lastNodeY) return yDom[4] + (y - lastNodeY) * rowScale;
    let i = 0;
    while (i < 3 && y > anchorsP[i + 1]) i++;
    return yDom[i] + ((y - anchorsP[i]) / (anchorsP[i + 1] - anchorsP[i])) * (yDom[i + 1] - yDom[i]);
  };

  const pts: Array<{ x: number; y: number; py: number }> = SAMPLES.map((s) => ({
    x: cx + (s.x - POSTER_CENTER_X) * kx,
    y: mapY(s.y),
    py: s.y,
  }));

  // Final stretch: leave the last sample the way the ribbon was heading, then settle onto the landing
  // point coming straight down, so it reads as one continuous, unhurried S-curve.
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  const slope = (b.x - a.x) / (b.y - a.y);
  const dy = Math.max(60, end.y - b.y);
  const c1 = { x: b.x + slope * dy * 0.36, y: b.y + dy * 0.36 };
  const c2 = { x: end.x, y: end.y - dy * 0.4 };
  const steps = 90;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x: u * u * u * b.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * end.x,
      y: u * u * u * b.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * end.y,
      py: b.py + t * (POSTER_END_Y - b.py),
    });
  }

  // Length along the centre line up to each point.
  const len: number[] = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = len[len.length - 1];

  const fractions = NODE_Y.map((ny) => {
    let best = 0;
    for (let i = 1; i < pts.length; i++) if (Math.abs(pts[i].py - ny) < Math.abs(pts[best].py - ny)) best = i;
    return len[best] / total;
  });

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
    const half = Math.max(0.65, widthAt(pts[i].py) * k * 0.5);
    left.push(`${r1(pts[i].x + nx * half)} ${r1(pts[i].y + ny * half)}`);
    right.push(`${r1(pts[i].x - nx * half)} ${r1(pts[i].y - ny * half)}`);
  }

  return {
    height: end.y + 24,
    viewX,
    viewW,
    line: "M" + pts.map((p) => `${r1(p.x)} ${r1(p.y)}`).join("L"),
    shape: "M" + left.join("L") + "L" + right.reverse().join("L") + "Z",
    fractions,
    scale: k,
  };
}
