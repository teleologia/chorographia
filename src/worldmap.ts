// Worldmap v2 — Polygonal base mesh pipeline.
// Generates thousands of Voronoi cells, assigns land/ocean + countries,
// extracts borders, applies fractal + Chaikin smoothing, assembles polygons.

import type { Point2D, Bounds, VoronoiMesh } from "./delaunay";
import { voronoiFromDelaunay } from "./delaunay";
import { createNoiseContext, domainWarp } from "./noise";
import type { NoiseContext } from "./noise";
import type { Zone, Continent, WorldMapResult, BorderEdge, WorldMapSettings } from "./zones";

// ---------- PRNG ----------

function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// ---------- Convex hull (Graham scan) ----------

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

// ---------- MapPointLike ----------

interface MapPointLike {
	path: string;
	x: number;
	y: number;
	folder: string;
	cat: string;
}

const SEM_PALETTE = [
	"#00D6FF", "#B9FF00", "#FF7A00", "#A855F7",
	"#00FFB3", "#FF3DB8", "#00FFA3", "#FFD400",
	"#00F5D4", "#FF9A3D", "#7CFFCB", "#B8C0FF",
];

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

// ---------- Phase 2a: Mesh Generation ----------

function hashPoints(dataPoints: Point2D[]): number {
	let h = 0;
	for (const p of dataPoints) {
		h = (h * 31 + ((p.x * 100000) | 0)) | 0;
		h = (h * 31 + ((p.y * 100000) | 0)) | 0;
	}
	return Math.abs(h) >>> 0;
}

function generateMesh(
	dataPoints: Point2D[],
	dataBounds: Bounds,
	meshDensity: number,
): { mesh: VoronoiMesh; sentinelStart: number; meshBounds: Bounds } {
	const seed = hashPoints(dataPoints);
	const rng = mulberry32(seed);

	const rangeX = dataBounds.maxX - dataBounds.minX || 0.01;
	const rangeY = dataBounds.maxY - dataBounds.minY || 0.01;

	// Expand by 30%
	const expand = 0.30;
	const meshBounds: Bounds = {
		minX: dataBounds.minX - rangeX * expand,
		minY: dataBounds.minY - rangeY * expand,
		maxX: dataBounds.maxX + rangeX * expand,
		maxY: dataBounds.maxY + rangeY * expand,
	};

	const mRangeX = meshBounds.maxX - meshBounds.minX;
	const mRangeY = meshBounds.maxY - meshBounds.minY;

	// Jittered grid — ~meshDensity points
	const aspect = mRangeX / mRangeY;
	const ny = Math.round(Math.sqrt(meshDensity / aspect));
	const nx = Math.round(ny * aspect);
	const cellW = mRangeX / nx;
	const cellH = mRangeY / ny;
	const jitter = 0.4;

	const gridPoints: number[] = []; // flat x,y pairs
	for (let iy = 0; iy < ny; iy++) {
		for (let ix = 0; ix < nx; ix++) {
			const bx = meshBounds.minX + (ix + 0.5) * cellW;
			const by = meshBounds.minY + (iy + 0.5) * cellH;
			const jx = (rng() - 0.5) * 2 * jitter * cellW;
			const jy = (rng() - 0.5) * 2 * jitter * cellH;
			gridPoints.push(bx + jx, by + jy);
		}
	}

	const sentinelStart = gridPoints.length / 2;

	// Add 16 sentinel points at 3× data extent (ring around bounds)
	const sentinelDist = Math.max(rangeX, rangeY) * 3;
	const cxData = (dataBounds.minX + dataBounds.maxX) / 2;
	const cyData = (dataBounds.minY + dataBounds.maxY) / 2;
	for (let i = 0; i < 16; i++) {
		const angle = (i / 16) * Math.PI * 2;
		gridPoints.push(
			cxData + Math.cos(angle) * sentinelDist,
			cyData + Math.sin(angle) * sentinelDist,
		);
	}

	// Expand mesh bounds to encompass sentinel points
	const fullBounds: Bounds = {
		minX: meshBounds.minX - sentinelDist,
		minY: meshBounds.minY - sentinelDist,
		maxX: meshBounds.maxX + sentinelDist,
		maxY: meshBounds.maxY + sentinelDist,
	};

	const coords = new Float64Array(gridPoints);
	const totalCount = gridPoints.length / 2;
	const mesh = voronoiFromDelaunay(coords, totalCount, fullBounds);

	return { mesh, sentinelStart, meshBounds };
}

// ---------- Phase 2b+c: Unified Land/Ocean + Country Assignment ----------
//
// Merges density and country assignment into a single pass.
// Instead of assigning cells to the nearest 2D cluster centroid (which can
// land in empty space when UMAP splits a cluster), we inherit the cluster ID
// of the nearest actual note. This eliminates "ghost countries" with zero notes.
// An absolute density threshold replaces the percentile quota, so land tightly
// wraps populated areas and empty voids become ocean.

function assignTerrainAndCountries(
	mesh: VoronoiMesh,
	dataPoints: Point2D[],
	noteClusterIds: number[],
	sentinelStart: number,
	noiseCtx: NoiseContext,
	dataBounds: Bounds,
	wmSettings?: WorldMapSettings,
): { isLand: boolean[]; cellAssignments: number[] } {
	const n = mesh.cellCount;
	const isLand = new Array<boolean>(n);
	const cellAssignments = new Array<number>(n);
	const rangeX = dataBounds.maxX - dataBounds.minX || 0.01;
	const rangeY = dataBounds.maxY - dataBounds.minY || 0.01;
	const dataRange = Math.max(rangeX, rangeY);

	// Settings-driven parameters (with defaults)
	const unity = wmSettings?.unity ?? 0.07;
	const landThreshold = wmSettings?.seaLevel ?? 0.20; // now a percentage of peak
	const ruggedness = wmSettings?.ruggedness ?? 0.4;

	const sigma = dataRange * unity;
	const invSigma2 = -1 / (sigma * sigma);
	const cutoffSq = (sigma * 3) * (sigma * 3); // beyond 3σ, Gaussian ≈ 0

	// Domain warp — ruggedness scales the warp intensity
	const warpAmplitude = sigma * ruggedness;
	const warpFrequency = 3.0 / dataRange;

	// Pre-pass: find peak density (normalization factor).
	// As unity (sigma) shrinks, peaks shrink too — threshold tracks them down,
	// so islands never vanish, only bridges snap.
	let maxObservedHeat = 0.0001; // avoid div-by-zero
	for (let i = 0; i < sentinelStart && i < n; i += 15) {
		let d = 0;
		const c = mesh.cellCentroids[i];
		for (let j = 0; j < dataPoints.length; j++) {
			const dx = c.x - dataPoints[j].x;
			const dy = c.y - dataPoints[j].y;
			const dSq = dx * dx + dy * dy;
			if (dSq < cutoffSq) d += Math.exp(dSq * invSigma2);
		}
		if (d > maxObservedHeat) maxObservedHeat = d;
	}

	// Dynamic sea level: percentage of the observed peak height
	const effectiveThreshold = maxObservedHeat * landThreshold;


	for (let i = 0; i < n; i++) {
		if (i >= sentinelStart) {
			isLand[i] = false;
			cellAssignments[i] = -1;
			continue;
		}

		const c = mesh.cellCentroids[i];
		const warped = domainWarp(
			c.x, c.y,
			warpAmplitude, warpFrequency,
			noiseCtx.perm1, noiseCtx.grads1,
			noiseCtx.perm2, noiseCtx.grads2,
		);

		// Accumulate capped heat per cluster
		let totalDensity = 0;
		const clusterHeat: Record<number, number> = {};

		for (let j = 0; j < dataPoints.length; j++) {
			const dx = warped.x - dataPoints[j].x;
			const dy = warped.y - dataPoints[j].y;
			const dSq = dx * dx + dy * dy;

			if (dSq > cutoffSq) continue;

			const heat = Math.exp(dSq * invSigma2);
			const cid = noteClusterIds[j];
			totalDensity += heat;
			clusterHeat[cid] = (clusterHeat[cid] || 0) + heat;
		}

		if (totalDensity >= effectiveThreshold) {
			isLand[i] = true;
			let maxHeat = 0;
			let winner = -1;
			for (const id in clusterHeat) {
				if (clusterHeat[id] > maxHeat) {
					maxHeat = clusterHeat[id];
					winner = Number(id);
				}
			}
			cellAssignments[i] = winner;
		} else {
			isLand[i] = false;
			cellAssignments[i] = -1;
		}
	}

	return { isLand, cellAssignments };
}

// ---------- Phase 2d: Disconnected Zone Healing ----------

function healDisconnected(
	mesh: VoronoiMesh,
	assignments: number[],
	isLand: boolean[],
): void {
	const n = mesh.cellCount;
	const clusterIds = new Set<number>();
	for (let i = 0; i < n; i++) {
		if (assignments[i] >= 0) clusterIds.add(assignments[i]);
	}

	for (const clusterId of clusterIds) {
		const cells: number[] = [];
		for (let i = 0; i < n; i++) {
			if (assignments[i] === clusterId) cells.push(i);
		}
		if (cells.length <= 1) continue;

		const cellSet = new Set(cells);
		const visited = new Set<number>();
		const components: number[][] = [];

		for (const start of cells) {
			if (visited.has(start)) continue;
			const component: number[] = [];
			const queue = [start];
			visited.add(start);
			while (queue.length > 0) {
				const cur = queue.pop()!;
				component.push(cur);
				for (const nb of mesh.adjacency[cur]) {
					if (!visited.has(nb) && cellSet.has(nb)) {
						visited.add(nb);
						queue.push(nb);
					}
				}
			}
			components.push(component);
		}

		if (components.length <= 1) continue;

		let maxSize = 0, maxIdx = 0;
		for (let i = 0; i < components.length; i++) {
			if (components[i].length > maxSize) {
				maxSize = components[i].length;
				maxIdx = i;
			}
		}

		for (let i = 0; i < components.length; i++) {
			if (i === maxIdx) continue;
			const orphan = components[i];

			let touchesOcean = false;
			for (const cell of orphan) {
				for (const nb of mesh.adjacency[cell]) {
					if (!isLand[nb]) { touchesOcean = true; break; }
				}
				if (touchesOcean) break;
			}

			if (touchesOcean) continue;

			const neighborCounts = new Map<number, number>();
			for (const cell of orphan) {
				for (const nb of mesh.adjacency[cell]) {
					const nba = assignments[nb];
					if (nba >= 0 && nba !== clusterId) {
						neighborCounts.set(nba, (neighborCounts.get(nba) || 0) + 1);
					}
				}
			}

			let bestNeighbor = -1, bestCount = 0;
			for (const [nId, count] of neighborCounts) {
				if (count > bestCount) { bestCount = count; bestNeighbor = nId; }
			}

			if (bestNeighbor >= 0) {
				for (const cell of orphan) assignments[cell] = bestNeighbor;
			}
		}
	}
}

// ---------- Phase 2e: Border Extraction ----------

interface EdgeSegment {
	v0: Point2D;
	v1: Point2D;
	leftZone: number;
	rightZone: number;
	edgeType: "coast" | "border" | "province";
}

function vKey(p: Point2D): string {
	return `${Math.round(p.x * 1e6)}_${Math.round(p.y * 1e6)}`;
}

function findSharedEdge(
	polyA: Point2D[],
	polyB: Point2D[],
): { v0: Point2D; v1: Point2D } | null {
	const eps = 1e-8;
	const sharedVerts: Point2D[] = [];

	for (const a of polyA) {
		for (const b of polyB) {
			if (Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps) {
				let dup = false;
				for (const s of sharedVerts) {
					if (Math.abs(s.x - a.x) < eps && Math.abs(s.y - a.y) < eps) { dup = true; break; }
				}
				if (!dup) sharedVerts.push(a);
			}
		}
	}

	if (sharedVerts.length >= 2) {
		return { v0: sharedVerts[0], v1: sharedVerts[1] };
	}
	return null;
}

function extractBorderSegments(
	mesh: VoronoiMesh,
	assignments: number[],
	subDomains: number[],
): EdgeSegment[] {
	const n = mesh.cellCount;
	const segments: EdgeSegment[] = [];
	const visited = new Set<string>();

	for (let i = 0; i < n; i++) {
		for (const j of mesh.adjacency[i]) {
			if (j <= i) continue;

			const domI = assignments[i];
			const domJ = assignments[j];
			const subI = subDomains[i];
			const subJ = subDomains[j];

			// Classify edge type
			let edgeType: "coast" | "border" | "province" | null = null;
			if (domI === -1 || domJ === -1) {
				// One side is ocean
				if (domI !== domJ) edgeType = "coast";
			} else if (domI !== domJ) {
				edgeType = "border";
			} else if (subI !== subJ && subI >= 0 && subJ >= 0) {
				edgeType = "province";
			}

			if (!edgeType) continue; // internal cell wall — skip

			const key = `${Math.min(i, j)}_${Math.max(i, j)}`;
			if (visited.has(key)) continue;
			visited.add(key);

			const shared = findSharedEdge(mesh.cellPolygons[i], mesh.cellPolygons[j]);
			if (shared) {
				segments.push({
					v0: shared.v0, v1: shared.v1,
					leftZone: domI,
					rightZone: domJ,
					edgeType,
				});
			}
		}
	}

	return segments;
}

/** Chain edge segments sharing the same (leftZone, rightZone) pair into polylines. */
function chainSegments(segs: EdgeSegment[]): Point2D[][] {
	if (segs.length === 0) return [];

	const vertSegs = new Map<string, { segIdx: number; otherEnd: Point2D }[]>();
	for (let i = 0; i < segs.length; i++) {
		const k0 = vKey(segs[i].v0);
		const k1 = vKey(segs[i].v1);
		if (!vertSegs.has(k0)) vertSegs.set(k0, []);
		if (!vertSegs.has(k1)) vertSegs.set(k1, []);
		vertSegs.get(k0)!.push({ segIdx: i, otherEnd: segs[i].v1 });
		vertSegs.get(k1)!.push({ segIdx: i, otherEnd: segs[i].v0 });
	}

	const usedSegs = new Set<number>();
	const chains: Point2D[][] = [];

	for (let startSeg = 0; startSeg < segs.length; startSeg++) {
		if (usedSegs.has(startSeg)) continue;

		const chain: Point2D[] = [segs[startSeg].v0, segs[startSeg].v1];
		usedSegs.add(startSeg);

		let done = false;
		while (!done) {
			done = true;
			const lastKey = vKey(chain[chain.length - 1]);
			const candidates = vertSegs.get(lastKey);
			if (candidates) {
				for (const c of candidates) {
					if (!usedSegs.has(c.segIdx)) {
						usedSegs.add(c.segIdx);
						chain.push(c.otherEnd);
						done = false;
						break;
					}
				}
			}
		}

		done = false;
		while (!done) {
			done = true;
			const firstKey = vKey(chain[0]);
			const candidates = vertSegs.get(firstKey);
			if (candidates) {
				for (const c of candidates) {
					if (!usedSegs.has(c.segIdx)) {
						usedSegs.add(c.segIdx);
						chain.unshift(c.otherEnd);
						done = false;
						break;
					}
				}
			}
		}

		chains.push(chain);
	}

	return chains;
}

// ---------- Phase 2f: Edge Detail + Smoothing ----------

function fractalDisplaceEdge(
	pts: Point2D[],
	iterations: number,
	amplitude: number,
	seed: number,
): Point2D[] {
	if (pts.length < 2 || iterations <= 0) return pts;

	let current = pts;
	for (let iter = 0; iter < iterations; iter++) {
		const next: Point2D[] = [];
		const amp = amplitude / Math.pow(2, iter);

		for (let i = 0; i < current.length - 1; i++) {
			const a = current[i];
			const b = current[i + 1];
			next.push(a);

			const mx = (a.x + b.x) / 2;
			const my = (a.y + b.y) / 2;
			const dx = b.x - a.x, dy = b.y - a.y;
			const len = Math.sqrt(dx * dx + dy * dy);
			if (len < 1e-10) continue;

			const px = -dy / len, py = dx / len;

			// Canonical seed from sorted endpoints so shared borders match
			let p0 = a, p1 = b;
			if (a.x > b.x || (a.x === b.x && a.y > b.y)) { p0 = b; p1 = a; }
			const edgeHash = (
				(Math.round(p0.x * 100000) * 73856093) ^
				(Math.round(p0.y * 100000) * 19349663) ^
				(Math.round(p1.x * 100000) * 83492791) ^
				(Math.round(p1.y * 100000) * 45989861)
			) >>> 0;
			const rng = mulberry32(edgeHash + iter * 7919);
			const disp = (rng() - 0.5) * 2 * amp;

			next.push({ x: mx + px * disp, y: my + py * disp });
		}
		next.push(current[current.length - 1]);
		current = next;
	}

	return current;
}

function chaikinSubdivideOpen(pts: Point2D[], iterations: number): Point2D[] {
	if (pts.length < 3) return pts;
	let current = pts;

	for (let iter = 0; iter < iterations; iter++) {
		const next: Point2D[] = [];
		next.push(current[0]); // lock first point

		for (let i = 0; i < current.length - 1; i++) {
			const a = current[i];
			const b = current[i + 1];
			if (i > 0) {
				next.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
			}
			if (i < current.length - 2) {
				next.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
			}
		}

		next.push(current[current.length - 1]); // lock last point
		current = next;
	}

	return current;
}

/** Chaikin subdivision for CLOSED polygons. */
function chaikinSubdivideClosed(pts: Point2D[], iterations: number): Point2D[] {
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

function buildBorderEdges(
	segments: EdgeSegment[],
	dataRange: number,
): BorderEdge[] {
	// Group segments by (domain pair, edge type) to keep province edges separate
	const pairMap = new Map<string, EdgeSegment[]>();
	for (const seg of segments) {
		const left = Math.min(seg.leftZone, seg.rightZone);
		const right = Math.max(seg.leftZone, seg.rightZone);
		const key = `${left}_${right}_${seg.edgeType}`;
		if (!pairMap.has(key)) pairMap.set(key, []);
		pairMap.get(key)!.push(seg);
	}

	const borderEdges: BorderEdge[] = [];
	const amplitude = dataRange * 0.008;

	for (const [_key, segs] of pairMap) {
		if (segs.length === 0) continue;

		const edgeType = segs[0].edgeType;
		const chains = chainSegments(segs);

		for (const chain of chains) {
			if (chain.length < 2) continue;

			// Fractal displacement with canonical seed
			const seed = (
				(Math.round(chain[0].x * 100000) * 73856093) ^
				(Math.round(chain[0].y * 100000) * 19349663) ^
				(Math.round(chain[chain.length - 1].x * 100000) * 83492791) ^
				(Math.round(chain[chain.length - 1].y * 100000) * 45989861)
			) >>> 0;

			// Province edges get less fractal displacement
			const amp = edgeType === "province" ? amplitude * 0.6 : amplitude;
			let pts = fractalDisplaceEdge(chain, 3, amp, seed);
			pts = chaikinSubdivideOpen(pts, 2);

			borderEdges.push({
				vertices: pts,
				leftZone: Math.min(segs[0].leftZone, segs[0].rightZone),
				rightZone: Math.max(segs[0].leftZone, segs[0].rightZone),
				edgeType,
			});
		}
	}

	return borderEdges;
}

// ---------- Phase 2g: Coastline Extraction ----------

/**
 * Extract ordered coastline polygon for a set of land cells.
 * Walks the boundary edges of the land cells in winding order.
 */
function extractCoastline(
	mesh: VoronoiMesh,
	landCells: Set<number>,
): Point2D[] {
	const eps = 1e-6;

	// Collect ALL boundary edges (cell polygon edges where the neighbor is NOT in landCells)
	const boundaryEdges: { v0: Point2D; v1: Point2D }[] = [];

	for (const cellIdx of landCells) {
		const poly = mesh.cellPolygons[cellIdx];
		if (!poly || poly.length < 3) continue;

		for (let i = 0; i < poly.length; i++) {
			const v0 = poly[i];
			const v1 = poly[(i + 1) % poly.length];

			// Check if any same-land neighbor shares this edge
			let isInternal = false;
			for (const nb of mesh.adjacency[cellIdx]) {
				if (landCells.has(nb)) {
					const nbPoly = mesh.cellPolygons[nb];
					if (nbPoly && sharesEdge(v0, v1, nbPoly, eps)) {
						isInternal = true;
						break;
					}
				}
			}

			if (!isInternal) {
				// Keep the directed edge (winding order matches cell polygon winding)
				boundaryEdges.push({ v0, v1 });
			}
		}
	}

	if (boundaryEdges.length === 0) return [];

	// Build adjacency: v1 of one edge → v0 of the next edge
	// Since boundary edges come from consistently-wound cell polygons,
	// chaining v1→v0 should produce a closed polygon.
	const fromV1 = new Map<string, { v0: Point2D; v1: Point2D; idx: number }[]>();
	for (let i = 0; i < boundaryEdges.length; i++) {
		const key = vKey(boundaryEdges[i].v1);
		if (!fromV1.has(key)) fromV1.set(key, []);
		fromV1.get(key)!.push({ ...boundaryEdges[i], idx: i });
	}

	// Walk the directed chain
	const used = new Set<number>();
	const result: Point2D[] = [];
	const start = boundaryEdges[0];
	result.push(start.v0);
	used.add(0);
	let current = start.v1;
	result.push(current);

	for (let step = 0; step < boundaryEdges.length; step++) {
		const key = vKey(current);
		const candidates = fromV1.get(key);
		if (!candidates) break;
		let found = false;
		for (const c of candidates) {
			if (!used.has(c.idx)) {
				// The next edge's v0 should match our current v1
				// In fromV1 we indexed by v1, but we need the edge whose v0 matches current
				// Actually we need: an edge whose v0 == current
				// Let me fix the lookup: we should index by v0
			}
		}
		if (!found) break;
	}

	// Actually, let me redo this properly: index by v0 to find the next edge
	const fromV0 = new Map<string, { v0: Point2D; v1: Point2D; idx: number }[]>();
	for (let i = 0; i < boundaryEdges.length; i++) {
		const key = vKey(boundaryEdges[i].v0);
		if (!fromV0.has(key)) fromV0.set(key, []);
		fromV0.get(key)!.push({ ...boundaryEdges[i], idx: i });
	}

	// Redo the walk
	const result2: Point2D[] = [];
	const used2 = new Set<number>();
	result2.push(boundaryEdges[0].v0);
	used2.add(0);
	let cur = boundaryEdges[0].v1;
	result2.push(cur);

	for (let step = 0; step < boundaryEdges.length; step++) {
		const key = vKey(cur);
		const candidates = fromV0.get(key);
		if (!candidates) break;
		let found = false;
		for (const c of candidates) {
			if (!used2.has(c.idx)) {
				used2.add(c.idx);
				cur = c.v1;
				result2.push(cur);
				found = true;
				break;
			}
		}
		if (!found) break;
	}

	return result2;
}

function sharesEdge(v0: Point2D, v1: Point2D, poly: Point2D[], eps: number): boolean {
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		if (
			(Math.abs(v0.x - a.x) < eps && Math.abs(v0.y - a.y) < eps &&
			 Math.abs(v1.x - b.x) < eps && Math.abs(v1.y - b.y) < eps) ||
			(Math.abs(v0.x - b.x) < eps && Math.abs(v0.y - b.y) < eps &&
			 Math.abs(v1.x - a.x) < eps && Math.abs(v1.y - a.y) < eps)
		) {
			return true;
		}
	}
	return false;
}

// ---------- Phase 2h: Assembly ----------

function assembleResult(
	mesh: VoronoiMesh,
	assignments: number[],
	isLand: boolean[],
	subDomains: number[],
	clusterIds: number[],
	memberPathsByCluster: Map<number, MapPointLike[]>,
	borderEdges: BorderEdge[],
	dataRange: number,
): WorldMapResult {
	const zones: Zone[] = [];

	for (const clusterId of clusterIds) {
		const members = memberPathsByCluster.get(clusterId);
		if (!members || members.length === 0) continue;

		// Collect individual cell polygons for this cluster, grouped by sub-domain
		const cellPolys: Point2D[][] = [];
		const allVerts: Point2D[] = [];
		const subDomainCellsMap = new Map<number, Point2D[][]>();
		for (let i = 0; i < mesh.cellCount; i++) {
			if (assignments[i] === clusterId) {
				const poly = mesh.cellPolygons[i];
				if (poly && poly.length >= 3) {
					cellPolys.push(poly);
					for (const v of poly) allVerts.push(v);
					const sub = subDomains[i];
					if (!subDomainCellsMap.has(sub)) subDomainCellsMap.set(sub, []);
					subDomainCellsMap.get(sub)!.push(poly);
				}
			}
		}

		if (cellPolys.length === 0) continue;

		// hull = convex hull (used for sub-zone Sutherland-Hodgman clipping)
		const hull = convexHull(allVerts);

		// blob = same as hull for now (used only for label positioning in drawZone)
		// The actual rendering uses cellPolygons
		const blob = hull;

		zones.push({
			id: clusterId,
			label: autoLabel(members),
			color: SEM_PALETTE[clusterId % SEM_PALETTE.length],
			memberPaths: members.map((m) => m.path),
			hull,
			blob,
			cellPolygons: cellPolys,
			subDomainCells: subDomainCellsMap,
		});
	}

	// Continent detection: connected components of land clusters
	const clusterAdj = new Map<number, Set<number>>();
	for (const id of clusterIds) clusterAdj.set(id, new Set());

	for (const edge of borderEdges) {
		if (edge.leftZone >= 0 && edge.rightZone >= 0) {
			clusterAdj.get(edge.leftZone)?.add(edge.rightZone);
			clusterAdj.get(edge.rightZone)?.add(edge.leftZone);
		}
	}

	const clusterVisited = new Set<number>();
	const continents: Continent[] = [];
	let continentId = 0;

	for (const clusterId of clusterIds) {
		if (clusterVisited.has(clusterId)) continue;
		const component: number[] = [];
		const queue = [clusterId];
		clusterVisited.add(clusterId);
		while (queue.length > 0) {
			const cur = queue.pop()!;
			component.push(cur);
			const neighbors = clusterAdj.get(cur);
			if (neighbors) {
				for (const nb of neighbors) {
					if (!clusterVisited.has(nb)) {
						clusterVisited.add(nb);
						queue.push(nb);
					}
				}
			}
		}

		// Collect all land cells of this continent
		const continentLandCells = new Set<number>();
		for (let i = 0; i < mesh.cellCount; i++) {
			if (component.includes(assignments[i])) {
				continentLandCells.add(i);
			}
		}

		// Extract ordered coastline polygon
		let coastline = extractCoastline(mesh, continentLandCells);

		// Apply fractal displacement + Chaikin smoothing to coastline
		if (coastline.length >= 3) {
			const amplitude = dataRange * 0.01;
			const seed = (
				(Math.round(coastline[0].x * 100000) * 73856093) ^
				(Math.round(coastline[0].y * 100000) * 19349663)
			) >>> 0;
			coastline = fractalDisplaceEdge(coastline, 3, amplitude, seed);
			coastline = chaikinSubdivideClosed(coastline, 2);
		}

		const allMembers: MapPointLike[] = [];
		for (const cId of component) {
			const m = memberPathsByCluster.get(cId);
			if (m) allMembers.push(...m);
		}
		const label = autoLabel(allMembers);

		continents.push({
			id: continentId++,
			zoneIds: component,
			label,
			coastline,
		});
	}

	return { zones, continents, borderEdges };
}

// ---------- Phase 2c½: Province (sub-domain) Assignment ----------

/**
 * Assign each land cell a sub-domain (province) within its country.
 * Uses sub-centroids derived from local k-means on notes per country.
 */
function assignSubDomains(
	mesh: VoronoiMesh,
	assignments: number[],
	subCentroidsByCluster: Map<number, Point2D[]>,
): number[] {
	const n = mesh.cellCount;
	const subDomains = new Array<number>(n).fill(-1);

	for (let i = 0; i < n; i++) {
		const dom = assignments[i];
		if (dom < 0) continue;

		const centroids = subCentroidsByCluster.get(dom);
		if (!centroids || centroids.length === 0) {
			subDomains[i] = 0; // single province
			continue;
		}

		const c = mesh.cellCentroids[i];
		let bestDist = Infinity;
		let bestSub = 0;
		for (let s = 0; s < centroids.length; s++) {
			const dx = c.x - centroids[s].x;
			const dy = c.y - centroids[s].y;
			const d = dx * dx + dy * dy;
			if (d < bestDist) { bestDist = d; bestSub = s; }
		}
		subDomains[i] = bestSub;
	}

	return subDomains;
}

// ---------- Main pipeline ----------

export function runWorldMapPipeline(
	dataPoints: MapPointLike[],
	clusterAssignments: number[],
	k: number,
	subCentroidsByCluster?: Map<number, Point2D[]>,
	wmSettings?: WorldMapSettings,
): WorldMapResult {
	const groups = new Map<number, MapPointLike[]>();
	for (let i = 0; i < dataPoints.length; i++) {
		const c = clusterAssignments[i];
		if (!groups.has(c)) groups.set(c, []);
		groups.get(c)!.push(dataPoints[i]);
	}

	const clusterIds: number[] = [];
	for (const [id, members] of groups) {
		if (members.length < 2) continue;
		clusterIds.push(id);
	}

	if (clusterIds.length === 0) {
		return { zones: [], continents: [], borderEdges: [] };
	}

	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	for (const p of dataPoints) {
		if (p.x < minX) minX = p.x;
		if (p.x > maxX) maxX = p.x;
		if (p.y < minY) minY = p.y;
		if (p.y > maxY) maxY = p.y;
	}
	const dataBounds: Bounds = { minX, minY, maxX, maxY };
	const rangeX = maxX - minX || 0.01;
	const rangeY = maxY - minY || 0.01;
	const dataRange = Math.max(rangeX, rangeY);

	const seed = hashPoints(dataPoints.map((p) => ({ x: p.x, y: p.y })));

	// Phase 2a: Generate mesh
	const meshDensity = Math.min(4000, Math.max(1000, dataPoints.length * 2));
	const { mesh, sentinelStart } = generateMesh(
		dataPoints.map((p) => ({ x: p.x, y: p.y })),
		dataBounds,
		meshDensity,
	);

	// Build per-note cluster ID array (maps dataPoints index → actual cluster ID)
	const noteClusterIds: number[] = [];
	for (let i = 0; i < dataPoints.length; i++) {
		noteClusterIds.push(clusterAssignments[i]);
	}

	// Phase 2b+c: Unified land/ocean + country assignment
	// Assigns cells by nearest actual note (not centroid) — eliminates ghost countries
	const terrainNoise = createNoiseContext(seed);
	const { isLand, cellAssignments } = assignTerrainAndCountries(
		mesh,
		dataPoints.map((p) => ({ x: p.x, y: p.y })),
		noteClusterIds,
		sentinelStart,
		terrainNoise,
		dataBounds,
		wmSettings,
	);

	// Phase 2d: Heal disconnected regions
	healDisconnected(mesh, cellAssignments, isLand);

	// Phase 2c½: Sub-domain (province) assignment
	const subDomains = subCentroidsByCluster
		? assignSubDomains(mesh, cellAssignments, subCentroidsByCluster)
		: new Array<number>(mesh.cellCount).fill(0);

	// Phase 2e: Extract border segments
	const segments = extractBorderSegments(mesh, cellAssignments, subDomains);

	// Phase 2f: Build + detail border edges
	const borderEdges = buildBorderEdges(segments, dataRange);

	// Phase 2g+h: Coastline + assembly
	const memberPathsByCluster = new Map<number, MapPointLike[]>();
	for (const [id, members] of groups) {
		if (members.length >= 2) memberPathsByCluster.set(id, members);
	}

	return assembleResult(
		mesh, cellAssignments, isLand, subDomains,
		clusterIds, memberPathsByCluster,
		borderEdges, dataRange,
	);
}
