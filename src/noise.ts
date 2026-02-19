// Seeded 2D value noise, fBm, and domain warping.
// All deterministic from seed — no Math.random().

function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Pre-build a permutation table from a seed for fast lattice lookups
function buildPermTable(seed: number): Uint16Array {
	const size = 512;
	const perm = new Uint16Array(size);
	const rng = mulberry32(seed);
	// Fill 0..255
	for (let i = 0; i < 256; i++) perm[i] = i;
	// Fisher-Yates shuffle
	for (let i = 255; i > 0; i--) {
		const j = (rng() * (i + 1)) | 0;
		const tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp;
	}
	// Mirror into second half
	for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
	return perm;
}

// Pre-build a gradient table (random unit-ish values per lattice point)
function buildGradTable(seed: number): Float64Array {
	const rng = mulberry32(seed ^ 0x12345678);
	const grads = new Float64Array(256);
	for (let i = 0; i < 256; i++) grads[i] = rng() * 2 - 1;
	return grads;
}

function smootherstep(t: number): number {
	return t * t * t * (t * (t * 6 - 15) + 10);
}

/** 2D value noise in [-1, 1] range, seeded via permutation table. */
export function valueNoise2D(
	x: number, y: number,
	perm: Uint16Array, grads: Float64Array,
): number {
	const xi = Math.floor(x);
	const yi = Math.floor(y);
	const xf = x - xi;
	const yf = y - yi;

	const u = smootherstep(xf);
	const v = smootherstep(yf);

	const ix = xi & 255;
	const iy = yi & 255;

	const v00 = grads[perm[perm[ix] + iy] & 255];
	const v10 = grads[perm[perm[(ix + 1) & 255] + iy] & 255];
	const v01 = grads[perm[perm[ix] + ((iy + 1) & 255)] & 255];
	const v11 = grads[perm[perm[(ix + 1) & 255] + ((iy + 1) & 255)] & 255];

	const a = v00 + u * (v10 - v00);
	const b = v01 + u * (v11 - v01);
	return a + v * (b - a);
}

/** Fractional Brownian motion — layered value noise. */
export function fbm2D(
	x: number, y: number,
	octaves: number,
	lacunarity: number,
	persistence: number,
	perm: Uint16Array,
	grads: Float64Array,
): number {
	let value = 0;
	let amp = 1;
	let freq = 1;
	let maxAmp = 0;

	for (let i = 0; i < octaves; i++) {
		value += amp * valueNoise2D(x * freq, y * freq, perm, grads);
		maxAmp += amp;
		amp *= persistence;
		freq *= lacunarity;
	}

	return value / maxAmp;
}

/** Domain warp: displace (x, y) by fbm noise. Returns warped coordinates. */
export function domainWarp(
	x: number, y: number,
	amplitude: number,
	frequency: number,
	perm1: Uint16Array, grads1: Float64Array,
	perm2: Uint16Array, grads2: Float64Array,
): { x: number; y: number } {
	const wx = fbm2D(x * frequency, y * frequency, 4, 2.0, 0.5, perm1, grads1);
	const wy = fbm2D(x * frequency + 7.31, y * frequency + 3.77, 4, 2.0, 0.5, perm2, grads2);
	return {
		x: x + amplitude * wx,
		y: y + amplitude * wy,
	};
}

export interface NoiseContext {
	perm1: Uint16Array;
	grads1: Float64Array;
	perm2: Uint16Array;
	grads2: Float64Array;
}

/** Build noise lookup tables from a single seed. */
export function createNoiseContext(seed: number): NoiseContext {
	return {
		perm1: buildPermTable(seed),
		grads1: buildGradTable(seed),
		perm2: buildPermTable(seed ^ 0xDEADBEEF),
		grads2: buildGradTable(seed ^ 0xCAFEBABE),
	};
}
