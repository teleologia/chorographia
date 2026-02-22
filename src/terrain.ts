import type { Continent } from "./zones";
import { mulberry32, hashCoords, strokeWobblyLine } from "./ink";

export type TerrainType = "port" | "city" | "forest" | "mountain" | "reef";

interface Point2D { x: number; y: number }

function distToPolygon(p: Point2D, poly: Point2D[]): number {
	if (poly.length < 3) return Infinity;
	let minD = Infinity;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		const dx = b.x - a.x, dy = b.y - a.y;
		const lenSq = dx * dx + dy * dy;
		if (lenSq < 1e-12) continue;
		const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
		const px = a.x + t * dx, py = a.y + t * dy;
		const d = Math.sqrt((p.x - px) ** 2 + (p.y - py) ** 2);
		if (d < minD) minD = d;
	}
	return minD;
}

function isInsidePolygon(p: Point2D, poly: Point2D[]): boolean {
	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		if (
			(poly[i].y > p.y) !== (poly[j].y > p.y) &&
			p.x < (poly[j].x - poly[i].x) * (p.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x
		) {
			inside = !inside;
		}
	}
	return inside;
}

function hashPoint(x: number, y: number): number {
	const h = Math.round(x * 10000) * 73856093 ^ Math.round(y * 10000) * 19349663;
	return (Math.abs(h) >>> 0) % 100;
}

export function classifyTerrain(
	point: Point2D,
	continents: Continent[],
	allPoints: Point2D[],
	localDensityRadius = 0.08,
): TerrainType {
	// Check if inside any continent
	let onLand = false;
	let coastDist = Infinity;
	for (const c of continents) {
		if (!c.coastline || c.coastline.length < 3) continue;
		if (isInsidePolygon(point, c.coastline)) {
			onLand = true;
			coastDist = Math.min(coastDist, distToPolygon(point, c.coastline));
			break;
		}
		coastDist = Math.min(coastDist, distToPolygon(point, c.coastline));
	}

	if (!onLand) return "reef";

	// Near coastline → port
	if (coastDist < 0.04) return "port";

	// Local density
	let neighbors = 0;
	const r2 = localDensityRadius * localDensityRadius;
	for (const p of allPoints) {
		const dx = p.x - point.x, dy = p.y - point.y;
		if (dx * dx + dy * dy < r2) neighbors++;
	}

	// Dense → city, sparse → forest/mountain
	if (neighbors > 8) return "city";
	return hashPoint(point.x, point.y) < 50 ? "forest" : "mountain";
}

export function classifyAll(
	points: Point2D[],
	continents: Continent[],
): TerrainType[] {
	return points.map(p => classifyTerrain(p, continents, points));
}

// ---------- Canvas icon drawing ----------

/**
 * @param wx - world X coordinate (used for stable seeding across zoom/pan)
 * @param wy - world Y coordinate
 */
export function drawTerrainIcon(
	ctx: CanvasRenderingContext2D,
	type: TerrainType,
	x: number, y: number,
	size: number,
	color: string,
	alpha: number,
	wx = 0, wy = 0,
) {
	ctx.save();
	ctx.globalAlpha = alpha;
	ctx.translate(x, y);
	// Stable seed from world coords — icons don't shift on zoom/pan
	const seed = hashCoords(wx, wy);

	switch (type) {
		case "city":
			drawCity(ctx, size, color, seed);
			break;
		case "port":
			drawPort(ctx, size, color, seed);
			break;
		case "forest":
			drawForest(ctx, size, color, seed);
			break;
		case "mountain":
			drawMountain(ctx, size, color, seed);
			break;
		case "reef":
			drawReef(ctx, size, color, seed);
			break;
	}

	ctx.restore();
}

// ---------- Engraved icon implementations ----------

function drawMountain(ctx: CanvasRenderingContext2D, s: number, color: string, seed: number) {
	const rng = mulberry32(seed);
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	// Simplified at small sizes
	if (s < 8) {
		ctx.beginPath();
		ctx.moveTo(-s * 0.4, s * 0.4);
		ctx.lineTo(0, -s * 0.5);
		ctx.lineTo(s * 0.4, s * 0.4);
		ctx.stroke();
		return;
	}

	const lw = Math.max(0.5, s * 0.06);

	// Main peak — wobbly inverted-V outline
	strokeWobblyLine(ctx, -s * 0.5, s * 0.4, 0, -s * 0.6, s * 0.04, lw, 5, seed);
	strokeWobblyLine(ctx, 0, -s * 0.6, s * 0.5, s * 0.4, s * 0.04, lw, 5, seed + 100);

	// Secondary peak (ridge feel)
	const p2x = -s * 0.25, p2y = -s * 0.35;
	strokeWobblyLine(ctx, -s * 0.5, s * 0.4, p2x, p2y, s * 0.03, lw * 0.8, 4, seed + 200);
	strokeWobblyLine(ctx, p2x, p2y, -s * 0.05, s * 0.1, s * 0.03, lw * 0.8, 4, seed + 300);

	// Hachure marks on left (shadow) slope — 4–6 short lines
	const hatchCount = 3 + Math.floor(rng() * 3);
	ctx.lineWidth = lw * 0.5;
	for (let i = 0; i < hatchCount; i++) {
		const t = 0.2 + (i / hatchCount) * 0.6;
		// Point on left slope
		const hx = -s * 0.5 + (0 - (-s * 0.5)) * t;
		const hy = s * 0.4 + (-s * 0.6 - s * 0.4) * t;
		// Short downward-right stroke
		const hLen = s * 0.12 + rng() * s * 0.08;
		strokeWobblyLine(ctx, hx, hy, hx + hLen * 0.7, hy + hLen, s * 0.02, lw * 0.5, 3, seed + 400 + i * 71);
	}
}

function drawForest(ctx: CanvasRenderingContext2D, s: number, color: string, seed: number) {
	const rng = mulberry32(seed);
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	if (s < 8) {
		// Simplified: single lollipop tree
		ctx.beginPath();
		ctx.arc(0, -s * 0.2, s * 0.3, 0, Math.PI * 2);
		ctx.fill();
		ctx.fillRect(-0.5, -s * 0.2, 1, s * 0.5);
		return;
	}

	const lw = Math.max(0.5, s * 0.06);
	// 3–5 round-topped "lollipop" trees
	const treeCount = 3 + Math.floor(rng() * 3);
	const trees: { ox: number; oy: number; r: number; h: number }[] = [];
	for (let i = 0; i < treeCount; i++) {
		trees.push({
			ox: (rng() - 0.5) * s * 0.7,
			oy: (rng() - 0.3) * s * 0.3,
			r: s * 0.15 + rng() * s * 0.1,
			h: s * 0.2 + rng() * s * 0.15,
		});
	}
	// Sort by y for overlap depth
	trees.sort((a, b) => a.oy - b.oy);

	for (const t of trees) {
		// Trunk — thin wobbly line
		strokeWobblyLine(ctx, t.ox, t.oy, t.ox, t.oy + t.h, s * 0.02, lw * 0.7, 3, seed + trees.indexOf(t) * 137);
		// Crown — wobbly circle via short arcs
		ctx.beginPath();
		const crownY = t.oy - t.r * 0.3;
		const segments = 12;
		for (let j = 0; j <= segments; j++) {
			const angle = (j / segments) * Math.PI * 2;
			const wobble = 1 + (mulberry32(seed + j * 31 + trees.indexOf(t) * 97)() - 0.5) * 0.2;
			const px = t.ox + Math.cos(angle) * t.r * wobble;
			const py = crownY + Math.sin(angle) * t.r * wobble;
			if (j === 0) ctx.moveTo(px, py);
			else ctx.lineTo(px, py);
		}
		ctx.closePath();
		ctx.lineWidth = lw;
		ctx.stroke();
	}
}

function drawCity(ctx: CanvasRenderingContext2D, s: number, color: string, seed: number) {
	const rng = mulberry32(seed);
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	if (s < 8) {
		// Simplified: single rectangle + peaked roof
		ctx.beginPath();
		ctx.moveTo(-s * 0.3, -s * 0.4);
		ctx.lineTo(0, -s * 0.6);
		ctx.lineTo(s * 0.3, -s * 0.4);
		ctx.lineTo(s * 0.3, s * 0.3);
		ctx.lineTo(-s * 0.3, s * 0.3);
		ctx.closePath();
		ctx.stroke();
		return;
	}

	const lw = Math.max(0.5, s * 0.06);

	// 2–3 bird's-eye buildings with peaked roofs
	const bCount = 2 + Math.floor(rng() * 2);
	const bw = s * 0.25;
	for (let i = 0; i < bCount; i++) {
		const ox = (i - (bCount - 1) / 2) * bw * 1.3;
		const bh = s * 0.3 + rng() * s * 0.25;
		const roofH = s * 0.15 + rng() * s * 0.1;
		const halfW = bw * 0.45;
		const baseY = s * 0.35;

		// Building body
		strokeWobblyLine(ctx, ox - halfW, baseY, ox - halfW, baseY - bh, s * 0.02, lw, 3, seed + i * 100);
		strokeWobblyLine(ctx, ox - halfW, baseY - bh, ox, baseY - bh - roofH, s * 0.02, lw, 3, seed + i * 100 + 10);
		strokeWobblyLine(ctx, ox, baseY - bh - roofH, ox + halfW, baseY - bh, s * 0.02, lw, 3, seed + i * 100 + 20);
		strokeWobblyLine(ctx, ox + halfW, baseY - bh, ox + halfW, baseY, s * 0.02, lw, 3, seed + i * 100 + 30);
		// Base
		strokeWobblyLine(ctx, ox - halfW, baseY, ox + halfW, baseY, s * 0.01, lw, 3, seed + i * 100 + 40);
	}

	// Central church spire with cross
	const spireX = 0;
	const spireBase = s * 0.35 - s * 0.5;
	const spireTop = -s * 0.75;
	strokeWobblyLine(ctx, spireX, spireBase, spireX, spireTop, s * 0.015, lw * 0.8, 4, seed + 500);
	// Cross
	const crossSize = s * 0.08;
	strokeWobblyLine(ctx, spireX - crossSize, spireTop + crossSize, spireX + crossSize, spireTop + crossSize, s * 0.01, lw * 0.6, 3, seed + 510);
	strokeWobblyLine(ctx, spireX, spireTop, spireX, spireTop + crossSize * 2, s * 0.01, lw * 0.6, 3, seed + 520);
}

function drawPort(ctx: CanvasRenderingContext2D, s: number, color: string, seed: number) {
	ctx.strokeStyle = color;
	ctx.fillStyle = color;

	if (s < 8) {
		// Simplified: triangle sail
		ctx.beginPath();
		ctx.moveTo(0, -s * 0.5);
		ctx.lineTo(s * 0.3, s * 0.2);
		ctx.lineTo(-s * 0.3, s * 0.2);
		ctx.closePath();
		ctx.stroke();
		return;
	}

	const lw = Math.max(0.5, s * 0.06);

	// Ship hull — curved arc
	ctx.beginPath();
	ctx.moveTo(-s * 0.4, 0);
	ctx.quadraticCurveTo(-s * 0.35, s * 0.2, 0, s * 0.22);
	ctx.quadraticCurveTo(s * 0.35, s * 0.2, s * 0.4, 0);
	ctx.lineWidth = lw;
	ctx.stroke();

	// Mast
	strokeWobblyLine(ctx, 0, 0, 0, -s * 0.55, s * 0.015, lw * 0.8, 4, seed + 100);

	// Triangular sail
	ctx.beginPath();
	ctx.moveTo(0, -s * 0.5);
	ctx.lineTo(s * 0.3, -s * 0.1);
	ctx.lineTo(0, -s * 0.05);
	ctx.closePath();
	ctx.lineWidth = lw * 0.7;
	ctx.stroke();

	// Pennant at top
	ctx.beginPath();
	ctx.moveTo(0, -s * 0.55);
	ctx.lineTo(s * 0.15, -s * 0.52);
	ctx.lineTo(0, -s * 0.48);
	ctx.lineWidth = lw * 0.5;
	ctx.stroke();

	// Wavy waterlines below hull
	const waveY = s * 0.32;
	for (let w = 0; w < 2; w++) {
		const wy = waveY + w * s * 0.1;
		const ww = s * 0.3 - w * s * 0.08;
		ctx.beginPath();
		ctx.moveTo(-ww, wy);
		ctx.quadraticCurveTo(-ww * 0.5, wy - s * 0.06, 0, wy);
		ctx.quadraticCurveTo(ww * 0.5, wy + s * 0.06, ww, wy);
		ctx.lineWidth = lw * 0.5;
		ctx.stroke();
	}
}

function drawReef(ctx: CanvasRenderingContext2D, s: number, color: string, seed: number) {
	const rng = mulberry32(seed);
	ctx.fillStyle = color;

	if (s < 8) {
		// Simplified: 3 dots batched
		ctx.beginPath();
		for (let i = 0; i < 3; i++) {
			const dx = (rng() - 0.5) * s * 0.5, dy = (rng() - 0.5) * s * 0.5;
			ctx.moveTo(dx + s * 0.1, dy);
			ctx.arc(dx, dy, s * 0.1, 0, Math.PI * 2);
		}
		ctx.fill();
		return;
	}

	// Stippled dot cluster — 8–12 dots in elliptical scatter (classic shoal notation)
	const dotCount = 8 + Math.floor(rng() * 5);
	const rx = s * 0.4, ry = s * 0.25;
	ctx.beginPath();
	for (let i = 0; i < dotCount; i++) {
		// Use rejection sampling for elliptical distribution
		let dx: number, dy: number;
		do {
			dx = (rng() - 0.5) * 2;
			dy = (rng() - 0.5) * 2;
		} while (dx * dx + dy * dy > 1);
		const dotR = s * 0.03 + rng() * s * 0.04;
		ctx.moveTo(dx * rx + dotR, dy * ry);
		ctx.arc(dx * rx, dy * ry, dotR, 0, Math.PI * 2);
	}
	ctx.fill();
}
