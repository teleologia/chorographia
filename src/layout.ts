import { UMAP } from "umap-js";
import { decodeFloat32 } from "./cache";
import type { NoteCache } from "./cache";

// Mulberry32 deterministic PRNG
function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export interface LayoutPoint {
	path: string;
	x: number;
	y: number;
}

export function computeLayout(
	notes: Record<string, NoteCache>,
	seed = 42
): LayoutPoint[] {
	const paths: string[] = [];
	const vectors: Float32Array[] = [];

	for (const [path, note] of Object.entries(notes)) {
		if (!note.embedding) continue;
		paths.push(path);
		vectors.push(decodeFloat32(note.embedding));
	}

	if (paths.length < 2) {
		return paths.map((p) => ({ path: p, x: 0, y: 0 }));
	}

	// Convert to number[][] for umap-js
	const data: number[][] = vectors.map((v) => Array.from(v));

	const nNeighbors = Math.min(15, paths.length - 1);

	const umap = new UMAP({
		nComponents: 2,
		nNeighbors,
		minDist: 0.15,
		spread: 1.0,
		random: mulberry32(seed),
	});

	const coords = umap.fit(data);

	// Normalize to [-1, 1]
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;
	for (const [x, y] of coords) {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}
	const rangeX = maxX - minX || 1;
	const rangeY = maxY - minY || 1;

	return paths.map((path, i) => ({
		path,
		x: ((coords[i][0] - minX) / rangeX) * 2 - 1,
		y: ((coords[i][1] - minY) / rangeY) * 2 - 1,
	}));
}
