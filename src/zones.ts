import { computeVoronoiCells, clipConvexPolygons, fractalDisplace, isEdgeOnBoundary } from "./voronoi";
import type { Bounds } from "./voronoi";
import { runWorldMapPipeline } from "./worldmap";

const SEM_PALETTE = [
	"#00D6FF", "#B9FF00", "#FF7A00", "#A855F7",
	"#00FFB3", "#FF3DB8", "#00FFA3", "#FFD400",
	"#00F5D4", "#FF9A3D", "#7CFFCB", "#B8C0FF",
];

export interface Zone {
	id: number;
	label: string;
	color: string;
	memberPaths: string[];
	hull: { x: number; y: number }[];
	blob: { x: number; y: number }[];
	cellPolygons?: { x: number; y: number }[][]; // worldmap: individual Voronoi cell outlines
	subDomainCells?: Map<number, { x: number; y: number }[][]>; // worldmap: cells grouped by province
}

export interface BorderEdge {
	vertices: { x: number; y: number }[];
	leftZone: number;  // -1 = ocean
	rightZone: number; // -1 = ocean
	edgeType: "coast" | "border" | "province";
}

export interface Continent {
	id: number;
	zoneIds: number[];
	label: string;
	coastline: { x: number; y: number }[];
}

export interface WorldMapResult {
	zones: Zone[];
	continents: Continent[];
	borderEdges: BorderEdge[];
}

interface Point2D { x: number; y: number }

interface MapPointLike {
	path: string;
	x: number;
	y: number;
	folder: string;
	cat: string;
}

// ---------- convex hull (Graham scan) ----------

function cross(o: Point2D, a: Point2D, b: Point2D): number {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(points: Point2D[]): Point2D[] {
	if (points.length <= 2) return [...points];

	const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
	const n = sorted.length;
	const lower: Point2D[] = [];
	for (const p of sorted) {
		while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
			lower.pop();
		lower.push(p);
	}
	const upper: Point2D[] = [];
	for (let i = n - 1; i >= 0; i--) {
		const p = sorted[i];
		while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
			upper.pop();
		upper.push(p);
	}
	lower.pop();
	upper.pop();
	return lower.concat(upper);
}

// ---------- uniform scale from centroid ----------

export function scaleHull(hull: Point2D[], factor: number): Point2D[] {
	if (hull.length < 2) return hull;

	let cx = 0, cy = 0;
	for (const p of hull) { cx += p.x; cy += p.y; }
	cx /= hull.length;
	cy /= hull.length;

	return hull.map((p) => ({
		x: cx + (p.x - cx) * factor,
		y: cy + (p.y - cy) * factor,
	}));
}

// ---------- resample edges so no segment is too long ----------

function resamplePoly(pts: Point2D[], maxSegLen: number): Point2D[] {
	if (pts.length < 2) return pts;
	const result: Point2D[] = [];
	const n = pts.length;

	for (let i = 0; i < n; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % n];
		const dx = b.x - a.x, dy = b.y - a.y;
		const len = Math.sqrt(dx * dx + dy * dy);
		const segs = Math.max(1, Math.ceil(len / maxSegLen));

		for (let s = 0; s < segs; s++) {
			const t = s / segs;
			result.push({ x: a.x + dx * t, y: a.y + dy * t });
		}
	}

	return result;
}

// ---------- Chaikin corner-cutting subdivision ----------

function chaikinSubdivide(pts: Point2D[], iterations: number): Point2D[] {
	if (pts.length < 3) return pts;
	let current = pts;

	for (let iter = 0; iter < iterations; iter++) {
		const next: Point2D[] = [];
		const n = current.length;
		for (let i = 0; i < n; i++) {
			const a = current[i];
			const b = current[(i + 1) % n];
			next.push(
				{ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 },
				{ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 },
			);
		}
		current = next;
	}

	return current;
}

// ---------- auto-label from most common folder/cat ----------

function autoLabel(points: MapPointLike[]): string {
	const counts = new Map<string, number>();
	for (const p of points) {
		const key = p.cat || p.folder || "Notes";
		counts.set(key, (counts.get(key) || 0) + 1);
	}
	let best = "Zone";
	let bestCount = 0;
	for (const [k, v] of counts) {
		if (v > bestCount) { bestCount = v; best = k; }
	}
	return best;
}

// ---------- main export ----------

export function computeZones(points: MapPointLike[], assignments: number[], k: number): Zone[] {
	// Group points by cluster
	const groups = new Map<number, MapPointLike[]>();
	for (let i = 0; i < points.length; i++) {
		const c = assignments[i];
		if (!groups.has(c)) groups.set(c, []);
		groups.get(c)!.push(points[i]);
	}

	const zones: Zone[] = [];
	for (const [id, members] of groups) {
		if (members.length < 2) continue; // skip singleton clusters

		const pts2d: Point2D[] = members.map((m) => ({ x: m.x, y: m.y }));
		let hull = convexHull(pts2d);

		// For 2-point clusters, create a small diamond around them
		if (hull.length < 3) {
			const cx = (pts2d[0].x + (pts2d[1]?.x ?? pts2d[0].x)) / 2;
			const cy = (pts2d[0].y + (pts2d[1]?.y ?? pts2d[0].y)) / 2;
			const dx = Math.abs((pts2d[1]?.x ?? pts2d[0].x) - pts2d[0].x);
			const dy = Math.abs((pts2d[1]?.y ?? pts2d[0].y) - pts2d[0].y);
			const pad = Math.max(0.03, Math.max(dx, dy) * 0.4);
			hull = [
				{ x: cx - pad, y: cy },
				{ x: cx, y: cy + pad },
				{ x: cx + pad, y: cy },
				{ x: cx, y: cy - pad },
			];
		}

		// Uniform scale outward from centroid (1.3x = 30% padding)
		const scaled = scaleHull(hull, 1.3);

		// Chaikin subdivision — 3 passes for smooth natural curves
		const blob = chaikinSubdivide(scaled, 3);

		zones.push({
			id,
			label: autoLabel(members),
			color: SEM_PALETTE[id % SEM_PALETTE.length],
			memberPaths: members.map((m) => m.path),
			hull: scaled,
			blob,
		});
	}

	return zones;
}

// ---------- geometry helpers for world map ----------

/** Distance from a point to the boundary of a convex polygon, or 0 if inside. */
function pointOutsideConvexDist(p: Point2D, hull: Point2D[]): number {
	// Check if inside (left of all edges for CCW polygon)
	let inside = true;
	for (let i = 0; i < hull.length; i++) {
		const a = hull[i], b = hull[(i + 1) % hull.length];
		if ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) < 0) {
			inside = false;
			break;
		}
	}
	if (inside) return 0;

	// Minimum distance to any edge
	let minD = Infinity;
	for (let i = 0; i < hull.length; i++) {
		const a = hull[i], b = hull[(i + 1) % hull.length];
		const dx = b.x - a.x, dy = b.y - a.y;
		const lenSq = dx * dx + dy * dy;
		if (lenSq < 1e-12) continue;
		const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
		const projX = a.x + t * dx, projY = a.y + t * dy;
		const d = Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
		if (d < minD) minD = d;
	}
	return minD;
}

// ---------- world map zones ----------

export interface WorldMapSettings {
	seaLevel: number;
	unity: number;
	ruggedness: number;
}

export function computeWorldMapZones(
	points: MapPointLike[],
	assignments: number[],
	k: number,
	subCentroidsByCluster?: Map<number, { x: number; y: number }[]>,
	wmSettings?: WorldMapSettings,
): WorldMapResult {
	return runWorldMapPipeline(points, assignments, k, subCentroidsByCluster, wmSettings);
}

export function computeWorldMapSubZones(
	parentHull: Point2D[],
	points: MapPointLike[],
	assignments: number[],
	localK: number,
): Zone[] {
	// Group points by sub-cluster
	const groups = new Map<number, MapPointLike[]>();
	for (let i = 0; i < points.length; i++) {
		const c = assignments[i];
		if (!groups.has(c)) groups.set(c, []);
		groups.get(c)!.push(points[i]);
	}

	// Compute sub-centroids
	const clusterIds = [...groups.keys()].sort((a, b) => a - b);
	const centroids: Point2D[] = [];
	const centroidIdMap: number[] = [];
	for (const id of clusterIds) {
		const members = groups.get(id)!;
		if (members.length < 2) continue;
		let cx = 0, cy = 0;
		for (const m of members) { cx += m.x; cy += m.y; }
		centroids.push({ x: cx / members.length, y: cy / members.length });
		centroidIdMap.push(id);
	}

	if (centroids.length === 0 || parentHull.length < 3) return [];

	// Bounding box from parent hull
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	for (const p of parentHull) {
		if (p.x < minX) minX = p.x;
		if (p.x > maxX) maxX = p.x;
		if (p.y < minY) minY = p.y;
		if (p.y > maxY) maxY = p.y;
	}
	const padVal = Math.max(maxX - minX, maxY - minY) * 0.1;
	const bounds: Bounds = {
		minX: minX - padVal, minY: minY - padVal,
		maxX: maxX + padVal, maxY: maxY + padVal,
	};

	// Voronoi of sub-centroids
	const voronoiCells = computeVoronoiCells(centroids, bounds);

	const range = Math.max(maxX - minX, maxY - minY) || 0.01;
	const amplitude = range * 0.05;

	// Expanded hull for clipping: larger than parent's fractal blob so
	// sub-zones extend past the coastline. Canvas-clip to parent blob at
	// render time trims to the exact fractal boundary — every pixel inside
	// the country is covered by a province.
	const expandedHull = scaleHull(parentHull, 1.4);

	const zones: Zone[] = [];

	for (let ci = 0; ci < centroids.length; ci++) {
		const id = centroidIdMap[ci];
		const members = groups.get(id)!;
		const voronoiCell = voronoiCells[ci];
		if (!voronoiCell || voronoiCell.length < 3) continue;

		// Clip Voronoi cell to expanded hull (overshoot parent blob intentionally)
		const clipped = clipConvexPolygons(voronoiCell, expandedHull);
		if (clipped.length < 3) continue;

		// Fractal all edges — canvas-clip handles the visual boundary
		const blob = fractalDisplace(clipped, 4, amplitude);

		zones.push({
			id,
			label: autoLabel(members),
			color: SEM_PALETTE[id % SEM_PALETTE.length],
			memberPaths: members.map((m) => m.path),
			hull: clipped,
			blob,
		});
	}

	return zones;
}

/**
 * Clip a (potentially non-convex) polygon to a convex boundary.
 * Uses Sutherland-Hodgman which works for any subject against convex clip.
 */
function clipToConvexBoundary(polygon: Point2D[], convexBound: Point2D[]): Point2D[] {
	if (polygon.length < 3 || convexBound.length < 3) return polygon;
	const result = clipConvexPolygons(polygon, convexBound);
	return result.length >= 3 ? result : polygon;
}

/**
 * Fractal displacement that only affects internal edges (not on parent boundary).
 * Outer edges are left straight (hidden behind parent's fractal blob).
 */
function fractalDisplaceInternal(
	polygon: Point2D[],
	iterations: number,
	amplitude: number,
	parentPoly: Point2D[],
	tolerance: number,
): Point2D[] {
	if (polygon.length < 3 || iterations <= 0) return polygon;

	let current = polygon;

	for (let iter = 0; iter < iterations; iter++) {
		const next: Point2D[] = [];
		const amp = amplitude / Math.pow(2, iter);

		for (let i = 0; i < current.length; i++) {
			const a = current[i];
			const b = current[(i + 1) % current.length];
			next.push(a);

			// Check if this edge is on the parent boundary
			if (isEdgeOnBoundary(a, b, parentPoly, tolerance)) {
				// Just add midpoint without displacement (subdivide but keep straight)
				next.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
				continue;
			}

			// Internal edge — apply fractal displacement (same logic as voronoi.ts)
			const mx = (a.x + b.x) / 2;
			const my = (a.y + b.y) / 2;
			const dx = b.x - a.x, dy = b.y - a.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			if (len < 1e-10) continue;

			// Canonical perpendicular (must match voronoi.ts)
			let p0 = a, p1 = b;
			if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
				p0 = b; p1 = a;
			}
			const cdx = p1.x - p0.x, cdy = p1.y - p0.y;
			const px = -cdy / len, py = cdx / len;
			const h = Math.round(p0.x * 100000) * 73856093 ^
				Math.round(p0.y * 100000) * 19349663 ^
				Math.round(p1.x * 100000) * 83492791 ^
				Math.round(p1.y * 100000) * 45989861;
			const seed = (Math.abs(h) >>> 0) + iter * 7919;

			// Inline mulberry32 for one value
			let s = seed | 0;
			s = (s + 0x6d2b79f5) | 0;
			let t = Math.imul(s ^ (s >>> 15), 1 | s);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			const rng = ((t ^ (t >>> 14)) >>> 0) / 4294967296;

			const disp = (rng - 0.5) * 2 * amp;
			next.push({ x: mx + px * disp, y: my + py * disp });
		}

		current = next;
	}

	return current;
}

// ---------- transform global zone → local space ----------

export function transformZoneToLocal(zone: Zone, cx: number, cy: number, scale: number): Zone {
	const xf = (p: { x: number; y: number }) => ({
		x: (p.x - cx) * scale,
		y: (p.y - cy) * scale,
	});
	return {
		...zone,
		hull: zone.hull.map(xf),
		blob: zone.blob.map(xf),
	};
}

// ---------- rendering ----------

/** Draw text with a synthetic italic (skew transform) — works regardless of font variant support. */
function drawItalicText(
	ctx: CanvasRenderingContext2D,
	text: string, x: number, y: number,
	fillStyle: string, size: number,
) {
	ctx.save();
	ctx.font = `${size}px var(--font-interface)`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = fillStyle;
	// Apply a slight horizontal skew to simulate italic (~12° slant)
	ctx.translate(x, y);
	ctx.transform(1, 0, -0.21, 1, 0, 0);
	ctx.fillText(text, 0, 0);
	ctx.restore();
}

export interface LabelConfig {
	zoneLabelSize: number;
	zoneLabelOpacity: number;
	labelOutline: boolean;
	labelOutlineWidth: number;
}

function contrastOutline(): string {
	const isDark = document.body.classList.contains("theme-dark");
	return isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
}

function hexToRgba(hex: string, alpha: number): string {
	const n = parseInt(hex.slice(1), 16);
	const r = (n >> 16) & 255;
	const g = (n >> 8) & 255;
	const b = n & 255;
	return `rgba(${r},${g},${b},${alpha})`;
}

export function drawZone(
	ctx: CanvasRenderingContext2D,
	zone: Zone,
	w2s: (wx: number, wy: number) => { x: number; y: number },
	alpha: number,
	dashed = false,
	worldmap = false,
	skipLabel = false,
	parentColor?: string,
	fillFade = 1,
	labelCfg?: LabelConfig,
): void {
	const blob = zone.blob;
	if (blob.length < 3) return;

	const screenPts = blob.map((p) => w2s(p.x, p.y));
	const isSubZone = !!parentColor;
	const color = parentColor || zone.color;

	ctx.save();

	// Build path
	ctx.beginPath();
	ctx.moveTo(screenPts[0].x, screenPts[0].y);
	for (let i = 1; i < screenPts.length; i++) {
		ctx.lineTo(screenPts[i].x, screenPts[i].y);
	}
	ctx.closePath();

	if (isSubZone) {
		// Sub-zones: shade fill + thin dashed border
		const fillAlpha = worldmap ? 0.12 : 0.10;
		ctx.fillStyle = hexToRgba(color, fillAlpha * alpha);
		ctx.fill();

		ctx.setLineDash([4, 3]);
		ctx.strokeStyle = hexToRgba(color, 0.25 * alpha);
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.setLineDash([]);
	} else {
		// Parent zones: fill fades out as sub-zones appear
		const fillAlpha = worldmap ? 0.12 : 0.10;
		if (fillFade > 0.01) {
			ctx.fillStyle = hexToRgba(color, fillAlpha * alpha * fillFade);
			ctx.fill();
		}

		if (dashed) ctx.setLineDash([6, 4]);
		const shadowBlur = worldmap ? 4 : 6;
		ctx.shadowColor = hexToRgba(color, 0.3 * alpha);
		ctx.shadowBlur = shadowBlur;
		ctx.strokeStyle = hexToRgba(color, 0.35 * alpha);
		ctx.lineWidth = worldmap ? 2 : 1.5;
		ctx.stroke();
		ctx.shadowBlur = 0;
		if (dashed) ctx.setLineDash([]);
	}

	// Label centered in zone
	if (!skipLabel) {
		const cx = screenPts.reduce((s, p) => s + p.x, 0) / screenPts.length;
		const cy = screenPts.reduce((s, p) => s + p.y, 0) / screenPts.length;
		const zls = labelCfg?.zoneLabelSize ?? 9;
		const zlo = labelCfg?.zoneLabelOpacity ?? 0.5;
		const outline = labelCfg?.labelOutline ?? false;
		const outlineW = labelCfg?.labelOutlineWidth ?? 2;

		if (isSubZone) {
			const subSize = Math.max(5, zls - 2);
			if (outline) {
				ctx.save();
				ctx.font = `${subSize}px var(--font-interface)`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.strokeStyle = contrastOutline();
				ctx.lineWidth = outlineW;
				ctx.lineJoin = "round";
				ctx.globalAlpha = 0.4 * alpha;
				ctx.translate(cx, cy);
				ctx.transform(1, 0, -0.21, 1, 0, 0);
				ctx.strokeText(zone.label, 0, 0);
				ctx.restore();
			}
			drawItalicText(ctx, zone.label, cx, cy, hexToRgba(color, 0.4 * alpha), subSize);
		} else {
			ctx.font = `600 ${zls}px var(--font-interface)`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.letterSpacing = "1.5px";
			const txt = zone.label.toUpperCase();
			if (outline) {
				ctx.strokeStyle = contrastOutline();
				ctx.lineWidth = outlineW;
				ctx.lineJoin = "round";
				ctx.globalAlpha = zlo * alpha;
				ctx.strokeText(txt, cx, cy);
			}
			ctx.fillStyle = hexToRgba(color, zlo * alpha);
			ctx.fillText(txt, cx, cy);
			ctx.letterSpacing = "0px";
		}
	}

	ctx.restore();
}

export function drawZoneLabel(
	ctx: CanvasRenderingContext2D,
	zone: Zone,
	w2s: (wx: number, wy: number) => { x: number; y: number },
	alpha: number,
	parentColor?: string,
	labelCfg?: LabelConfig,
): void {
	const blob = zone.blob;
	if (blob.length < 3) return;

	const screenPts = blob.map((p) => w2s(p.x, p.y));
	const cx = screenPts.reduce((s, p) => s + p.x, 0) / screenPts.length;
	const cy = screenPts.reduce((s, p) => s + p.y, 0) / screenPts.length;
	const color = parentColor || zone.color;
	const zls = labelCfg?.zoneLabelSize ?? 9;
	const zlo = labelCfg?.zoneLabelOpacity ?? 0.5;
	const outline = labelCfg?.labelOutline ?? false;
	const outlineW = labelCfg?.labelOutlineWidth ?? 2;

	ctx.save();
	if (parentColor) {
		const subSize = Math.max(5, zls - 2);
		if (outline) {
			ctx.font = `${subSize}px var(--font-interface)`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.strokeStyle = contrastOutline();
			ctx.lineWidth = outlineW;
			ctx.lineJoin = "round";
			ctx.globalAlpha = 0.4 * alpha;
			ctx.translate(cx, cy);
			ctx.transform(1, 0, -0.21, 1, 0, 0);
			ctx.strokeText(zone.label, 0, 0);
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
		drawItalicText(ctx, zone.label, cx, cy, hexToRgba(color, 0.4 * alpha), subSize);
	} else {
		ctx.font = `600 ${zls}px var(--font-interface)`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.letterSpacing = "1.5px";
		const txt = zone.label.toUpperCase();
		if (outline) {
			ctx.strokeStyle = contrastOutline();
			ctx.lineWidth = outlineW;
			ctx.lineJoin = "round";
			ctx.globalAlpha = zlo * alpha;
			ctx.strokeText(txt, cx, cy);
		}
		ctx.fillStyle = hexToRgba(color, zlo * alpha);
		ctx.fillText(txt, cx, cy);
		ctx.letterSpacing = "0px";
	}
	ctx.restore();
}
