// Mulberry32 deterministic PRNG (same as layout.ts)
function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

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

export interface KMeansResult {
	assignments: number[];
	centroids: Float32Array[];
}

export interface SemanticAssignment {
	semA: number;  // nearest cluster
	semB: number;  // second-nearest cluster
	semW: number;  // weight bucket 1-5 (1=strongly A, 5=strongly B)
}

/**
 * K-means clustering with k-means++ initialization.
 * Returns cluster assignments and final centroids.
 */
export function kMeans(vectors: Float32Array[], k: number, seed = 42): KMeansResult {
	const n = vectors.length;
	if (n === 0) return { assignments: [], centroids: [] };
	if (k >= n) return { assignments: vectors.map((_, i) => i), centroids: vectors.map((v) => new Float32Array(v)) };

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

	return { assignments: Array.from(assignments), centroids: centers };
}

/**
 * For each vector, find the two nearest centroids and compute a weight bucket.
 */
export function computeSemanticAssignments(
	vectors: Float32Array[],
	centroids: Float32Array[]
): SemanticAssignment[] {
	if (centroids.length === 0) return vectors.map(() => ({ semA: -1, semB: -1, semW: 3 }));

	return vectors.map((v) => {
		let bestIdx = 0, bestDist = Infinity;
		let secondIdx = 0, secondDist = Infinity;
		for (let c = 0; c < centroids.length; c++) {
			const d = euclideanDist(v, centroids[c]);
			if (d < bestDist) {
				secondDist = bestDist;
				secondIdx = bestIdx;
				bestDist = d;
				bestIdx = c;
			} else if (d < secondDist) {
				secondDist = d;
				secondIdx = c;
			}
		}
		// ratio: 0 = exactly at A, 1 = equidistant (or closer to B shouldn't happen)
		const ratio = secondDist > 0 ? bestDist / secondDist : 0;
		const semW = ratio < 0.2 ? 1 : ratio < 0.4 ? 2 : ratio < 0.6 ? 3 : ratio < 0.8 ? 4 : 5;
		return { semA: bestIdx, semB: secondIdx, semW };
	});
}
