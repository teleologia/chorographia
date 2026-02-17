import { UMAP } from "umap-js";
import { decodeFloat32 } from "./cache";
import type { NoteCache } from "./cache";
import { mulberry32 } from "./rng";

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
