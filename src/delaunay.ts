// Bowyer-Watson Delaunay triangulation + Voronoi dual extraction.
// No external dependencies — pure geometry.

export interface Point2D { x: number; y: number }

export interface Bounds {
	minX: number; minY: number;
	maxX: number; maxY: number;
}

export interface DelaunayResult {
	triangles: number[];      // flat [i0,i1,i2, ...] indices into points
	halfedges: number[];      // for each half-edge, the opposite half-edge index (-1 if hull)
	points: number[];         // flat [x0,y0, x1,y1, ...] — original points first, then super-triangle
	pointCount: number;       // number of original points (excluding super-triangle)
}

export interface VoronoiMesh {
	cellCount: number;
	cellPolygons: Point2D[][];        // polygon vertices per cell
	cellCentroids: Point2D[];         // centroid of each cell polygon
	adjacency: number[][];            // cell → list of neighbor cell indices
}

// ---------- Bowyer-Watson Delaunay ----------

interface Triangle {
	i0: number; i1: number; i2: number;
	dead: boolean;
}

interface Edge {
	i0: number; i1: number;
}

function circumcircle(
	px: number[], py: number[],
	i0: number, i1: number, i2: number,
): { cx: number; cy: number; rSq: number } {
	const ax = px[i0], ay = py[i0];
	const bx = px[i1], by = py[i1];
	const cx = px[i2], cy = py[i2];

	const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
	if (Math.abs(d) < 1e-12) {
		return { cx: (ax + bx + cx) / 3, cy: (ay + by + cy) / 3, rSq: Infinity };
	}

	const aSq = ax * ax + ay * ay;
	const bSq = bx * bx + by * by;
	const cSq = cx * cx + cy * cy;

	const ux = (aSq * (by - cy) + bSq * (cy - ay) + cSq * (ay - by)) / d;
	const uy = (aSq * (cx - bx) + bSq * (ax - cx) + cSq * (bx - ax)) / d;

	const dx = ax - ux, dy = ay - uy;
	return { cx: ux, cy: uy, rSq: dx * dx + dy * dy };
}

export function delaunay(coords: Float64Array, count: number): DelaunayResult {
	const n = count;
	if (n < 3) {
		return { triangles: [], halfedges: [], points: Array.from(coords), pointCount: n };
	}

	// Extract x/y arrays (we'll add super-triangle vertices at the end)
	const px: number[] = new Array(n + 3);
	const py: number[] = new Array(n + 3);
	for (let i = 0; i < n; i++) {
		px[i] = coords[i * 2];
		py[i] = coords[i * 2 + 1];
	}

	// Bounding box of all points
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	for (let i = 0; i < n; i++) {
		if (px[i] < minX) minX = px[i];
		if (px[i] > maxX) maxX = px[i];
		if (py[i] < minY) minY = py[i];
		if (py[i] > maxY) maxY = py[i];
	}
	const dx = maxX - minX;
	const dy = maxY - minY;
	const dmax = Math.max(dx, dy, 1e-6);
	const midX = (minX + maxX) / 2;
	const midY = (minY + maxY) / 2;

	// Super-triangle — large enough to contain all points
	const margin = dmax * 20;
	px[n] = midX - margin;       py[n] = midY - margin;
	px[n + 1] = midX + margin;   py[n + 1] = midY - margin;
	px[n + 2] = midX;            py[n + 2] = midY + margin;

	const triangles: Triangle[] = [{ i0: n, i1: n + 1, i2: n + 2, dead: false }];

	// Insert each point
	for (let i = 0; i < n; i++) {
		const x = px[i], y = py[i];
		const badTriangles: number[] = [];

		// Find all triangles whose circumcircle contains the new point
		for (let t = 0; t < triangles.length; t++) {
			const tri = triangles[t];
			if (tri.dead) continue;
			const cc = circumcircle(px, py, tri.i0, tri.i1, tri.i2);
			const ddx = x - cc.cx, ddy = y - cc.cy;
			if (ddx * ddx + ddy * ddy <= cc.rSq + 1e-10) {
				badTriangles.push(t);
			}
		}

		// Find boundary of the polygonal hole
		const boundary: Edge[] = [];
		for (const bt of badTriangles) {
			const tri = triangles[bt];
			const edges: Edge[] = [
				{ i0: tri.i0, i1: tri.i1 },
				{ i0: tri.i1, i1: tri.i2 },
				{ i0: tri.i2, i1: tri.i0 },
			];
			for (const edge of edges) {
				let shared = false;
				for (const bt2 of badTriangles) {
					if (bt2 === bt) continue;
					const tri2 = triangles[bt2];
					const e2 = [
						[tri2.i0, tri2.i1], [tri2.i1, tri2.i2], [tri2.i2, tri2.i0],
					];
					for (const [a, b] of e2) {
						if ((a === edge.i1 && b === edge.i0) || (a === edge.i0 && b === edge.i1)) {
							shared = true;
							break;
						}
					}
					if (shared) break;
				}
				if (!shared) boundary.push(edge);
			}
		}

		// Remove bad triangles
		for (const bt of badTriangles) {
			triangles[bt].dead = true;
		}

		// Create new triangles from boundary edges to new point
		for (const edge of boundary) {
			triangles.push({ i0: edge.i0, i1: edge.i1, i2: i, dead: false });
		}
	}

	// Collect live triangles that don't reference super-triangle vertices
	const outTriangles: number[] = [];
	for (const tri of triangles) {
		if (tri.dead) continue;
		if (tri.i0 >= n || tri.i1 >= n || tri.i2 >= n) continue;
		outTriangles.push(tri.i0, tri.i1, tri.i2);
	}

	// Build flat points array
	const outPoints: number[] = new Array(n * 2);
	for (let i = 0; i < n; i++) {
		outPoints[i * 2] = px[i];
		outPoints[i * 2 + 1] = py[i];
	}

	return {
		triangles: outTriangles,
		halfedges: [], // not needed for Voronoi extraction — we use triangle adjacency directly
		points: outPoints,
		pointCount: n,
	};
}

// ---------- Voronoi dual extraction ----------

export function voronoiFromDelaunay(
	coords: Float64Array,
	count: number,
	bounds: Bounds,
): VoronoiMesh {
	const n = count;
	if (n < 3) {
		// Degenerate: return single cells per point
		const cells: Point2D[][] = [];
		const centroids: Point2D[] = [];
		const adj: number[][] = [];
		const pad = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY) * 0.01 || 0.01;
		for (let i = 0; i < n; i++) {
			const x = coords[i * 2], y = coords[i * 2 + 1];
			cells.push([
				{ x: x - pad, y: y - pad }, { x: x + pad, y: y - pad },
				{ x: x + pad, y: y + pad }, { x: x - pad, y: y + pad },
			]);
			centroids.push({ x, y });
			adj.push([]);
		}
		return { cellCount: n, cellPolygons: cells, cellCentroids: centroids, adjacency: adj };
	}

	// Run full Delaunay including super-triangle vertices for boundary handling
	const px: number[] = new Array(n + 3);
	const py: number[] = new Array(n + 3);
	for (let i = 0; i < n; i++) {
		px[i] = coords[i * 2];
		py[i] = coords[i * 2 + 1];
	}

	const dx = bounds.maxX - bounds.minX;
	const dy = bounds.maxY - bounds.minY;
	const dmax = Math.max(dx, dy, 1e-6);
	const midX = (bounds.minX + bounds.maxX) / 2;
	const midY = (bounds.minY + bounds.maxY) / 2;
	const margin = dmax * 20;
	px[n] = midX - margin;       py[n] = midY - margin;
	px[n + 1] = midX + margin;   py[n + 1] = midY - margin;
	px[n + 2] = midX;            py[n + 2] = midY + margin;

	// Full Bowyer-Watson — keep ALL triangles (including those touching super-tri)
	// so that boundary Voronoi cells get proper circumcenters
	interface TriRecord {
		i0: number; i1: number; i2: number;
		dead: boolean;
		cx: number; cy: number; // circumcenter
	}

	const triangles: TriRecord[] = [];
	{
		const cc = circumcircle(px, py, n, n + 1, n + 2);
		triangles.push({ i0: n, i1: n + 1, i2: n + 2, dead: false, cx: cc.cx, cy: cc.cy });
	}

	for (let i = 0; i < n; i++) {
		const x = px[i], y = py[i];
		const badTriangles: number[] = [];

		for (let t = 0; t < triangles.length; t++) {
			const tri = triangles[t];
			if (tri.dead) continue;
			const cc = circumcircle(px, py, tri.i0, tri.i1, tri.i2);
			const ddx = x - cc.cx, ddy = y - cc.cy;
			if (ddx * ddx + ddy * ddy <= cc.rSq + 1e-10) {
				badTriangles.push(t);
			}
		}

		const boundary: Edge[] = [];
		for (const bt of badTriangles) {
			const tri = triangles[bt];
			const edges: Edge[] = [
				{ i0: tri.i0, i1: tri.i1 },
				{ i0: tri.i1, i1: tri.i2 },
				{ i0: tri.i2, i1: tri.i0 },
			];
			for (const edge of edges) {
				let shared = false;
				for (const bt2 of badTriangles) {
					if (bt2 === bt) continue;
					const tri2 = triangles[bt2];
					const e2 = [
						[tri2.i0, tri2.i1], [tri2.i1, tri2.i2], [tri2.i2, tri2.i0],
					];
					for (const [a, b] of e2) {
						if ((a === edge.i1 && b === edge.i0) || (a === edge.i0 && b === edge.i1)) {
							shared = true;
							break;
						}
					}
					if (shared) break;
				}
				if (!shared) boundary.push(edge);
			}
		}

		for (const bt of badTriangles) {
			triangles[bt].dead = true;
		}

		for (const edge of boundary) {
			const cc = circumcircle(px, py, edge.i0, edge.i1, i);
			triangles.push({ i0: edge.i0, i1: edge.i1, i2: i, dead: false, cx: cc.cx, cy: cc.cy });
		}
	}

	// Build point → triangle list (for original points only)
	const pointTriangles: number[][] = new Array(n);
	for (let i = 0; i < n; i++) pointTriangles[i] = [];

	for (let t = 0; t < triangles.length; t++) {
		const tri = triangles[t];
		if (tri.dead) continue;
		if (tri.i0 < n) pointTriangles[tri.i0].push(t);
		if (tri.i1 < n) pointTriangles[tri.i1].push(t);
		if (tri.i2 < n) pointTriangles[tri.i2].push(t);
	}

	// For each original point, walk its incident triangles in order
	// to extract Voronoi cell polygon (circumcenters in order)
	const cellPolygons: Point2D[][] = new Array(n);
	const cellCentroids: Point2D[] = new Array(n);
	const adjacencySet: Set<number>[] = new Array(n);
	for (let i = 0; i < n; i++) adjacencySet[i] = new Set();

	for (let i = 0; i < n; i++) {
		const tris = pointTriangles[i];
		if (tris.length === 0) {
			cellPolygons[i] = [];
			cellCentroids[i] = { x: px[i], y: py[i] };
			continue;
		}

		// Order triangles around point i
		const ordered = orderTrianglesAroundPoint(i, tris, triangles);

		// Extract circumcenters and clip to bounds
		const poly: Point2D[] = [];
		for (const t of ordered) {
			const tri = triangles[t];
			let cx = tri.cx, cy = tri.cy;
			// Clamp to bounds
			cx = Math.max(bounds.minX, Math.min(bounds.maxX, cx));
			cy = Math.max(bounds.minY, Math.min(bounds.maxY, cy));
			poly.push({ x: cx, y: cy });
		}

		// Deduplicate near-identical points
		const deduped: Point2D[] = [];
		for (let j = 0; j < poly.length; j++) {
			const prev = j > 0 ? deduped[deduped.length - 1] : poly[poly.length - 1];
			const p = poly[j];
			if (deduped.length === 0 || Math.abs(p.x - prev.x) > 1e-10 || Math.abs(p.y - prev.y) > 1e-10) {
				deduped.push(p);
			}
		}

		cellPolygons[i] = deduped;

		// Compute centroid
		let cx = 0, cy = 0;
		for (const p of deduped) { cx += p.x; cy += p.y; }
		if (deduped.length > 0) {
			cx /= deduped.length;
			cy /= deduped.length;
		} else {
			cx = px[i]; cy = py[i];
		}
		cellCentroids[i] = { x: cx, y: cy };

		// Build adjacency from triangles — other vertices of incident triangles
		for (const t of ordered) {
			const tri = triangles[t];
			const verts = [tri.i0, tri.i1, tri.i2];
			for (const v of verts) {
				if (v !== i && v < n) {
					adjacencySet[i].add(v);
				}
			}
		}
	}

	const adjacency: number[][] = new Array(n);
	for (let i = 0; i < n; i++) adjacency[i] = [...adjacencySet[i]];

	return { cellCount: n, cellPolygons, cellCentroids, adjacency };
}

// ---------- helpers ----------

function orderTrianglesAroundPoint(
	pointIdx: number,
	triIndices: number[],
	triangles: { i0: number; i1: number; i2: number; dead: boolean; cx: number; cy: number }[],
): number[] {
	if (triIndices.length <= 1) return triIndices;

	// Sort by angle from point to circumcenter
	const px = 0, py = 0; // we'll compute angles relative to average
	const angles: { idx: number; angle: number }[] = triIndices.map((t) => {
		const tri = triangles[t];
		return { idx: t, angle: 0 };
	});

	// Get the point coordinates from a triangle that contains it
	let refX = 0, refY = 0;
	{
		const t0 = triangles[triIndices[0]];
		const verts = [t0.i0, t0.i1, t0.i2];
		// We need the actual point coordinates — use circumcenter relative to point position
		// Actually, we can just sort circumcenters by angle
	}

	// Better approach: sort circumcenters by angle relative to point
	// We need the point's coordinates. We can recover them from a triangle.
	const tri0 = triangles[triIndices[0]];
	// Find which vertex is our point in the first triangle
	let ptX = 0, ptY = 0;
	// We need the original coords — pass them through the triangles list
	// The circumcenter is already stored. Sort by atan2 from point to circumcenter.
	// But we don't have the point coords directly here.
	// Use the circumcenters' mean as reference, then sort by angle around that.

	// Actually, we can sort by angle of circumcenter relative to the mean of all circumcenters
	let meanX = 0, meanY = 0;
	for (const t of triIndices) {
		meanX += triangles[t].cx;
		meanY += triangles[t].cy;
	}
	meanX /= triIndices.length;
	meanY /= triIndices.length;

	for (let i = 0; i < angles.length; i++) {
		const tri = triangles[angles[i].idx];
		angles[i].angle = Math.atan2(tri.cy - meanY, tri.cx - meanX);
	}

	angles.sort((a, b) => a.angle - b.angle);
	return angles.map((a) => a.idx);
}
