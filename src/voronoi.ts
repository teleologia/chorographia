// Pure geometry functions for world-map zone mode.
// No plugin dependencies — only 2D polygon math.

export interface Point2D { x: number; y: number }

export interface Bounds {
	minX: number; minY: number;
	maxX: number; maxY: number;
}

// ---------- Mulberry32 PRNG (duplicated from kmeans.ts — small pure fn) ----------

function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// ---------- Sutherland-Hodgman polygon clipping ----------

/**
 * Clip `subject` polygon against `clip` polygon (both convex).
 * Returns the intersection polygon (convex).
 */
export function clipConvexPolygons(subject: Point2D[], clip: Point2D[]): Point2D[] {
	if (subject.length < 3 || clip.length < 3) return [];

	let output = subject;

	for (let i = 0; i < clip.length; i++) {
		if (output.length === 0) return [];

		const edgeA = clip[i];
		const edgeB = clip[(i + 1) % clip.length];
		const input = output;
		output = [];

		for (let j = 0; j < input.length; j++) {
			const cur = input[j];
			const prev = input[(j + input.length - 1) % input.length];
			const curInside = isLeft(edgeA, edgeB, cur);
			const prevInside = isLeft(edgeA, edgeB, prev);

			if (curInside) {
				if (!prevInside) {
					const ix = lineIntersect(prev, cur, edgeA, edgeB);
					if (ix) output.push(ix);
				}
				output.push(cur);
			} else if (prevInside) {
				const ix = lineIntersect(prev, cur, edgeA, edgeB);
				if (ix) output.push(ix);
			}
		}
	}

	return output;
}

/** True if point is on the left side (inside) of directed edge A→B. */
function isLeft(a: Point2D, b: Point2D, p: Point2D): boolean {
	return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= 0;
}

/** Intersection of line segments p1→p2 and p3→p4. */
function lineIntersect(p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): Point2D | null {
	const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
	const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
	const denom = d1x * d2y - d1y * d2x;
	if (Math.abs(denom) < 1e-12) return null;
	const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denom;
	return { x: p1.x + d1x * t, y: p1.y + d1y * t };
}

// ---------- Voronoi cells via half-plane clipping ----------

/**
 * Compute Voronoi cells for a set of centroids within given bounds.
 * Each cell is a convex polygon. O(k²) — fine for k ≤ 24.
 */
export function computeVoronoiCells(centroids: Point2D[], bounds: Bounds): Point2D[][] {
	const { minX, minY, maxX, maxY } = bounds;
	const boundRect: Point2D[] = [
		{ x: minX, y: minY },
		{ x: maxX, y: minY },
		{ x: maxX, y: maxY },
		{ x: minX, y: maxY },
	];

	const cells: Point2D[][] = [];

	for (let i = 0; i < centroids.length; i++) {
		let cell = [...boundRect];

		for (let j = 0; j < centroids.length; j++) {
			if (i === j) continue;
			if (cell.length < 3) break;

			// Clip cell to the half-plane closer to centroid[i] than centroid[j].
			// The bisector between i and j: midpoint + perpendicular direction.
			const ci = centroids[i], cj = centroids[j];
			const mx = (ci.x + cj.x) / 2;
			const my = (ci.y + cj.y) / 2;
			// Normal from j to i (points toward i's side)
			const nx = ci.x - cj.x;
			const ny = ci.y - cj.y;

			// Build a large clip polygon representing the half-plane.
			// Use perpendicular bisector line: two points on it, then extend to a large quad.
			const perpX = -ny, perpY = nx; // perpendicular to normal
			const len = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
			const bigR = (maxX - minX + maxY - minY) * 2; // large enough
			const px = perpX / len, py = perpY / len;
			const nnx = nx / len, nny = ny / len;

			// Half-plane polygon: CCW quad on centroid[i]'s side of the bisector
			const halfPlane: Point2D[] = [
				{ x: mx - px * bigR, y: my - py * bigR },
				{ x: mx - px * bigR + nnx * bigR, y: my - py * bigR + nny * bigR },
				{ x: mx + px * bigR + nnx * bigR, y: my + py * bigR + nny * bigR },
				{ x: mx + px * bigR, y: my + py * bigR },
			];

			cell = clipConvexPolygons(cell, halfPlane);
		}

		cells.push(cell);
	}

	return cells;
}

// ---------- Fractal midpoint displacement ----------

/**
 * Hash two 2D points into a deterministic seed.
 * Canonicalizes by sorting endpoints (x first, then y) so both
 * zones sharing an edge produce identical displacement.
 */
function edgeSeed(a: Point2D, b: Point2D): number {
	// Canonical ordering: sort by x, break ties by y
	let p0 = a, p1 = b;
	if (a.x > b.x || (a.x === b.x && a.y > b.y)) {
		p0 = b; p1 = a;
	}
	// Simple hash combining coordinates
	const h = Math.round(p0.x * 100000) * 73856093 ^
		Math.round(p0.y * 100000) * 19349663 ^
		Math.round(p1.x * 100000) * 83492791 ^
		Math.round(p1.y * 100000) * 45989861;
	return Math.abs(h) >>> 0;
}

/**
 * Apply fractal midpoint displacement to a polygon's edges.
 * `iterations` levels of subdivision; amplitude halves each level.
 * PRNG is seeded per-edge from canonicalized endpoints so shared
 * Voronoi edges between two zones produce identical fractal.
 */
export function fractalDisplace(
	polygon: Point2D[],
	iterations: number,
	amplitude: number,
	_seed?: number,
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

			// Midpoint + perpendicular displacement
			const mx = (a.x + b.x) / 2;
			const my = (a.y + b.y) / 2;
			const dx = b.x - a.x, dy = b.y - a.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			if (len < 1e-10) continue;

			// Canonical perpendicular: always derive from sorted endpoint direction
			// so both zones traversing a shared edge in opposite directions
			// produce the SAME displaced midpoint (not mirrored).
			let ca = a, cb = b;
			if (a.x > b.x || (a.x === b.x && a.y > b.y)) { ca = b; cb = a; }
			const cdx = cb.x - ca.x, cdy = cb.y - ca.y;
			const px = -cdy / len, py = cdx / len;

			// Deterministic displacement from edge endpoints
			const rng = mulberry32(edgeSeed(a, b) + iter * 7919);
			const disp = (rng() - 0.5) * 2 * amp;

			next.push({ x: mx + px * disp, y: my + py * disp });
		}

		current = next;
	}

	return current;
}

// ---------- Edge classification for sub-zones ----------

/**
 * Check if a polygon edge (midpoint) lies on the boundary of a parent polygon,
 * within a tolerance. Used to skip fractal displacement on outer edges of sub-zones.
 */
export function isEdgeOnBoundary(
	a: Point2D, b: Point2D,
	parentPoly: Point2D[],
	tolerance: number,
): boolean {
	const mx = (a.x + b.x) / 2;
	const my = (a.y + b.y) / 2;
	return pointToPolygonDist(mx, my, parentPoly) < tolerance;
}

/** Minimum distance from point to any edge of a polygon. */
function pointToPolygonDist(px: number, py: number, poly: Point2D[]): number {
	let minD = Infinity;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i], b = poly[(i + 1) % poly.length];
		const d = pointToSegmentDist(px, py, a, b);
		if (d < minD) minD = d;
	}
	return minD;
}

function pointToSegmentDist(px: number, py: number, a: Point2D, b: Point2D): number {
	const dx = b.x - a.x, dy = b.y - a.y;
	const lenSq = dx * dx + dy * dy;
	if (lenSq < 1e-12) return Math.sqrt((px - a.x) ** 2 + (py - a.y) ** 2);
	const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / lenSq));
	const projX = a.x + t * dx, projY = a.y + t * dy;
	return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}
