import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import type ChorographiaPlugin from "./main";
import type { NoteCache, ZoneCacheEntry } from "./cache";
import { decodeFloat32, encodeFloat32 } from "./cache";
import { kMeans, computeSemanticAssignments } from "./kmeans";
import { Zone, computeZones, drawZone, transformZoneToLocal } from "./zones";
import { generateZoneNames } from "./zoneNaming";
import { generateZoneNamesOllama } from "./ollama";
import { generateZoneNamesOpenRouter } from "./openrouter";

export const VIEW_TYPE = "chorographia-map";

type ViewMode = "global" | "local";

interface MapPoint {
	path: string;
	x: number;
	y: number;
	title: string;
	folder: string;
	semA: number;
	semB: number;
	semW: number;
	noteType: string;
	cat: string;
	links: string[];
}

interface ScreenPt { x: number; y: number }

// ---------- palettes ----------
const FOLDER_COLORS = [
	"#8E9AAF", "#C9963B", "#B28DFF", "#5AC6CE", "#B8541A",
	"#9AB2AF", "#BCDC2B", "#FF7A00", "#A855F7", "#00D6FF",
	"#00FFB3", "#FF3DB8",
];
const SEM_PALETTE = [
	"#00D6FF", "#B9FF00", "#FF7A00", "#A855F7",
	"#00FFB3", "#FF3DB8", "#00FFA3", "#FFD400",
	"#00F5D4", "#FF9A3D", "#7CFFCB", "#B8C0FF",
];
const SEM_SPLIT: Record<number, number> = { 1: 0.80, 2: 0.65, 3: 0.50, 4: 0.35, 5: 0.20 };
const TYPE_COLORS: Record<string, string> = {
	SRC: "#8E9AAF", LIT: "#C9963B", SEED: "#B8541A",
	EVE: "#B28DFF", REV: "#9AB2AF", NOTE: "#5AC6CE",
};
const NEIGHBOR_OPTIONS = [5, 10, 15, 20];

// ---------- helpers ----------
function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
	return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function lerpColor(c1: string, c2: string, t: number): string {
	const [r1, g1, b1] = hexToRgb(c1);
	const [r2, g2, b2] = hexToRgb(c2);
	return rgbToHex(
		Math.round(r1 + (r2 - r1) * t),
		Math.round(g1 + (g2 - g1) * t),
		Math.round(b1 + (b2 - b1) * t),
	);
}
function hashStr(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
	return Math.abs(h);
}
function dist2D(a: { x: number; y: number }, b: { x: number; y: number }): number {
	const dx = a.x - b.x, dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

// ---------- theme ----------
interface ThemeColors {
	panelBg: string;         // tooltip bg, minimap bg
	labelPillBg: string;     // local label pill bg (more transparent)
	panelBorder: string;     // borders on tooltips, minimap, controls
	text: string;            // primary text (labels, tooltips)
	textMuted: string;       // empty-state text, dimmed elements
	minimapDimPoint: string; // non-local minimap points
	linkStroke: string;      // link edges (global)
	linkStrokeLocal: string; // link edges (local)
	connectorLine: string;   // label connector lines
}

const DARK: ThemeColors = {
	panelBg: "rgba(15,15,26,0.92)",
	labelPillBg: "rgba(15,15,26,0.75)",
	panelBorder: "rgba(44,44,58,0.6)",
	text: "#D6D6E0",
	textMuted: "#8E9AAF",
	minimapDimPoint: "rgba(142,154,175,0.45)",
	linkStroke: "rgba(214,214,224,0.18)",
	linkStrokeLocal: "rgba(214,214,224,0.15)",
	connectorLine: "rgba(142,154,175,0.2)",
};

const LIGHT: ThemeColors = {
	panelBg: "rgba(255,255,255,0.92)",
	labelPillBg: "rgba(255,255,255,0.78)",
	panelBorder: "rgba(160,160,180,0.4)",
	text: "#1e1e2e",
	textMuted: "#6e6e80",
	minimapDimPoint: "rgba(100,100,120,0.4)",
	linkStroke: "rgba(60,60,80,0.22)",
	linkStrokeLocal: "rgba(60,60,80,0.18)",
	connectorLine: "rgba(100,100,120,0.25)",
};

// ---------- view ----------
export class ChorographiaView extends ItemView {
	plugin: ChorographiaPlugin;

	private canvas!: HTMLCanvasElement;
	private ctx!: CanvasRenderingContext2D;
	private dpr = 1;

	// state
	private allPoints: MapPoint[] = [];
	private points: MapPoint[] = [];
	private zones: Zone[] = [];
	private subZonesMap = new Map<number, Zone[]>(); // globalZoneId → sub-zones (global coords)
	private zoom = 1;
	private panX = 0;
	private panY = 0;
	private hoverIdx = -1;
	private selectedIdx = -1;

	// local view
	private viewMode: ViewMode = "global";
	private localCenterPath = "";
	private localNeighborCount = 10;
	private localZones: Zone[] = [];
	private localCX = 0;
	private localCY = 0;
	private localScale = 1;

	// drag
	private dragging = false;
	private dragStartX = 0;
	private dragStartY = 0;
	private dragPanX = 0;
	private dragPanY = 0;

	// color maps
	private folderColorMap = new Map<string, string>();
	private catColorMap = new Map<string, string>();

	// controls
	private statusEl!: HTMLDivElement;
	private viewSwitchEl!: HTMLElement;
	private neighborSelect!: HTMLSelectElement;
	private neighborGroup!: HTMLElement;
	private colorModeSelect!: HTMLSelectElement;
	private linksToggle!: HTMLInputElement;
	private zonesToggle!: HTMLInputElement;

	constructor(leaf: WorkspaceLeaf, plugin: ChorographiaPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	private get theme(): ThemeColors {
		return document.body.classList.contains("theme-light") ? LIGHT : DARK;
	}

	getViewType() { return VIEW_TYPE; }
	getDisplayText() { return "Chorographia Map"; }
	getIcon() { return "map"; }

	// ===================== lifecycle =====================

	async onOpen() {
		const root = this.containerEl.children[1] as HTMLElement;
		root.empty();
		root.addClass("chorographia-container");
		root.style.overflow = "hidden";
		// Also prevent scrollbars on the parent view-content
		this.containerEl.style.overflow = "hidden";

		this.canvas = root.createEl("canvas", { cls: "chorographia-canvas" });
		this.statusEl = root.createEl("div", { cls: "chorographia-status" });

		this.buildControls(root);

		this.dpr = window.devicePixelRatio || 1;
		this.setupInteractions();
		this.loadPoints();
		this.resizeCanvas();
		this.draw();
		this.registerEvent(this.app.workspace.on("resize", () => { this.resizeCanvas(); this.draw(); }));
		this.registerEvent(this.app.workspace.on("active-leaf-change", () => { this.syncActiveNoteSelection(); }));
		this.syncActiveNoteSelection();
	}

	async onClose() {}

	// ===================== controls =====================

	private buildControls(root: HTMLElement) {
		const bar = root.createEl("div", { cls: "chorographia-controls" });

		// View mode switch
		this.viewSwitchEl = bar.createEl("div", { cls: "chorographia-view-switch" });
		const globalLabel = this.viewSwitchEl.createEl("span", { cls: "switch-label is-active", text: "Global" });
		const track = this.viewSwitchEl.createEl("div", { cls: "switch-track" });
		track.createEl("div", { cls: "switch-thumb" });
		const localLabel = this.viewSwitchEl.createEl("span", { cls: "switch-label", text: "Local" });
		const toggleView = () => {
			if (this.viewMode === "global") {
				if (this.selectedIdx >= 0) this.enterLocalView(this.points[this.selectedIdx].path);
			} else {
				this.enterGlobalView();
			}
		};
		this.viewSwitchEl.addEventListener("click", toggleView);
		this.viewSwitchEl.addEventListener("touchend", (e) => { e.preventDefault(); toggleView(); });

		// Neighbor count (only visible in local)
		this.neighborGroup = bar.createEl("span", { cls: "chorographia-neighbor-group" });
		this.neighborGroup.style.display = "none";
		this.neighborGroup.createEl("span", { cls: "chorographia-sep" });
		const nearLabel = this.neighborGroup.createEl("span", { text: "Near:" });
		nearLabel.style.marginRight = "4px";
		this.neighborSelect = this.neighborGroup.createEl("select");
		for (const n of NEIGHBOR_OPTIONS)
			this.neighborSelect.createEl("option", { text: String(n), value: String(n) });
		this.neighborSelect.value = "10";
		this.neighborSelect.addEventListener("change", () => {
			this.localNeighborCount = parseInt(this.neighborSelect.value, 10);
			if (this.viewMode === "local" && this.localCenterPath)
				this.enterLocalView(this.localCenterPath);
		});

		// Color mode
		bar.createEl("span", { cls: "chorographia-sep" });
		bar.createEl("span", { text: "Color:" }).style.marginRight = "4px";
		this.colorModeSelect = bar.createEl("select");
		for (const [v, t] of [
			["semantic", "Semantic"], ["folder", "Folder"],
			["type", "Type"], ["cat", "Category"],
		] as const)
			this.colorModeSelect.createEl("option", { text: t, value: v });
		this.colorModeSelect.value = this.plugin.settings.colorMode;
		this.colorModeSelect.addEventListener("change", async () => {
			this.plugin.settings.colorMode = this.colorModeSelect.value as any;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Links toggle
		bar.createEl("span", { cls: "chorographia-sep" });
		const lbl = bar.createEl("label", { cls: "chorographia-toggle-label" });
		this.linksToggle = lbl.createEl("input", { type: "checkbox" });
		this.linksToggle.checked = this.plugin.settings.showLinks;
		lbl.appendText(" Links");
		this.linksToggle.addEventListener("change", async () => {
			this.plugin.settings.showLinks = this.linksToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Zones toggle
		bar.createEl("span", { cls: "chorographia-sep" });
		const zoneLbl = bar.createEl("label", { cls: "chorographia-toggle-label" });
		this.zonesToggle = zoneLbl.createEl("input", { type: "checkbox" });
		this.zonesToggle.checked = this.plugin.settings.showZones;
		zoneLbl.appendText(" Zones");
		this.zonesToggle.addEventListener("change", async () => {
			this.plugin.settings.showZones = this.zonesToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});
	}

	// ===================== data =====================

	async loadPoints(): Promise<void> {
		const pts: MapPoint[] = [];
		const folders = new Set<string>();
		const cats = new Set<string>();

		for (const [path, n] of Object.entries(this.plugin.cache.notes)) {
			if (n.x == null || n.y == null) continue;
			const p: MapPoint = {
				path, x: n.x, y: n.y,
				title: n.title, folder: n.folder,
				semA: n.semA ?? -1, semB: n.semB ?? -1, semW: n.semW ?? 3,
				noteType: n.noteType || "", cat: n.cat || "",
				links: n.links || [],
			};
			pts.push(p);
			folders.add(p.folder);
			if (p.cat) cats.add(p.cat);
		}

		[...folders].sort().forEach((f, i) => this.folderColorMap.set(f, FOLDER_COLORS[i % FOLDER_COLORS.length]));
		[...cats].sort().forEach((c, i) => this.catColorMap.set(c, FOLDER_COLORS[i % FOLDER_COLORS.length]));

		this.allPoints = pts;
		this.points = pts;
		this.hoverIdx = -1;
		this.selectedIdx = -1;
		this.updateStatus();
		await this.computeAndCacheZones();
		this.draw();
	}

	private async computeAndCacheZones(): Promise<void> {
		const k = this.plugin.settings.zoneGranularity;
		const model = this.plugin.embeddingModelString;
		const cacheKey = `${k}_${model}`;

		// Check cache (require subAssignments — invalidate old cache without them)
		const cached = this.plugin.cache.zones?.[cacheKey];
		if (cached && cached.subAssignments) {
			// Rebuild zones from cached assignments
			const assignments: number[] = [];
			const pointsForZones: MapPoint[] = [];
			for (const p of this.allPoints) {
				if (cached.assignments[p.path] != null) {
					assignments.push(cached.assignments[p.path]);
					pointsForZones.push(p);
				}
			}
			if (pointsForZones.length > 0) {
				this.zones = computeZones(pointsForZones, assignments, k);
				// Apply cached labels
				for (const zone of this.zones) {
					if (cached.labels[zone.id]) zone.label = cached.labels[zone.id];
				}
				// Rebuild sub-zones from cache
				this.subZonesMap.clear();
				if (cached.subAssignments) {
					for (const zone of this.zones) {
						const subAssign = cached.subAssignments[zone.id];
						if (!subAssign) continue;
						const subPts: MapPoint[] = [];
						const subIdx: number[] = [];
						for (const p of this.allPoints) {
							if (subAssign[p.path] != null) {
								subPts.push(p);
								subIdx.push(subAssign[p.path]);
							}
						}
						if (subPts.length > 0) {
							const localK = Math.max(2, Math.round(k / 4));
							const subZones = computeZones(subPts, subIdx, localK);
							const subLabels = cached.subLabels?.[zone.id];
							if (subLabels) {
								for (const sz of subZones) {
									if (subLabels[sz.id]) sz.label = subLabels[sz.id];
								}
							}
							this.subZonesMap.set(zone.id, subZones);
						}
					}
				}
				// Recompute semantic assignments from cached centroids
				if (cached.centroids && cached.centroids.length > 0) {
					const cachedCentroids = cached.centroids.map((c) => decodeFloat32(c));
					const vecs: Float32Array[] = [];
					const vecPaths: string[] = [];
					for (const p of this.allPoints) {
						const note = this.plugin.cache.notes[p.path];
						if (note?.embedding) {
							vecs.push(decodeFloat32(note.embedding));
							vecPaths.push(p.path);
						}
					}
					if (vecs.length > 0) {
						const semAssign = computeSemanticAssignments(vecs, cachedCentroids);
						for (let i = 0; i < vecPaths.length; i++) {
							const note = this.plugin.cache.notes[vecPaths[i]];
							if (note) {
								note.semA = semAssign[i].semA;
								note.semB = semAssign[i].semB;
								note.semW = semAssign[i].semW;
							}
						}
					}
				}
				return;
			}
		}

		// Need to compute — gather embeddings
		const paths: string[] = [];
		const vectors: Float32Array[] = [];
		for (const p of this.allPoints) {
			const note = this.plugin.cache.notes[p.path];
			if (note?.embedding) {
				paths.push(p.path);
				vectors.push(decodeFloat32(note.embedding));
			}
		}

		if (vectors.length < k) {
			this.zones = [];
			this.subZonesMap.clear();
			return;
		}

		// Run k-means
		const { assignments, centroids } = kMeans(vectors, k);

		// Build assignment map for cache
		const assignMap: Record<string, number> = {};
		for (let i = 0; i < paths.length; i++) {
			assignMap[paths[i]] = assignments[i];
		}

		// Match assignments to allPoints
		const pointAssignments: number[] = [];
		const pointsForZones: MapPoint[] = [];
		for (const p of this.allPoints) {
			if (assignMap[p.path] != null) {
				pointAssignments.push(assignMap[p.path]);
				pointsForZones.push(p);
			}
		}

		this.zones = computeZones(pointsForZones, pointAssignments, k);

		// Optionally enhance labels with LLM
		const labelMap: Record<number, string> = {};
		for (const z of this.zones) labelMap[z.id] = z.label;

		if (this.plugin.settings.enableLLMZoneNaming) {
			const clusters = this.zones.map((z) => ({
				idx: z.id,
				titles: z.memberPaths.map((p) => {
					const note = this.plugin.cache.notes[p];
					return note?.title || p.split("/").pop() || p;
				}),
			}));
			let llmNames = new Map<number, string>();
			if (this.plugin.settings.llmProvider === "ollama") {
				llmNames = await generateZoneNamesOllama(clusters, this.plugin.settings.ollamaUrl, this.plugin.settings.ollamaLlmModel);
			} else if (this.plugin.settings.llmProvider === "openai" && this.plugin.settings.openaiApiKey) {
				llmNames = await generateZoneNames(clusters, this.plugin.settings.openaiApiKey);
			} else if (this.plugin.settings.llmProvider === "openrouter" && this.plugin.settings.openrouterApiKey) {
				llmNames = await generateZoneNamesOpenRouter(clusters, this.plugin.settings.openrouterApiKey, this.plugin.settings.openrouterLlmModel);
			}
			for (const [idx, name] of llmNames) {
				labelMap[idx] = name;
				const zone = this.zones.find((z) => z.id === idx);
				if (zone) zone.label = name;
			}
		}

		// Compute sub-zones for each global zone
		const localK = Math.max(2, Math.round(k / 4));
		const subAssignmentsCache: Record<number, Record<string, number>> = {};
		const subLabelsCache: Record<number, Record<number, string>> = {};
		const allSubClusters: { zoneId: number; idx: number; titles: string[] }[] = [];
		this.subZonesMap.clear();

		// Build path→vector lookup
		const vecByPath = new Map<string, Float32Array>();
		for (let i = 0; i < paths.length; i++) vecByPath.set(paths[i], vectors[i]);

		for (const zone of this.zones) {
			const memberVecs: Float32Array[] = [];
			const memberPaths: string[] = [];
			for (const p of zone.memberPaths) {
				const v = vecByPath.get(p);
				if (v) { memberVecs.push(v); memberPaths.push(p); }
			}
			if (memberVecs.length < localK) continue;

			const { assignments: subAssignments } = kMeans(memberVecs, localK);
			const subAssignMap: Record<string, number> = {};
			for (let i = 0; i < memberPaths.length; i++) subAssignMap[memberPaths[i]] = subAssignments[i];
			subAssignmentsCache[zone.id] = subAssignMap;

			// Build sub-zone geometry using global coords
			const subPts = memberPaths.map((path) => {
				const pt = this.allPoints.find((p) => p.path === path)!;
				return { path: pt.path, x: pt.x, y: pt.y, folder: pt.folder, cat: pt.cat };
			});
			const subZones = computeZones(subPts, subAssignments, localK);

			const subLabelMap: Record<number, string> = {};
			for (const sz of subZones) subLabelMap[sz.id] = sz.label;

			// Collect for batch LLM naming
			for (const sz of subZones) {
				allSubClusters.push({
					zoneId: zone.id,
					idx: sz.id,
					titles: sz.memberPaths.map((p) => {
						const note = this.plugin.cache.notes[p];
						return note?.title || p.split("/").pop() || p;
					}),
				});
			}

			subLabelsCache[zone.id] = subLabelMap;
			this.subZonesMap.set(zone.id, subZones);
		}

		// LLM-name sub-zones in one batch
		if (this.plugin.settings.enableLLMZoneNaming && allSubClusters.length > 0) {
			// Use composite index to disambiguate across zones
			const batchClusters = allSubClusters.map((c, i) => ({
				idx: i,
				titles: c.titles,
			}));
			let llmNames = new Map<number, string>();
			if (this.plugin.settings.llmProvider === "ollama") {
				llmNames = await generateZoneNamesOllama(batchClusters, this.plugin.settings.ollamaUrl, this.plugin.settings.ollamaLlmModel);
			} else if (this.plugin.settings.llmProvider === "openai" && this.plugin.settings.openaiApiKey) {
				llmNames = await generateZoneNames(batchClusters, this.plugin.settings.openaiApiKey);
			} else if (this.plugin.settings.llmProvider === "openrouter" && this.plugin.settings.openrouterApiKey) {
				llmNames = await generateZoneNamesOpenRouter(batchClusters, this.plugin.settings.openrouterApiKey, this.plugin.settings.openrouterLlmModel);
			}
			for (const [batchIdx, name] of llmNames) {
				const c = allSubClusters[batchIdx];
				subLabelsCache[c.zoneId][c.idx] = name;
				const subZones = this.subZonesMap.get(c.zoneId);
				const sz = subZones?.find((z) => z.id === c.idx);
				if (sz) sz.label = name;
			}
		}

		// Cache results
		if (!this.plugin.cache.zones) this.plugin.cache.zones = {};
		this.plugin.cache.zones[cacheKey] = {
			k,
			model,
			assignments: assignMap,
			labels: labelMap,
			llmEnhanced: this.plugin.settings.enableLLMZoneNaming,
			centroids: centroids.map((c) => encodeFloat32(c)),
			subAssignments: subAssignmentsCache,
			subLabels: subLabelsCache,
		};
		await this.plugin.saveCache();
	}

	// ===================== view switching =====================

	private enterLocalView(centerPath: string) {
		const center = this.allPoints.find((p) => p.path === centerPath);
		if (!center) return;
		this.localCenterPath = centerPath;

		// Gather N nearest + center
		const sorted = this.allPoints
			.map((p) => ({ p, d: dist2D(center, p) }))
			.sort((a, b) => a.d - b.d)
			.slice(0, this.localNeighborCount + 1);

		// Re-normalize local coordinates so they fill [-1, 1] while preserving ratios
		const localPts = sorted.map((s) => ({ ...s.p })); // shallow clone
		let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
		for (const p of localPts) {
			if (p.x < minX) minX = p.x;
			if (p.x > maxX) maxX = p.x;
			if (p.y < minY) minY = p.y;
			if (p.y > maxY) maxY = p.y;
		}
		const cx = (minX + maxX) / 2;
		const cy = (minY + maxY) / 2;
		const range = Math.max(maxX - minX, maxY - minY) || 0.01;
		const scale = 1.6 / range; // fill ~80% of [-1,1]
		for (const p of localPts) {
			p.x = (p.x - cx) * scale;
			p.y = (p.y - cy) * scale;
		}

		// Store transform for mapping global zone → local space
		this.localCX = cx;
		this.localCY = cy;
		this.localScale = scale;

		// Look up pre-computed sub-zones from the parent global zone
		this.localZones = [];
		const parentZone = this.zones.find((z) => z.memberPaths.includes(centerPath));
		if (parentZone) {
			const subZones = this.subZonesMap.get(parentZone.id);
			if (subZones) {
				this.localZones = subZones.map((sz) =>
					transformZoneToLocal(sz, cx, cy, scale)
				);
			}
		}

		this.points = localPts;
		this.selectedIdx = localPts.findIndex((p) => p.path === centerPath);
		this.hoverIdx = -1;
		this.zoom = 1;
		this.panX = 0;
		this.panY = 0;
		this.viewMode = "local";
		this.viewSwitchEl.classList.add("is-local");
		this.updateSwitchLabels();
		this.neighborGroup.style.display = "inline-flex";
		this.updateStatus();
		this.draw();
	}

	private enterGlobalView() {
		this.points = this.allPoints;
		this.hoverIdx = -1;
		this.selectedIdx = -1;
		this.localCenterPath = "";
		this.localZones = [];
		this.zoom = 1;
		this.panX = 0;
		this.panY = 0;
		this.viewMode = "global";
		this.viewSwitchEl.classList.remove("is-local");
		this.updateSwitchLabels();
		this.neighborGroup.style.display = "none";
		this.syncActiveNoteSelection();
		this.updateStatus();
		this.draw();
	}

	// ===================== coordinate transforms =====================

	private resizeCanvas() {
		const p = this.canvas.parentElement!;
		const w = p.clientWidth, h = p.clientHeight;
		this.canvas.width = w * this.dpr;
		this.canvas.height = h * this.dpr;
		this.canvas.style.width = w + "px";
		this.canvas.style.height = h + "px";
		this.ctx = this.canvas.getContext("2d")!;
		this.ctx.scale(this.dpr, this.dpr);
	}

	private w2s(wx: number, wy: number): ScreenPt {
		const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
		const s = Math.min(w, h) * 0.42 * this.zoom;
		return { x: w / 2 + this.panX + wx * s, y: h / 2 + this.panY - wy * s };
	}

	private s2w(sx: number, sy: number): { x: number; y: number } {
		const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
		const s = Math.min(w, h) * 0.42 * this.zoom;
		return { x: (sx - w / 2 - this.panX) / s, y: -(sy - h / 2 - this.panY) / s };
	}

	// ===================== coloring =====================

	private color(p: MapPoint): string {
		switch (this.plugin.settings.colorMode) {
			case "semantic": return this.semColor(p);
			case "folder": return this.folderColorMap.get(p.folder) || FOLDER_COLORS[0];
			case "type": {
				const t = p.noteType.toUpperCase();
				return TYPE_COLORS[t] || FOLDER_COLORS[hashStr(p.noteType) % FOLDER_COLORS.length];
			}
			case "cat": return p.cat ? (this.catColorMap.get(p.cat) || FOLDER_COLORS[0]) : FOLDER_COLORS[0];
			default: return FOLDER_COLORS[0];
		}
	}

	private semColor(p: MapPoint): string {
		if (p.semA < 0) return this.folderColorMap.get(p.folder) || FOLDER_COLORS[0];
		const cA = SEM_PALETTE[p.semA % SEM_PALETTE.length];
		if (p.semB < 0 || p.semA === p.semB) return cA;
		return lerpColor(cA, SEM_PALETTE[p.semB % SEM_PALETTE.length], 1 - (SEM_SPLIT[p.semW] ?? 0.5));
	}

	// ===================== draw =====================

	private draw() {
		const ctx = this.ctx;
		const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
		ctx.clearRect(0, 0, W, H);

		const pts = this.points;
		const th = this.theme;

		if (!pts.length) {
			ctx.fillStyle = th.textMuted;
			ctx.font = "15px var(--font-interface)";
			ctx.textAlign = "center";
			ctx.fillText("No points. Run re-embed + recompute layout in settings.", W / 2, H / 2);
			return;
		}

		const isLocal = this.viewMode === "local";
		const showLinks = this.plugin.settings.showLinks;
		const isSem = this.plugin.settings.colorMode === "semantic";

		// path→idx
		const idx = new Map<string, number>();
		pts.forEach((p, i) => idx.set(p.path, i));

		// precompute screen positions
		const scr: ScreenPt[] = pts.map((p) => this.w2s(p.x, p.y));

		// ---------- zones ----------
		if (this.plugin.settings.showZones) {
			const w2sFn = (wx: number, wy: number) => this.w2s(wx, wy);
			if (isLocal) {
				// Layer 1: global parent zone transformed to local space (faded)
				if (this.zones.length > 0) {
					const centerZone = this.zones.find((z) => z.memberPaths.includes(this.localCenterPath));
					if (centerZone) {
						const transformed = transformZoneToLocal(centerZone, this.localCX, this.localCY, this.localScale);
						drawZone(ctx, transformed, w2sFn, 0.4);
					}
				}
				// Layer 2: local sub-zones at full alpha with dashed border
				for (const zone of this.localZones) {
					drawZone(ctx, zone, w2sFn, 1, true);
				}
			} else if (this.zones.length > 0) {
				for (const zone of this.zones) {
					drawZone(ctx, zone, w2sFn, 1);
				}
			}
		}

		// ---------- links ----------
		if (showLinks) {
			ctx.save();
			ctx.strokeStyle = isLocal ? th.linkStrokeLocal : th.linkStroke;
			ctx.lineWidth = isLocal ? 0.8 : 1;
			for (let i = 0; i < pts.length; i++) {
				for (const link of pts[i].links) {
					const j = idx.get(link);
					if (j == null || j <= i) continue;
					ctx.beginPath();
					ctx.moveTo(scr[i].x, scr[i].y);
					ctx.lineTo(scr[j].x, scr[j].y);
					ctx.stroke();
				}
			}
			ctx.restore();
		}

		// highlighted edges
		const fi = this.selectedIdx >= 0 ? this.selectedIdx : this.hoverIdx;
		if (fi >= 0 && showLinks) {
			ctx.save();
			ctx.strokeStyle = "#BCDC2B";
			ctx.lineWidth = 1.5;
			ctx.globalAlpha = 0.7;
			const fp = pts[fi];
			for (const link of fp.links) {
				const j = idx.get(link);
				if (j == null) continue;
				ctx.beginPath(); ctx.moveTo(scr[fi].x, scr[fi].y);
				ctx.lineTo(scr[j].x, scr[j].y); ctx.stroke();
			}
			for (let i = 0; i < pts.length; i++) {
				if (i === fi) continue;
				if (pts[i].links.includes(fp.path)) {
					ctx.beginPath(); ctx.moveTo(scr[i].x, scr[i].y);
					ctx.lineTo(scr[fi].x, scr[fi].y); ctx.stroke();
				}
			}
			ctx.restore();
		}

		// ---------- points ----------
		const baseR = isLocal
			? Math.max(5, 4 * this.zoom)
			: Math.max(2.5, 2.5 * this.zoom);

		for (let i = 0; i < pts.length; i++) {
			const s = scr[i];
			if (s.x < -80 || s.x > W + 80 || s.y < -80 || s.y > H + 80) continue;

			const sel = i === this.selectedIdx;
			const hov = i === this.hoverIdx;
			const r = sel ? baseR * 1.4 : baseR;
			const alpha = hov || sel ? 1.0 : 0.78;

			// subtle glow behind point
			if (isLocal || this.zoom > 2) {
				const glowR = r * 2.5;
				const grad = ctx.createRadialGradient(s.x, s.y, r * 0.3, s.x, s.y, glowR);
				const c = this.color(pts[i]);
				grad.addColorStop(0, c.slice(0, 7) + "30");
				grad.addColorStop(1, c.slice(0, 7) + "00");
				ctx.fillStyle = grad;
				ctx.globalAlpha = alpha * 0.5;
				ctx.beginPath();
				ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
				ctx.fill();
			}

			// point
			if (isSem && pts[i].semA >= 0 && pts[i].semB >= 0 && pts[i].semA !== pts[i].semB) {
				this.drawSemPt(ctx, s.x, s.y, r, pts[i], alpha);
			} else {
				ctx.beginPath();
				ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
				ctx.fillStyle = this.color(pts[i]);
				ctx.globalAlpha = alpha;
				ctx.fill();
			}
			ctx.globalAlpha = 1;
		}

		// ---------- selection ring ----------
		if (this.selectedIdx >= 0) {
			const s = scr[this.selectedIdx];
			ctx.beginPath();
			ctx.arc(s.x, s.y, baseR * 2.2, 0, Math.PI * 2);
			ctx.strokeStyle = "#C9963B";
			ctx.lineWidth = 1.5;
			ctx.stroke();
		}

		// ---------- labels ----------
		if (isLocal) {
			this.drawLocalLabels(ctx, pts, scr, baseR);
		} else {
			const alpha = Math.min(1, Math.max(0, (this.zoom - 3) / 3));
			if (alpha > 0.01) this.drawGlobalLabels(ctx, pts, scr, alpha, W, H);
		}

		// ---------- minimap (local only) ----------
		if (isLocal) {
			this.drawMinimap(ctx, W, H);
		}

		// ---------- hover tooltip (global, when labels hidden) ----------
		const globalAlpha = Math.min(1, Math.max(0, (this.zoom - 3) / 3));
		if (this.hoverIdx >= 0 && !isLocal && globalAlpha < 0.5) {
			this.drawTooltip(ctx, scr[this.hoverIdx], pts[this.hoverIdx].title);
		}
	}

	// ---------- semantic point ----------
	private drawSemPt(ctx: CanvasRenderingContext2D, sx: number, sy: number, r: number, p: MapPoint, a: number) {
		const cA = SEM_PALETTE[p.semA % SEM_PALETTE.length];
		const cB = SEM_PALETTE[p.semB % SEM_PALETTE.length];
		const split = SEM_SPLIT[p.semW] ?? 0.5;

		const grad = ctx.createConicGradient(0, sx, sy);
		grad.addColorStop(0, cA);
		grad.addColorStop(split, cA);
		grad.addColorStop(Math.min(split + 0.001, 1), cB);
		grad.addColorStop(1, cB);

		ctx.beginPath();
		ctx.arc(sx, sy, r, 0, Math.PI * 2);
		ctx.fillStyle = grad;
		ctx.globalAlpha = a;
		ctx.fill();

		// frosted highlight
		ctx.globalAlpha = a * 0.12;
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.arc(sx - r * 0.2, sy - r * 0.25, r * 0.5, 0, Math.PI * 2);
		ctx.fill();
	}

	// ---------- labels ----------

	private drawLocalLabels(ctx: CanvasRenderingContext2D, pts: MapPoint[], scr: ScreenPt[], baseR: number) {
		const th = this.theme;
		// Place labels using angle from center-of-mass to avoid overlap
		const comX = scr.reduce((s, p) => s + p.x, 0) / scr.length;
		const comY = scr.reduce((s, p) => s + p.y, 0) / scr.length;

		const fontSize = 11;
		ctx.font = `${fontSize}px var(--font-interface)`;

		// Collect label rects to check overlap
		const placed: { x: number; y: number; w: number; h: number }[] = [];

		for (let i = 0; i < pts.length; i++) {
			const s = scr[i];
			const label = pts[i].title.length > 45 ? pts[i].title.slice(0, 42) + "..." : pts[i].title;
			const tw = ctx.measureText(label).width;
			const pad = 4;
			const bw = tw + pad * 2;
			const bh = fontSize + pad * 2;
			const offset = baseR + 6;

			// Angle from center of mass
			const angle = Math.atan2(s.y - comY, s.x - comX);

			// Try primary placement along angle, then flip
			let bestX = 0, bestY = 0, bestOverlap = Infinity;
			for (const flip of [0, Math.PI, Math.PI / 2, -Math.PI / 2]) {
				const a = angle + flip;
				let tx = s.x + Math.cos(a) * offset;
				let ty = s.y + Math.sin(a) * offset;
				// Anchor: if label is to the left of point, right-align
				if (Math.cos(a) < -0.3) tx -= bw;
				else if (Math.cos(a) < 0.3) tx -= bw / 2;
				ty -= bh / 2;

				let overlap = 0;
				for (const r of placed) {
					const ox = Math.max(0, Math.min(tx + bw, r.x + r.w) - Math.max(tx, r.x));
					const oy = Math.max(0, Math.min(ty + bh, r.y + r.h) - Math.max(ty, r.y));
					overlap += ox * oy;
				}
				if (overlap < bestOverlap) {
					bestOverlap = overlap;
					bestX = tx;
					bestY = ty;
					if (overlap === 0) break;
				}
			}

			placed.push({ x: bestX, y: bestY, w: bw, h: bh });

			const isSel = i === this.selectedIdx;

			// pill background
			ctx.fillStyle = isSel ? "rgba(201,150,59,0.18)" : th.labelPillBg;
			ctx.beginPath();
			ctx.roundRect(bestX, bestY, bw, bh, 4);
			ctx.fill();

			// border for selected
			if (isSel) {
				ctx.strokeStyle = "rgba(201,150,59,0.4)";
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// text
			ctx.fillStyle = isSel ? "#C9963B" : th.text;
			ctx.globalAlpha = isSel ? 1 : 0.88;
			ctx.textAlign = "left";
			ctx.fillText(label, bestX + pad, bestY + fontSize + pad - 2);
			ctx.globalAlpha = 1;

			// connector line
			ctx.strokeStyle = th.connectorLine;
			ctx.lineWidth = 0.5;
			ctx.beginPath();
			ctx.moveTo(s.x, s.y);
			ctx.lineTo(bestX + bw / 2, bestY + bh / 2);
			ctx.stroke();
		}
	}

	private drawGlobalLabels(ctx: CanvasRenderingContext2D, pts: MapPoint[], scr: ScreenPt[], alpha: number, W: number, H: number) {
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.font = "9px var(--font-interface)";
		ctx.fillStyle = this.theme.text;
		ctx.textAlign = "left";
		for (let i = 0; i < pts.length; i++) {
			const s = scr[i];
			if (s.x < -50 || s.x > W + 50 || s.y < -50 || s.y > H + 50) continue;
			const t = pts[i].title.length > 40 ? pts[i].title.slice(0, 37) + "..." : pts[i].title;
			ctx.fillText(t, s.x + 6, s.y + 3);
		}
		ctx.restore();
	}

	// ---------- tooltip ----------
	private drawTooltip(ctx: CanvasRenderingContext2D, s: ScreenPt, title: string) {
		const th = this.theme;
		const label = title.length > 60 ? title.slice(0, 57) + "..." : title;
		ctx.font = "12px var(--font-interface)";
		const tw = ctx.measureText(label).width;
		const pad = 7;
		const tx = s.x + 14, ty = s.y - 14;

		ctx.fillStyle = th.panelBg;
		ctx.beginPath();
		ctx.roundRect(tx - pad, ty - 15, tw + pad * 2, 22, 5);
		ctx.fill();
		ctx.strokeStyle = th.panelBorder;
		ctx.lineWidth = 1;
		ctx.stroke();

		ctx.fillStyle = th.text;
		ctx.textAlign = "left";
		ctx.fillText(label, tx, ty);
	}

	private updateSwitchLabels() {
		const labels = this.viewSwitchEl.querySelectorAll(".switch-label");
		if (this.viewMode === "local") {
			labels[0]?.classList.remove("is-active");
			labels[1]?.classList.add("is-active");
		} else {
			labels[0]?.classList.add("is-active");
			labels[1]?.classList.remove("is-active");
		}
	}

	// ===================== active note sync =====================

	private syncActiveNoteSelection() {
		const file = this.app.workspace.getActiveFile();
		if (!file) return;
		const idx = this.points.findIndex((p) => p.path === file.path);
		if (idx >= 0 && idx !== this.selectedIdx) {
			this.selectedIdx = idx;
			this.draw();
		}
	}

	// ===================== minimap =====================

	private drawMinimap(ctx: CanvasRenderingContext2D, W: number, H: number) {
		const size = Math.min(160, Math.min(W, H) * 0.28);
		const pad = 14;
		const corner = this.plugin.settings.minimapCorner;

		let ox: number, oy: number;
		if (corner === "top-left") { ox = pad; oy = pad; }
		else if (corner === "top-right") { ox = W - size - pad; oy = pad; }
		else if (corner === "bottom-right") { ox = W - size - pad; oy = H - size - pad; }
		else { ox = pad; oy = H - size - pad; } // bottom-left

		// background
		const th = this.theme;
		ctx.save();
		ctx.fillStyle = th.panelBg;
		ctx.strokeStyle = th.panelBorder;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.roundRect(ox, oy, size, size, 6);
		ctx.fill();
		ctx.stroke();
		ctx.clip();

		// draw all points scaled to fit minimap
		const all = this.allPoints;
		const margin = 8;
		const inner = size - margin * 2;

		// find bounds
		let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
		for (const p of all) {
			if (p.x < minX) minX = p.x;
			if (p.x > maxX) maxX = p.x;
			if (p.y < minY) minY = p.y;
			if (p.y > maxY) maxY = p.y;
		}
		const rangeX = maxX - minX || 0.01;
		const rangeY = maxY - minY || 0.01;
		const scale = inner / Math.max(rangeX, rangeY);
		const cxOff = ox + margin + (inner - rangeX * scale) / 2;
		const cyOff = oy + margin + (inner - rangeY * scale) / 2;

		const localPaths = new Set(this.points.map((p) => p.path));

		// draw all points — local neighborhood highlighted, rest dimmed
		for (const p of all) {
			const sx = cxOff + (p.x - minX) * scale;
			const sy = cyOff + (maxY - p.y) * scale; // flip y
			const inLocal = localPaths.has(p.path);
			ctx.beginPath();
			ctx.arc(sx, sy, inLocal ? 3 : 1.5, 0, Math.PI * 2);
			ctx.fillStyle = inLocal ? this.color(p) : th.minimapDimPoint;
			ctx.globalAlpha = inLocal ? 1 : 0.7;
			ctx.fill();
		}

		// highlight selected
		if (this.selectedIdx >= 0) {
			const sp = this.points[this.selectedIdx];
			const orig = all.find((p) => p.path === sp.path);
			if (orig) {
				const sx = cxOff + (orig.x - minX) * scale;
				const sy = cyOff + (maxY - orig.y) * scale;
				ctx.beginPath();
				ctx.arc(sx, sy, 4, 0, Math.PI * 2);
				ctx.strokeStyle = "#C9963B";
				ctx.lineWidth = 1.5;
				ctx.globalAlpha = 1;
				ctx.stroke();
			}
		}

		ctx.restore();
	}

	// ===================== interactions =====================

	private setupInteractions() {
		const c = this.canvas;

		c.addEventListener("mousedown", (e) => {
			this.dragging = true;
			this.dragStartX = e.clientX;
			this.dragStartY = e.clientY;
			this.dragPanX = this.panX;
			this.dragPanY = this.panY;
			c.style.cursor = "grabbing";
		});

		c.addEventListener("mousemove", (e) => {
			if (this.dragging) {
				this.panX = this.dragPanX + (e.clientX - this.dragStartX);
				this.panY = this.dragPanY + (e.clientY - this.dragStartY);
				this.draw();
				return;
			}
			const rect = c.getBoundingClientRect();
			const mx = e.clientX - rect.left, my = e.clientY - rect.top;
			const hitR = Math.max(10, 8 * this.zoom);
			let best = -1, bestD = Infinity;
			for (let i = 0; i < this.points.length; i++) {
				const s = this.w2s(this.points[i].x, this.points[i].y);
				const d = (s.x - mx) ** 2 + (s.y - my) ** 2;
				if (d < hitR * hitR && d < bestD) { bestD = d; best = i; }
			}
			if (best !== this.hoverIdx) {
				this.hoverIdx = best;
				c.style.cursor = best >= 0 ? "pointer" : "grab";
				this.draw();
			}
		});

		c.addEventListener("mouseup", (e) => {
			const was = this.dragging;
			this.dragging = false;
			c.style.cursor = this.hoverIdx >= 0 ? "pointer" : "grab";
			const dx = e.clientX - this.dragStartX, dy = e.clientY - this.dragStartY;
			if (was && dx * dx + dy * dy < 9) this.handleClick();
		});

		c.addEventListener("mouseleave", () => {
			this.dragging = false;
			if (this.hoverIdx !== -1) { this.hoverIdx = -1; this.draw(); }
		});

		c.addEventListener("wheel", (e) => {
			e.preventDefault();
			const rect = c.getBoundingClientRect();
			const mx = e.clientX - rect.left, my = e.clientY - rect.top;
			const before = this.s2w(mx, my);
			this.zoom = Math.max(0.1, Math.min(50, this.zoom * (e.deltaY < 0 ? 1.08 : 0.92)));
			const cw = c.clientWidth, ch = c.clientHeight;
			const s = Math.min(cw, ch) * 0.42 * this.zoom;
			this.panX = mx - cw / 2 - before.x * s;
			this.panY = my - ch / 2 + before.y * s;
			this.updateStatus();
			this.draw();
		}, { passive: false });

		// --- touch support for mobile ---
		let lastTouchDist = 0;
		let lastTouchMidX = 0;
		let lastTouchMidY = 0;

		c.addEventListener("touchstart", (e) => {
			e.preventDefault();
			if (e.touches.length === 1) {
				const t = e.touches[0];
				this.dragging = true;
				this.dragStartX = t.clientX;
				this.dragStartY = t.clientY;
				this.dragPanX = this.panX;
				this.dragPanY = this.panY;
				// hit-test for hover
				const rect = c.getBoundingClientRect();
				const mx = t.clientX - rect.left, my = t.clientY - rect.top;
				const hitR = Math.max(16, 10 * this.zoom);
				let best = -1, bestD = Infinity;
				for (let i = 0; i < this.points.length; i++) {
					const s = this.w2s(this.points[i].x, this.points[i].y);
					const d = (s.x - mx) ** 2 + (s.y - my) ** 2;
					if (d < hitR * hitR && d < bestD) { bestD = d; best = i; }
				}
				this.hoverIdx = best;
			} else if (e.touches.length === 2) {
				this.dragging = false;
				const [a, b] = [e.touches[0], e.touches[1]];
				lastTouchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
				lastTouchMidX = (a.clientX + b.clientX) / 2;
				lastTouchMidY = (a.clientY + b.clientY) / 2;
			}
		}, { passive: false });

		c.addEventListener("touchmove", (e) => {
			e.preventDefault();
			if (e.touches.length === 1 && this.dragging) {
				const t = e.touches[0];
				this.panX = this.dragPanX + (t.clientX - this.dragStartX);
				this.panY = this.dragPanY + (t.clientY - this.dragStartY);
				this.draw();
			} else if (e.touches.length === 2) {
				const [a, b] = [e.touches[0], e.touches[1]];
				const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
				const midX = (a.clientX + b.clientX) / 2;
				const midY = (a.clientY + b.clientY) / 2;
				const rect = c.getBoundingClientRect();
				const mx = midX - rect.left, my = midY - rect.top;
				const before = this.s2w(mx, my);
				const factor = dist / (lastTouchDist || 1);
				this.zoom = Math.max(0.1, Math.min(50, this.zoom * factor));
				const cw = c.clientWidth, ch = c.clientHeight;
				const s = Math.min(cw, ch) * 0.42 * this.zoom;
				this.panX = mx - cw / 2 - before.x * s + (midX - lastTouchMidX);
				this.panY = my - ch / 2 + before.y * s + (midY - lastTouchMidY);
				lastTouchDist = dist;
				lastTouchMidX = midX;
				lastTouchMidY = midY;
				this.updateStatus();
				this.draw();
			}
		}, { passive: false });

		c.addEventListener("touchend", (e) => {
			if (e.touches.length === 0 && this.dragging) {
				this.dragging = false;
				const dx = (e.changedTouches[0]?.clientX ?? 0) - this.dragStartX;
				const dy = (e.changedTouches[0]?.clientY ?? 0) - this.dragStartY;
				if (dx * dx + dy * dy < 16) this.handleClick();
				this.hoverIdx = -1;
				this.draw();
			}
		});
	}

	private handleClick() {
		const i = this.hoverIdx;
		if (i < 0) {
			if (this.viewMode === "local") this.enterGlobalView();
			else { this.selectedIdx = -1; this.draw(); }
			return;
		}

		this.selectedIdx = i;
		const p = this.points[i];

		// Open note in a separate leaf (not this one — that would destroy the map)
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		const targetLeaf = leaves.length > 0 ? leaves[0] : this.app.workspace.getLeaf("tab");
		targetLeaf.openFile(this.app.vault.getFileByPath(p.path)!);

		// In local mode, re-center on clicked note
		if (this.viewMode === "local") {
			this.enterLocalView(p.path);
		} else {
			this.draw();
		}
	}

	private updateStatus() {
		const n = this.points.length, t = this.allPoints.length;
		const z = this.zoom.toFixed(1);
		this.statusEl.textContent = this.viewMode === "local"
			? `local: ${n}/${t} notes | zoom ${z}x`
			: `${t} notes | zoom ${z}x`;
	}

	async refresh(): Promise<void> {
		const wasLocal = this.viewMode === "local";
		const wasPath = this.localCenterPath;
		await this.loadPoints();
		if (wasLocal && wasPath) {
			this.enterLocalView(wasPath);
		} else {
			this.resizeCanvas();
			this.draw();
		}
	}
}
