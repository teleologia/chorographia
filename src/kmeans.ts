import { mulberry32 } from "./rng";

function euclideanDist(a: Float32Array, b: Float32Array): number {
	let sum = 0;
	for (let i = 0; i < a.length; i++) {
		const d = a[i] - b[i];
		sum += d * d;
	}
	return Math.sqrt(sum);
}

function nearestCenter(v: Float32Array, centers: Float32Array[]): { idx: number; dist: number } {
	let bestIdx = 0;
	let bestDist = Infinity;
	for (let c = 0; c < centers.length; c++) {
		const d = euclideanDist(v, centers[c]);
		if (d < bestDist) {
			bestDist = d;
			bestIdx = c;
		}
	}
	return { idx: bestIdx, dist: bestDist };
}

/**
 * K-means clustering with k-means++ initialization.
 * Returns cluster assignment index per vector.
 */
export function kMeans(vectors: Float32Array[], k: number, seed = 42): number[] {
	const n = vectors.length;
	if (n === 0) return [];
	if (k >= n) return vectors.map((_, i) => i);

	const rng = mulberry32(seed);
	const dim = vectors[0].length;

	// --- k-means++ initialization ---
	const centers: Float32Array[] = [];

	// Pick first center randomly
	centers.push(new Float32Array(vectors[Math.floor(rng() * n)]));

	for (let c = 1; c < k; c++) {
		// Compute distances to nearest existing center
		const dists = new Float64Array(n);
		let totalDist = 0;
		for (let i = 0; i < n; i++) {
			const { dist } = nearestCenter(vectors[i], centers);
			dists[i] = dist * dist; // squared distance for probability weighting
			totalDist += dists[i];
		}

		// Weighted random pick
		let r = rng() * totalDist;
		let picked = 0;
		for (let i = 0; i < n; i++) {
			r -= dists[i];
			if (r <= 0) { picked = i; break; }
		}
		centers.push(new Float32Array(vectors[picked]));
	}

	// --- iterate ---
	const assignments = new Int32Array(n);
	const MAX_ITER = 100;

	for (let iter = 0; iter < MAX_ITER; iter++) {
		// Assign each vector to nearest center
		let changed = false;
		for (let i = 0; i < n; i++) {
			const { idx } = nearestCenter(vectors[i], centers);
			if (idx !== assignments[i]) {
				assignments[i] = idx;
				changed = true;
			}
		}

		if (!changed && iter > 0) break;

		// Recompute centers
		const sums: Float64Array[] = [];
		const counts = new Int32Array(k);
		for (let c = 0; c < k; c++) sums.push(new Float64Array(dim));

		for (let i = 0; i < n; i++) {
			const c = assignments[i];
			counts[c]++;
			const vec = vectors[i];
			const sum = sums[c];
			for (let d = 0; d < dim; d++) sum[d] += vec[d];
		}

		for (let c = 0; c < k; c++) {
			if (counts[c] === 0) continue;
			const center = new Float32Array(dim);
			const sum = sums[c];
			for (let d = 0; d < dim; d++) center[d] = sum[d] / counts[c];
			centers[c] = center;
		}
	}

	return Array.from(assignments);
}
