import { UMAP } from "umap-js";
import { decodeFloat32 } from "./cache";
import type { NoteCache } from "./cache";

function euclideanDistF32(a: Float32Array, b: Float32Array): number {
	let sum = 0;
	for (let i = 0; i < a.length; i++) {
		const d = a[i] - b[i];
		sum += d * d;
	}
	return Math.sqrt(sum);
}

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

/**
 * Place new notes onto an existing locked map via inverse-distance weighted
 * interpolation from their k nearest neighbours in embedding space.
 */
export function interpolateNewPoints(
	notes: Record<string, NoteCache>,
	newPaths: string[],
	kNeighbors = 5,
): LayoutPoint[] {
	// Build anchor list: notes that already have both embedding and x,y
	const anchors: { path: string; embedding: Float32Array; x: number; y: number }[] = [];
	for (const [path, n] of Object.entries(notes)) {
		if (n.embedding && n.x != null && n.y != null) {
			anchors.push({ path, embedding: decodeFloat32(n.embedding), x: n.x, y: n.y });
		}
	}

	if (anchors.length === 0) return [];

	const k = Math.min(kNeighbors, anchors.length);
	const results: LayoutPoint[] = [];

	for (const path of newPaths) {
		const note = notes[path];
		if (!note?.embedding) continue;
		const vec = decodeFloat32(note.embedding);

		// Find k-nearest anchors by euclidean distance in embedding space
		const dists: { idx: number; dist: number }[] = [];
		for (let i = 0; i < anchors.length; i++) {
			dists.push({ idx: i, dist: euclideanDistF32(vec, anchors[i].embedding) });
		}
		dists.sort((a, b) => a.dist - b.dist);
		const nearest = dists.slice(0, k);

		// Inverse-distance weighted average
		let totalW = 0;
		let wx = 0, wy = 0;
		for (const { idx, dist } of nearest) {
			const w = dist < 1e-9 ? 1e9 : 1 / dist;
			totalW += w;
			wx += anchors[idx].x * w;
			wy += anchors[idx].y * w;
		}

		results.push({ path, x: wx / totalW, y: wy / totalW });
	}

	return results;
}
