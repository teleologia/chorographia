// ---------- Route network — shared road/trade route system ----------
// Computes an MST backbone from linked notes, routes each link through it,
// and counts traffic per edge for thickness rendering.

import { mulberry32, hashCoords } from "./ink";
import type { TerrainType } from "./terrain";

interface Point2D { x: number; y: number }

export interface RouteEdge {
	from: number;   // point index
	to: number;     // point index
	traffic: number;
	isOcean: boolean;
	controlPt: Point2D; // bezier control point for organic curvature
}

export interface RouteNetwork {
	edges: RouteEdge[];
	linkPaths: Map<string, number[]>; // "noteIdx→noteIdx" → [edge indices] forming path
}

// ---------- Union-Find for Kruskal's MST ----------

class UnionFind {
	parent: number[];
	rank: number[];
	constructor(n: number) {
		this.parent = Array.from({ length: n }, (_, i) => i);
		this.rank = new Array(n).fill(0);
	}
	find(x: number): number {
		if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
		return this.parent[x];
	}
	union(a: number, b: number): boolean {
		const ra = this.find(a), rb = this.find(b);
		if (ra === rb) return false;
		if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
		else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
		else { this.parent[rb] = ra; this.rank[ra]++; }
		return true;
	}
}

/**
 * Compute a shared route network from note positions and their links.
 *
 * @param points - Array of {x, y} positions for each note
 * @param links - For each point index, array of point indices it links to
 * @param terrainTypes - Optional terrain classification per point (for ocean detection)
 */
export function computeRouteNetwork(
	points: Point2D[],
	links: number[][],
	terrainTypes?: TerrainType[],
): RouteNetwork {
	const n = points.length;
	if (n < 2) return { edges: [], linkPaths: new Map() };

	// Collect all unique linked pairs
	const linkedPairs: [number, number][] = [];
	const pairSet = new Set<string>();
	for (let i = 0; i < n; i++) {
		for (const j of links[i]) {
			if (j < 0 || j >= n || j === i) continue;
			const key = i < j ? `${i}-${j}` : `${j}-${i}`;
			if (!pairSet.has(key)) {
				pairSet.add(key);
				linkedPairs.push(i < j ? [i, j] : [j, i]);
			}
		}
	}

	if (linkedPairs.length === 0) return { edges: [], linkPaths: new Map() };

	// Collect all nodes that participate in at least one link
	const nodeSet = new Set<number>();
	for (const [a, b] of linkedPairs) { nodeSet.add(a); nodeSet.add(b); }
	const nodes = [...nodeSet].sort((a, b) => a - b);
	const nodeIdxMap = new Map<number, number>(); // original index → local index
	nodes.forEach((node, i) => nodeIdxMap.set(node, i));
	const localN = nodes.length;

	// Build candidate edges: all pairs of linked-participating nodes weighted by distance
	// For MST, we use all pairs within linked nodes to get a connected backbone
	const allEdges: { a: number; b: number; dist: number }[] = [];
	for (let li = 0; li < localN; li++) {
		for (let lj = li + 1; lj < localN; lj++) {
			const gi = nodes[li], gj = nodes[lj];
			const dx = points[gi].x - points[gj].x;
			const dy = points[gi].y - points[gj].y;
			allEdges.push({ a: li, b: lj, dist: Math.sqrt(dx * dx + dy * dy) });
		}
	}
	allEdges.sort((a, b) => a.dist - b.dist);

	// Kruskal's MST
	const uf = new UnionFind(localN);
	const mstEdges: { a: number; b: number }[] = [];
	const adj: Map<number, { neighbor: number; edgeIdx: number }[]> = new Map();
	for (let i = 0; i < localN; i++) adj.set(i, []);

	for (const e of allEdges) {
		if (uf.union(e.a, e.b)) {
			const idx = mstEdges.length;
			mstEdges.push({ a: e.a, b: e.b });
			adj.get(e.a)!.push({ neighbor: e.b, edgeIdx: idx });
			adj.get(e.b)!.push({ neighbor: e.a, edgeIdx: idx });
			if (mstEdges.length === localN - 1) break;
		}
	}

	// BFS shortest path through MST for each linked pair
	function findPath(startLocal: number, endLocal: number): number[] | null {
		if (startLocal === endLocal) return [];
		const visited = new Set<number>();
		const queue: { node: number; path: number[] }[] = [{ node: startLocal, path: [] }];
		visited.add(startLocal);
		while (queue.length > 0) {
			const { node, path } = queue.shift()!;
			for (const { neighbor, edgeIdx } of adj.get(node) || []) {
				if (visited.has(neighbor)) continue;
				const newPath = [...path, edgeIdx];
				if (neighbor === endLocal) return newPath;
				visited.add(neighbor);
				queue.push({ node: neighbor, path: newPath });
			}
		}
		return null; // disconnected
	}

	// Route each link and count traffic
	const traffic = new Array(mstEdges.length).fill(0);
	const linkPaths = new Map<string, number[]>();

	for (const [gi, gj] of linkedPairs) {
		const li = nodeIdxMap.get(gi);
		const lj = nodeIdxMap.get(gj);
		if (li == null || lj == null) continue;
		const path = findPath(li, lj);
		if (!path) continue;
		const key = `${gi}→${gj}`;
		linkPaths.set(key, path);
		for (const ei of path) traffic[ei]++;
	}

	// Build output edges with control points and ocean classification
	const edges: RouteEdge[] = mstEdges.map((e, idx) => {
		const gi = nodes[e.a], gj = nodes[e.b];
		const p0 = points[gi], p1 = points[gj];
		const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2;
		// Seeded perpendicular offset for organic curvature
		const seed = hashCoords(p0.x + p1.x, p0.y + p1.y);
		const rng = mulberry32(seed);
		const dx = p1.x - p0.x, dy = p1.y - p0.y;
		const len = Math.sqrt(dx * dx + dy * dy) || 0.001;
		const px = -dy / len, py = dx / len;
		const offset = (rng() - 0.5) * len * 0.15;
		const controlPt = { x: mx + px * offset, y: my + py * offset };

		// Ocean if both endpoints are reef/port
		let isOcean = false;
		if (terrainTypes) {
			const tA = terrainTypes[gi];
			const tB = terrainTypes[gj];
			isOcean = (tA === "reef" || tA === "port") && (tB === "reef" || tB === "port");
		}

		return {
			from: gi,
			to: gj,
			traffic: traffic[idx],
			isOcean,
			controlPt,
		};
	});

	// Re-map linkPaths to use global edge indices (they're the same since we built edges from mstEdges in order)
	return { edges, linkPaths };
}
