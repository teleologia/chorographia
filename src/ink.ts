// ---------- Ink utilities — hand-drawn rendering primitives ----------
// Seeded-deterministic: no jitter on redraw.

export function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function hashCoords(x: number, y: number): number {
	const h = Math.round(x * 10000) * 73856093 ^ Math.round(y * 10000) * 19349663;
	return (Math.abs(h) >>> 0);
}

interface Point { x: number; y: number }

/**
 * Subdivide a line and displace midpoints perpendicular to the segment by seeded random × amplitude.
 * Returns array of points including start and end.
 */
export function wobbleLine(
	x0: number, y0: number, x1: number, y1: number,
	amplitude: number, segments = 6, seed = 0,
): Point[] {
	const rng = mulberry32(seed);
	const pts: Point[] = [{ x: x0, y: y0 }];
	const dx = x1 - x0, dy = y1 - y0;
	const len = Math.sqrt(dx * dx + dy * dy);
	if (len < 0.001) return [{ x: x0, y: y0 }, { x: x1, y: y1 }];
	// perpendicular unit vector
	const px = -dy / len, py = dx / len;
	for (let i = 1; i < segments; i++) {
		const t = i / segments;
		const disp = (rng() - 0.5) * 2 * amplitude;
		pts.push({
			x: x0 + dx * t + px * disp,
			y: y0 + dy * t + py * disp,
		});
	}
	pts.push({ x: x1, y: y1 });
	return pts;
}

/**
 * Wobble each segment of a polyline.
 */
export function wobblePolyline(points: Point[], amplitude: number, seed = 0): Point[] {
	if (points.length < 2) return [...points];
	const result: Point[] = [points[0]];
	for (let i = 0; i < points.length - 1; i++) {
		const seg = wobbleLine(
			points[i].x, points[i].y,
			points[i + 1].x, points[i + 1].y,
			amplitude, 4, seed + i * 7919,
		);
		// skip first point (already in result)
		for (let j = 1; j < seg.length; j++) result.push(seg[j]);
	}
	return result;
}

/**
 * Draw a wobbly path with slight lineWidth variation (ink pressure).
 */
export function strokeWobblyLine(
	ctx: CanvasRenderingContext2D,
	x0: number, y0: number, x1: number, y1: number,
	amplitude: number, baseWidth: number, segments = 6, seed = 0,
) {
	const pts = wobbleLine(x0, y0, x1, y1, amplitude, segments, seed);
	drawWobblyPath(ctx, pts, baseWidth, seed);
}

export function strokeWobblyPolyline(
	ctx: CanvasRenderingContext2D,
	points: Point[], amplitude: number, baseWidth: number, seed = 0,
) {
	const pts = wobblePolyline(points, amplitude, seed);
	drawWobblyPath(ctx, pts, baseWidth, seed);
}

function drawWobblyPath(ctx: CanvasRenderingContext2D, pts: Point[], baseWidth: number, seed: number) {
	if (pts.length < 2) return;
	const rng = mulberry32(seed + 31337);
	// Slight ink-pressure variation per sub-segment
	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	for (let i = 1; i < pts.length; i++) {
		ctx.lineTo(pts[i].x, pts[i].y);
	}
	// Use average width with small variation
	ctx.lineWidth = baseWidth * (0.9 + rng() * 0.2);
	ctx.stroke();
}

/**
 * Fill a rectangular area with seeded random dots. Tile-based for performance.
 * Batches all dots into a single path for efficient rendering.
 */
export function fillStipple(
	ctx: CanvasRenderingContext2D,
	x: number, y: number, w: number, h: number,
	density: number, dotRadius: number, color: string, seed = 0,
) {
	const tileSize = 64;
	ctx.fillStyle = color;
	const tx0 = Math.floor(x / tileSize);
	const ty0 = Math.floor(y / tileSize);
	const tx1 = Math.ceil((x + w) / tileSize);
	const ty1 = Math.ceil((y + h) / tileSize);
	const dotsPerTile = Math.max(1, Math.round(density * tileSize * tileSize));

	ctx.beginPath();
	for (let tx = tx0; tx < tx1; tx++) {
		for (let ty = ty0; ty < ty1; ty++) {
			const tileSeed = hashCoords(tx + seed * 0.001, ty + seed * 0.002);
			const rng = mulberry32(tileSeed);
			for (let d = 0; d < dotsPerTile; d++) {
				const dx = tx * tileSize + rng() * tileSize;
				const dy = ty * tileSize + rng() * tileSize;
				if (dx < x || dx > x + w || dy < y || dy > y + h) continue;
				ctx.moveTo(dx + dotRadius, dy);
				ctx.arc(dx, dy, dotRadius, 0, Math.PI * 2);
			}
		}
	}
	ctx.fill();
}
