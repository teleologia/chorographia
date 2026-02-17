import { SEM_PALETTE } from "./colors";

export interface Zone {
	id: number;
	label: string;
	color: string;
	memberPaths: string[];
	hull: { x: number; y: number }[];
	blob: { x: number; y: number }[];
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

function scaleHull(hull: Point2D[], factor: number): Point2D[] {
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
	dashed = false
): void {
	const blob = zone.blob;
	if (blob.length < 3) return;

	const screenPts = blob.map((p) => w2s(p.x, p.y));

	ctx.save();

	// Build path
	ctx.beginPath();
	ctx.moveTo(screenPts[0].x, screenPts[0].y);
	for (let i = 1; i < screenPts.length; i++) {
		ctx.lineTo(screenPts[i].x, screenPts[i].y);
	}
	ctx.closePath();

	// Semi-transparent fill
	ctx.fillStyle = hexToRgba(zone.color, 0.10 * alpha);
	ctx.fill();

	// Border
	if (dashed) ctx.setLineDash([6, 4]);
	ctx.shadowColor = hexToRgba(zone.color, 0.3 * alpha);
	ctx.shadowBlur = 6;
	ctx.strokeStyle = hexToRgba(zone.color, 0.35 * alpha);
	ctx.lineWidth = 1.5;
	ctx.stroke();
	ctx.shadowBlur = 0;
	if (dashed) ctx.setLineDash([]);

	// Label centered in zone
	const cx = screenPts.reduce((s, p) => s + p.x, 0) / screenPts.length;
	const cy = screenPts.reduce((s, p) => s + p.y, 0) / screenPts.length;

	ctx.font = "600 9px var(--font-interface)";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.letterSpacing = "1.5px";
	ctx.fillStyle = hexToRgba(zone.color, 0.5 * alpha);
	ctx.fillText(zone.label.toUpperCase(), cx, cy);
	ctx.letterSpacing = "0px";

	ctx.restore();
}
