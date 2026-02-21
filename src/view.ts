import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import type ChorographiaPlugin from "./main";
import type { NoteCache, ZoneCacheEntry } from "./cache";
import { decodeFloat32, encodeFloat32 } from "./cache";
import { kMeans, computeSemanticAssignments } from "./kmeans";
import { Zone, Continent, BorderEdge, WorldMapResult, WorldMapSettings, computeZones, computeWorldMapZones, computeWorldMapSubZones, drawZone, drawZoneLabel, type LabelConfig } from "./zones";
import { generateZoneNames } from "./zoneNaming";
import { generateZoneNamesOllama } from "./ollama";
import { generateZoneNamesOpenRouter } from "./openrouter";

export const VIEW_TYPE = "chorographia-map";

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
	tags: string[];
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
function themeOutlineColor(): string {
	const isDark = document.body.classList.contains("theme-dark");
	return isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
}
function hashStr(s: string): number {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
	return Math.abs(h);
}
// ---------- theme ----------
interface ThemeColors {
	panelBg: string;         // tooltip bg, minimap bg
	panelBorder: string;     // borders on tooltips, minimap, controls
	text: string;            // primary text (labels, tooltips)
	textMuted: string;       // empty-state text, dimmed elements
	linkStroke: string;      // link edges
}

const DARK: ThemeColors = {
	panelBg: "rgba(15,15,26,0.92)",
	panelBorder: "rgba(44,44,58,0.6)",
	text: "#D6D6E0",
	textMuted: "#8E9AAF",
	linkStroke: "rgba(214,214,224,0.18)",
};

const LIGHT: ThemeColors = {
	panelBg: "rgba(255,255,255,0.92)",
	panelBorder: "rgba(160,160,180,0.4)",
	text: "#1e1e2e",
	textMuted: "#6e6e80",
	linkStroke: "rgba(60,60,80,0.22)",
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
	private continents: Continent[] = [];
	private borderEdges: BorderEdge[] = [];
	private subZonesMap = new Map<number, Zone[]>(); // globalZoneId → sub-zones (global coords)
	private zoom = 1;
	private panX = 0;
	private panY = 0;
	private hoverIdx = -1;
	private selectedIdx = -1;

	// animation
	private animating = false;
	private animStartTime = 0;
	private animDuration = 800;
	private animStartPanX = 0;
	private animStartPanY = 0;
	private animTargetPanX = 0;
	private animTargetPanY = 0;
	private animFrameId = 0;

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
	private menuBtn!: HTMLButtonElement;
	private menuPanel!: HTMLDivElement;
	private colorModeSelect!: HTMLSelectElement;
	private linksToggle!: HTMLInputElement;
	private zonesToggle!: HTMLInputElement;
	private subZonesToggle!: HTMLInputElement;
	private titlesToggle!: HTMLInputElement;
	private minimapSelect!: HTMLSelectElement;
	private searchInput!: HTMLInputElement;
	private searchResults!: HTMLDivElement;
	private zoneJumpSelect!: HTMLSelectElement;
	private filterPanel!: HTMLDivElement;
	private activeFolderFilters = new Set<string>();
	private activeTagFilters = new Set<string>();

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

	async onClose() {
		cancelAnimationFrame(this.animFrameId);
	}

	// ===================== controls =====================

	private buildControls(root: HTMLElement) {
		// Gear button
		this.menuBtn = root.createEl("button", { cls: "chorographia-menu-btn", attr: { "aria-label": "Map settings" } });
		this.menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

		// Menu panel
		this.menuPanel = root.createEl("div", { cls: "chorographia-menu" });

		// Color row
		const colorRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		colorRow.createEl("span", { text: "Color" });
		this.colorModeSelect = colorRow.createEl("select");
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

		// Links row
		const linksRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		const linksLbl = linksRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.linksToggle = linksLbl.createEl("input", { type: "checkbox" });
		this.linksToggle.checked = this.plugin.settings.showLinks;
		linksLbl.appendText(" Links");
		this.linksToggle.addEventListener("change", async () => {
			this.plugin.settings.showLinks = this.linksToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Zones row
		const zonesRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		const zonesLbl = zonesRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.zonesToggle = zonesLbl.createEl("input", { type: "checkbox" });
		this.zonesToggle.checked = this.plugin.settings.showZones;
		zonesLbl.appendText(" Zones");
		this.zonesToggle.addEventListener("change", async () => {
			this.plugin.settings.showZones = this.zonesToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Sub-zones row
		const subZonesRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		const subZonesLbl = subZonesRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.subZonesToggle = subZonesLbl.createEl("input", { type: "checkbox" });
		this.subZonesToggle.checked = this.plugin.settings.showSubZones;
		subZonesLbl.appendText(" Sub-zones");
		this.subZonesToggle.addEventListener("change", async () => {
			this.plugin.settings.showSubZones = this.subZonesToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Titles row
		const titlesRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		const titlesLbl = titlesRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.titlesToggle = titlesLbl.createEl("input", { type: "checkbox" });
		this.titlesToggle.checked = this.plugin.settings.showNoteTitles;
		titlesLbl.appendText(" Titles");
		this.titlesToggle.addEventListener("change", async () => {
			this.plugin.settings.showNoteTitles = this.titlesToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Minimap row
		const minimapRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		minimapRow.createEl("span", { text: "Minimap" });
		this.minimapSelect = minimapRow.createEl("select");
		for (const [v, t] of [
			["off", "Off"], ["top-left", "TL"], ["top-right", "TR"],
			["bottom-left", "BL"], ["bottom-right", "BR"],
		] as const)
			this.minimapSelect.createEl("option", { text: t, value: v });
		this.minimapSelect.value = this.plugin.settings.minimapCorner;
		this.minimapSelect.addEventListener("change", async () => {
			this.plugin.settings.minimapCorner = this.minimapSelect.value as any;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Separator + Navigation
		this.menuPanel.createEl("div", { cls: "chorographia-menu-sep" });

		// Note search
		const searchRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row chorographia-search-row" });
		this.searchInput = searchRow.createEl("input", {
			cls: "chorographia-search-input",
			attr: { type: "text", placeholder: "Jump to note..." },
		});
		this.searchResults = this.menuPanel.createEl("div", { cls: "chorographia-search-results" });
		this.searchInput.addEventListener("input", () => this.onSearchInput());
		this.searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") this.onSearchSelect();
			if (e.key === "Escape") {
				this.searchInput.value = "";
				this.searchResults.empty();
			}
		});

		// Zone jump
		const zoneRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		zoneRow.createEl("span", { text: "Zone" });
		this.zoneJumpSelect = zoneRow.createEl("select");
		this.zoneJumpSelect.createEl("option", { text: "—", value: "" });
		this.zoneJumpSelect.addEventListener("change", () => this.onZoneJump());

		// Filter section
		this.menuPanel.createEl("div", { cls: "chorographia-menu-sep" });
		const filterHeader = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		filterHeader.createEl("span", { text: "Filters", cls: "chorographia-filter-header" });
		const filterClearBtn = filterHeader.createEl("button", { cls: "chorographia-filter-clear", text: "Clear" });
		filterClearBtn.addEventListener("click", () => this.clearFilters());
		this.filterPanel = this.menuPanel.createEl("div", { cls: "chorographia-filter-panel" });

		// Export row
		this.menuPanel.createEl("div", { cls: "chorographia-menu-sep" });
		const exportRow = this.menuPanel.createEl("div", { cls: "chorographia-menu-row" });
		const exportBtn = exportRow.createEl("button", { cls: "chorographia-menu-export", text: "Export PNG" });
		exportBtn.addEventListener("click", () => this.exportMap());

		// Toggle menu on gear click
		this.menuBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			this.menuPanel.classList.toggle("is-open");
		});

		// Close menu when clicking canvas
		this.canvas.addEventListener("mousedown", () => {
			this.menuPanel.classList.remove("is-open");
		}, true);
	}

	private exportMap() {
		this.canvas.toBlob((blob) => {
			if (!blob) {
				new Notice("Chorographia: Export failed.");
				return;
			}
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const date = new Date().toISOString().slice(0, 10);
			a.download = `chorographia-${date}.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			new Notice("Chorographia: Map exported.");
		}, "image/png");
	}

	private onSearchInput() {
		const query = this.searchInput.value.toLowerCase().trim();
		this.searchResults.empty();
		if (!query || query.length < 2) return;

		const matches = this.allPoints
			.filter((p) => p.title.toLowerCase().includes(query))
			.slice(0, 8);

		for (const m of matches) {
			const item = this.searchResults.createEl("div", {
				cls: "chorographia-search-item",
				text: m.title.length > 50 ? m.title.slice(0, 47) + "..." : m.title,
			});
			item.addEventListener("click", () => {
				this.zoom = 8;
				this.animateTo(m.x, m.y);
				this.searchInput.value = "";
				this.searchResults.empty();
				this.menuPanel.classList.remove("is-open");
			});
		}
	}

	private onSearchSelect() {
		const first = this.searchResults.querySelector(".chorographia-search-item") as HTMLElement | null;
		if (first) first.click();
	}

	private onZoneJump() {
		const val = this.zoneJumpSelect.value;
		if (!val) return;
		const idx = parseInt(val, 10);
		const zone = this.zones[idx];
		if (!zone) return;

		// Compute zone centroid in world coords
		const blob = zone.blob;
		if (blob.length === 0) return;
		const cx = blob.reduce((s, p) => s + p.x, 0) / blob.length;
		const cy = blob.reduce((s, p) => s + p.y, 0) / blob.length;

		this.zoom = 3;
		this.animateTo(cx, cy);
		this.zoneJumpSelect.value = "";
		this.menuPanel.classList.remove("is-open");
	}

	private updateZoneJumpOptions() {
		// Clear existing options (keep the placeholder)
		while (this.zoneJumpSelect.options.length > 1) {
			this.zoneJumpSelect.remove(1);
		}
		for (let i = 0; i < this.zones.length; i++) {
			this.zoneJumpSelect.createEl("option", {
				text: this.zones[i].label || `Zone ${i + 1}`,
				value: String(i),
			});
		}
	}

	private buildFilterUI() {
		this.filterPanel.empty();

		// Collect unique folders and tags from all points
		const folders = new Set<string>();
		const tags = new Set<string>();
		for (const p of this.allPoints) {
			if (p.folder) folders.add(p.folder);
			for (const t of p.tags) tags.add(t);
		}

		if (folders.size === 0 && tags.size === 0) {
			this.filterPanel.createEl("span", {
				text: "No filters available",
				cls: "chorographia-filter-empty",
			});
			return;
		}

		// Folders
		if (folders.size > 0) {
			const folderSection = this.filterPanel.createEl("div", { cls: "chorographia-filter-section" });
			folderSection.createEl("span", { text: "Folders", cls: "chorographia-filter-title" });
			const folderList = folderSection.createEl("div", { cls: "chorographia-filter-list" });
			for (const f of [...folders].sort()) {
				const lbl = folderList.createEl("label", { cls: "chorographia-filter-item" });
				const cb = lbl.createEl("input", { type: "checkbox" });
				cb.checked = !this.activeFolderFilters.has(f);
				lbl.appendText(` ${f}`);
				cb.addEventListener("change", () => {
					if (cb.checked) {
						this.activeFolderFilters.delete(f);
					} else {
						this.activeFolderFilters.add(f);
					}
					this.applyFilters();
				});
			}
		}

		// Tags
		if (tags.size > 0) {
			const tagSection = this.filterPanel.createEl("div", { cls: "chorographia-filter-section" });
			tagSection.createEl("span", { text: "Tags", cls: "chorographia-filter-title" });
			const tagList = tagSection.createEl("div", { cls: "chorographia-filter-list" });
			for (const t of [...tags].sort()) {
				const lbl = tagList.createEl("label", { cls: "chorographia-filter-item" });
				const cb = lbl.createEl("input", { type: "checkbox" });
				cb.checked = !this.activeTagFilters.has(t);
				lbl.appendText(` #${t}`);
				cb.addEventListener("change", () => {
					if (cb.checked) {
						this.activeTagFilters.delete(t);
					} else {
						this.activeTagFilters.add(t);
					}
					this.applyFilters();
				});
			}
		}
	}

	private applyFilters() {
		const hasFolderFilter = this.activeFolderFilters.size > 0;
		const hasTagFilter = this.activeTagFilters.size > 0;

		if (!hasFolderFilter && !hasTagFilter) {
			this.points = this.allPoints;
		} else {
			this.points = this.allPoints.filter((p) => {
				if (hasFolderFilter && this.activeFolderFilters.has(p.folder)) return false;
				if (hasTagFilter && !p.tags.some((t) => this.activeTagFilters.has(t))) return false;
				return true;
			});
		}
		this.updateStatus();
		this.draw();
	}

	private clearFilters() {
		this.activeFolderFilters.clear();
		this.activeTagFilters.clear();
		this.points = this.allPoints;
		this.buildFilterUI();
		this.updateStatus();
		this.draw();
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
				tags: n.tags || [],
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
		try {
			await this.computeAndCacheZones();
		} catch (e) {
			console.error("Chorographia: zone computation failed", e);
		}
		this.updateZoneJumpOptions();
		this.buildFilterUI();
		this.applyFilters();
		this.draw();
	}

	private async computeAndCacheZones(): Promise<void> {
		const k = this.plugin.settings.zoneGranularity;
		const model = this.plugin.embeddingModelString;
		const s = this.plugin.settings;
		const cacheKey = s.zoneStyle === "worldmap"
			? `${k}_${model}_worldmap_${s.worldmapSeaLevel}_${s.worldmapUnity}_${s.worldmapRuggedness}`
			: `${k}_${model}_${s.zoneStyle}`;
		const isWorldmap = this.plugin.settings.zoneStyle === "worldmap";

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
				if (isWorldmap) {
					// Rebuild sub-centroids from cached sub-assignments
					const subCentroidsByCluster = new Map<number, { x: number; y: number }[]>();
					if (cached.subAssignments) {
						for (const zoneIdStr of Object.keys(cached.subAssignments)) {
							const zoneId = Number(zoneIdStr);
							const subAssign = cached.subAssignments[zoneId];
							if (!subAssign) continue;
							const subGroups = new Map<number, { x: number; y: number }[]>();
							for (const p of this.allPoints) {
								if (subAssign[p.path] != null) {
									const s = subAssign[p.path];
									if (!subGroups.has(s)) subGroups.set(s, []);
									subGroups.get(s)!.push({ x: p.x, y: p.y });
								}
							}
							const subCentroids: { x: number; y: number }[] = [];
							for (const [_, pts] of [...subGroups].sort((a, b) => a[0] - b[0])) {
								let cx = 0, cy = 0;
								for (const p of pts) { cx += p.x; cy += p.y; }
								subCentroids.push({ x: cx / pts.length, y: cy / pts.length });
							}
							subCentroidsByCluster.set(zoneId, subCentroids);
						}
					}
					const wmSettings: WorldMapSettings = {
						seaLevel: this.plugin.settings.worldmapSeaLevel,
						unity: this.plugin.settings.worldmapUnity,
						ruggedness: this.plugin.settings.worldmapRuggedness,
					};
					const result = computeWorldMapZones(pointsForZones, assignments, k, subCentroidsByCluster, wmSettings);
					this.zones = result.zones;
					this.continents = result.continents;
					this.borderEdges = result.borderEdges;
				} else {
					this.zones = computeZones(pointsForZones, assignments, k);
					this.continents = [];
					this.borderEdges = [];
				}
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
							const subZones = isWorldmap
								? computeWorldMapSubZones(zone.hull, subPts, subIdx, localK)
								: computeZones(subPts, subIdx, localK);
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

		// Run k-means (or assign to locked centroids)
		let assignments: number[];
		let centroids: Float32Array[];

		const locked = this.plugin.settings.mapLocked;
		const lockedCentroids = this.plugin.cache.lockedCentroids;

		if (locked && lockedCentroids && lockedCentroids.length > 0) {
			// Assign each note to the nearest locked centroid
			centroids = lockedCentroids.map(c => decodeFloat32(c));
			assignments = vectors.map(v => {
				let bestIdx = 0, bestDist = Infinity;
				for (let c = 0; c < centroids.length; c++) {
					let sum = 0;
					for (let d = 0; d < v.length; d++) {
						const diff = v[d] - centroids[c][d];
						sum += diff * diff;
					}
					const dist = Math.sqrt(sum);
					if (dist < bestDist) { bestDist = dist; bestIdx = c; }
				}
				return bestIdx;
			});
		} else {
			const result = kMeans(vectors, k);
			assignments = result.assignments;
			centroids = result.centroids;
		}

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

		// Build path→vector lookup and group by cluster
		const vecByPath = new Map<string, Float32Array>();
		for (let i = 0; i < paths.length; i++) vecByPath.set(paths[i], vectors[i]);

		const localK = Math.max(2, Math.round(k / 4));
		const subAssignmentsCache: Record<number, Record<string, number>> = {};
		const subLabelsCache: Record<number, Record<number, string>> = {};

		// Group paths by cluster assignment
		const clusterMembers = new Map<number, { path: string; vec: Float32Array; x: number; y: number }[]>();
		for (let i = 0; i < paths.length; i++) {
			const c = assignments[i];
			if (!clusterMembers.has(c)) clusterMembers.set(c, []);
			const pt = this.allPoints.find((p) => p.path === paths[i]);
			if (pt) clusterMembers.get(c)!.push({ path: paths[i], vec: vectors[i], x: pt.x, y: pt.y });
		}

		// Compute sub-centroids per cluster (needed for worldmap province mesh)
		const subCentroidsByCluster = new Map<number, { x: number; y: number }[]>();
		for (const [clusterId, members] of clusterMembers) {
			if (members.length < localK) continue;

			const { assignments: subAssignments } = kMeans(members.map((m) => m.vec), localK);
			const subAssignMap: Record<string, number> = {};
			for (let i = 0; i < members.length; i++) subAssignMap[members[i].path] = subAssignments[i];
			subAssignmentsCache[clusterId] = subAssignMap;

			// Compute XY centroids per sub-cluster
			const subGroups = new Map<number, { x: number; y: number }[]>();
			for (let i = 0; i < members.length; i++) {
				const s = subAssignments[i];
				if (!subGroups.has(s)) subGroups.set(s, []);
				subGroups.get(s)!.push({ x: members[i].x, y: members[i].y });
			}
			const subCentroids: { x: number; y: number }[] = [];
			for (const [_, pts] of [...subGroups].sort((a, b) => a[0] - b[0])) {
				let cx = 0, cy = 0;
				for (const p of pts) { cx += p.x; cy += p.y; }
				subCentroids.push({ x: cx / pts.length, y: cy / pts.length });
			}
			subCentroidsByCluster.set(clusterId, subCentroids);
		}

		if (isWorldmap) {
			const wmSettings: WorldMapSettings = {
				seaLevel: this.plugin.settings.worldmapSeaLevel,
				unity: this.plugin.settings.worldmapUnity,
				ruggedness: this.plugin.settings.worldmapRuggedness,
			};
			const result = computeWorldMapZones(pointsForZones, pointAssignments, k, subCentroidsByCluster, wmSettings);
			this.zones = result.zones;
			this.continents = result.continents;
			this.borderEdges = result.borderEdges;
		} else {
			this.zones = computeZones(pointsForZones, pointAssignments, k);
			this.continents = [];
			this.borderEdges = [];
		}

		// Optionally enhance labels with LLM
		const labelMap: Record<number, string> = {};
		for (const z of this.zones) labelMap[z.id] = z.label;

		const skipLLMNaming = locked
			&& this.plugin.cache.lockedLabels
			&& Object.keys(this.plugin.cache.lockedLabels).length > 0;

		if (this.plugin.settings.enableLLMZoneNaming && !skipLLMNaming) {
			try {
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
			} catch (e) {
				console.error("Chorographia: LLM zone naming failed", e);
			}
		}

		// Build sub-zone geometry + labels
		const allSubClusters: { zoneId: number; idx: number; titles: string[] }[] = [];
		this.subZonesMap.clear();

		for (const zone of this.zones) {
			const subAssignMap = subAssignmentsCache[zone.id];
			if (!subAssignMap) continue;

			const subPts: { path: string; x: number; y: number; folder: string; cat: string }[] = [];
			const subIdx: number[] = [];
			for (const p of this.allPoints) {
				if (subAssignMap[p.path] != null) {
					subPts.push({ path: p.path, x: p.x, y: p.y, folder: p.folder, cat: p.cat });
					subIdx.push(subAssignMap[p.path]);
				}
			}
			if (subPts.length === 0) continue;

			// For starmap: generate full sub-zone geometry
			// For worldmap: provinces are in the mesh, but still generate for labels
			const subZones = isWorldmap
				? computeWorldMapSubZones(zone.hull, subPts, subIdx, localK)
				: computeZones(subPts, subIdx, localK);

			const subLabelMap: Record<number, string> = {};
			for (const sz of subZones) subLabelMap[sz.id] = sz.label;

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
		if (this.plugin.settings.enableLLMZoneNaming && !skipLLMNaming && allSubClusters.length > 0) {
			try {
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
			} catch (e) {
				console.error("Chorographia: LLM sub-zone naming failed", e);
			}
		}

		// Override labels with locked labels when map is locked
		if (locked && this.plugin.cache.lockedLabels) {
			for (const zone of this.zones) {
				const lockedLabel = this.plugin.cache.lockedLabels[zone.id];
				if (lockedLabel) {
					zone.label = lockedLabel;
					labelMap[zone.id] = lockedLabel;
				}
			}
		}
		if (locked && this.plugin.cache.lockedSubLabels) {
			for (const [zoneId, subZones] of this.subZonesMap) {
				const lockedSubs = this.plugin.cache.lockedSubLabels[zoneId];
				if (!lockedSubs) continue;
				for (const sz of subZones) {
					const lockedLabel = lockedSubs[sz.id];
					if (lockedLabel) {
						sz.label = lockedLabel;
						subLabelsCache[zoneId][sz.id] = lockedLabel;
					}
				}
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

	// ===================== animation =====================

	private animateTo(worldX: number, worldY: number) {
		const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
		const s = Math.min(w, h) * 0.42 * this.zoom;
		this.animStartPanX = this.panX;
		this.animStartPanY = this.panY;
		this.animTargetPanX = -worldX * s;
		this.animTargetPanY = worldY * s;
		this.animStartTime = performance.now();
		this.animating = true;
		this.animFrameId = requestAnimationFrame((now) => this.animTick(now));
	}

	private animTick(now: number) {
		if (!this.animating) return;
		let t = (now - this.animStartTime) / this.animDuration;
		if (t >= 1) {
			t = 1;
			this.animating = false;
		}
		// easeOutCubic
		const ease = 1 - Math.pow(1 - t, 3);
		this.panX = this.animStartPanX + (this.animTargetPanX - this.animStartPanX) * ease;
		this.panY = this.animStartPanY + (this.animTargetPanY - this.animStartPanY) * ease;
		this.draw();
		if (this.animating) {
			this.animFrameId = requestAnimationFrame((now) => this.animTick(now));
		}
	}

	private cancelAnimation() {
		if (this.animating) {
			this.animating = false;
			cancelAnimationFrame(this.animFrameId);
		}
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
			const hasEmbeddings = Object.values(this.plugin.cache.notes).some((n) => n.embedding);
			const msg = hasEmbeddings
				? "Embeddings found but no layout. Run Recompute Layout in settings."
				: "No points. Run Re-embed in settings.";
			ctx.fillText(msg, W / 2, H / 2);
			return;
		}

		const showLinks = this.plugin.settings.showLinks;
		const isSem = this.plugin.settings.colorMode === "semantic";
		const zoom = this.zoom;

		// path→idx
		const idx = new Map<string, number>();
		pts.forEach((p, i) => idx.set(p.path, i));

		// precompute screen positions
		const scr: ScreenPt[] = pts.map((p) => this.w2s(p.x, p.y));

		// ---------- zones ----------
		if (this.plugin.settings.showZones && this.zones.length > 0) {
			const w2sFn = (wx: number, wy: number) => this.w2s(wx, wy);
			const isWorldmap = this.plugin.settings.zoneStyle === "worldmap";
			const isDarkTheme = document.body.classList.contains("theme-dark");

			// Sub-zones fade in at zoom 2-5
			let subAlpha = Math.max(0, Math.min(1, (zoom - 2) / 3));
			if (!this.plugin.settings.showSubZones) subAlpha = 0;
			const globalZoneAlpha = 1 - subAlpha * 0.3;
			const parentFillFade = 1 - subAlpha; // fill crossfades out

			if (isWorldmap && this.continents.length > 0) {
				// ---------- WORLDMAP rendering ----------

				// Ocean background
				ctx.fillStyle = isDarkTheme ? "#0a0e1a" : "#e8eef5";
				ctx.fillRect(0, 0, W, H);

				const zoneById = new Map<number, Zone>();
				for (const zone of this.zones) zoneById.set(zone.id, zone);

				for (const continent of this.continents) {
					const memberZones = continent.zoneIds
						.map((id) => zoneById.get(id))
						.filter((z): z is Zone => !!z);
					if (memberZones.length === 0) continue;

					// Clip to coastline polygon
					if (continent.coastline && continent.coastline.length >= 3) {
						const coastScreen = continent.coastline.map((p) => w2sFn(p.x, p.y));

						ctx.save();
						ctx.beginPath();
						ctx.moveTo(coastScreen[0].x, coastScreen[0].y);
						for (let ci = 1; ci < coastScreen.length; ci++) {
							ctx.lineTo(coastScreen[ci].x, coastScreen[ci].y);
						}
						ctx.closePath();
						ctx.clip();

						// Fill individual cells per zone, with sub-domain shade variants
						for (const zone of memberZones) {
							if (!zone.cellPolygons || zone.cellPolygons.length === 0) continue;

							if (subAlpha > 0.01 && zone.subDomainCells && zone.subDomainCells.size > 1) {
								// Sub-domain shading: each province gets a slightly different shade
								const subIds = [...zone.subDomainCells.keys()].sort((a, b) => a - b);
								for (let si = 0; si < subIds.length; si++) {
									const t = subIds.length > 1 ? si / (subIds.length - 1) : 0;
									// Alternate between darkened and lightened shades for contrast
									const targetShade = t < 0.5
										? lerpColor(zone.color, "#000000", t * 0.8)
										: lerpColor(zone.color, "#FFFFFF", (t - 0.5) * 1.0);
									const shade = lerpColor(zone.color, targetShade, subAlpha);
									const rgb = hexToRgb(shade);
									// Crossfade: parent fill fades out, sub-domain fill fades in
									const parentAlpha = 0.12 * globalZoneAlpha * parentFillFade;
									const subFillAlpha = 0.22 * globalZoneAlpha * subAlpha;
									const blendedAlpha = parentAlpha + subFillAlpha;
									ctx.fillStyle = `rgba(${rgb.join(",")},${blendedAlpha})`;
									for (const cell of zone.subDomainCells.get(subIds[si])!) {
										if (cell.length < 3) continue;
										ctx.beginPath();
										const s0 = w2sFn(cell[0].x, cell[0].y);
										ctx.moveTo(s0.x, s0.y);
										for (let vi = 1; vi < cell.length; vi++) {
											const sv = w2sFn(cell[vi].x, cell[vi].y);
											ctx.lineTo(sv.x, sv.y);
										}
										ctx.closePath();
										ctx.fill();
									}
								}
							} else {
								// No sub-domains or zoomed out: flat parent fill
								const fillAlpha = 0.12 * globalZoneAlpha;
								ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${fillAlpha})`;
								for (const cell of zone.cellPolygons) {
									if (cell.length < 3) continue;
									ctx.beginPath();
									const s0 = w2sFn(cell[0].x, cell[0].y);
									ctx.moveTo(s0.x, s0.y);
									for (let vi = 1; vi < cell.length; vi++) {
										const sv = w2sFn(cell[vi].x, cell[vi].y);
										ctx.lineTo(sv.x, sv.y);
									}
									ctx.closePath();
									ctx.fill();
								}
							}
						}

						// Draw edges by visual priority: provinces (minor) → borders (major)
						const provinceAlpha = 0.2;
						const continentZoneSet = new Set(continent.zoneIds);

						// 1. Province borders (dashed, minor)
						if (provinceAlpha > 0.01) {
							const provColor = isDarkTheme
								? `rgba(200,220,255,${provinceAlpha})`
								: `rgba(40,60,100,${provinceAlpha})`;
							ctx.setLineDash([3, 4]);
							ctx.strokeStyle = provColor;
							ctx.lineWidth = 0.8;
							for (const edge of this.borderEdges) {
								if (edge.edgeType !== "province") continue;
								if (!continentZoneSet.has(edge.leftZone) && !continentZoneSet.has(edge.rightZone)) continue;
								const edgeScreen = edge.vertices.map((p) => w2sFn(p.x, p.y));
								if (edgeScreen.length < 2) continue;
								ctx.beginPath();
								ctx.moveTo(edgeScreen[0].x, edgeScreen[0].y);
								for (let ei = 1; ei < edgeScreen.length; ei++) ctx.lineTo(edgeScreen[ei].x, edgeScreen[ei].y);
								ctx.stroke();
							}
							ctx.setLineDash([]);
						}

						// 2. Country borders (solid, draws over province lines)
						const borderColor = isDarkTheme ? "rgba(200,220,255,0.2)" : "rgba(40,60,100,0.2)";
						ctx.strokeStyle = borderColor;
						ctx.lineWidth = 1;
						for (const edge of this.borderEdges) {
							if (edge.edgeType !== "border") continue;
							if (!continentZoneSet.has(edge.leftZone) && !continentZoneSet.has(edge.rightZone)) continue;
							const edgeScreen = edge.vertices.map((p) => w2sFn(p.x, p.y));
							if (edgeScreen.length < 2) continue;
							ctx.beginPath();
							ctx.moveTo(edgeScreen[0].x, edgeScreen[0].y);
							for (let ei = 1; ei < edgeScreen.length; ei++) ctx.lineTo(edgeScreen[ei].x, edgeScreen[ei].y);
							ctx.stroke();
						}

						ctx.restore(); // pop coastline clip

						// Coastline stroke (over everything)
						ctx.save();
						ctx.beginPath();
						ctx.moveTo(coastScreen[0].x, coastScreen[0].y);
						for (let ci = 1; ci < coastScreen.length; ci++) {
							ctx.lineTo(coastScreen[ci].x, coastScreen[ci].y);
						}
						ctx.closePath();
						const coastColor = isDarkTheme ? "rgba(200,220,255,0.35)" : "rgba(40,60,100,0.35)";
						ctx.shadowColor = coastColor;
						ctx.shadowBlur = 10;
						ctx.strokeStyle = coastColor;
						ctx.lineWidth = 2;
						ctx.stroke();
						ctx.shadowBlur = 0;
						ctx.restore();
					} else {
						// Fallback: no coastline, draw cells directly without clip
						for (const zone of memberZones) {
							if (zone.cellPolygons) {
								const fillAlpha = 0.12 * globalZoneAlpha;
								ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${fillAlpha})`;
								for (const cell of zone.cellPolygons) {
									if (cell.length < 3) continue;
									ctx.beginPath();
									const s0 = w2sFn(cell[0].x, cell[0].y);
									ctx.moveTo(s0.x, s0.y);
									for (let vi = 1; vi < cell.length; vi++) {
										const sv = w2sFn(cell[vi].x, cell[vi].y);
										ctx.lineTo(sv.x, sv.y);
									}
									ctx.closePath();
									ctx.fill();
								}
							}
						}
					}
				}

				// Zone labels (inside each country)
				for (const zone of this.zones) {
					if (!zone.cellPolygons || zone.cellPolygons.length === 0) continue;
					// Compute centroid from all cell vertices
					let cx = 0, cy = 0, count = 0;
					for (const cell of zone.cellPolygons) {
						for (const v of cell) { cx += v.x; cy += v.y; count++; }
					}
					if (count === 0) continue;
					cx /= count; cy /= count;
					const spt = w2sFn(cx, cy);

					const zls = this.plugin.settings.zoneLabelSize;
					const zlo = this.plugin.settings.zoneLabelOpacity;
					ctx.save();
					ctx.font = `600 ${zls}px var(--font-interface)`;
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.letterSpacing = "1.5px";
					const txt = zone.label.toUpperCase();
					if (this.plugin.settings.labelOutline) {
						ctx.strokeStyle = themeOutlineColor();
						ctx.lineWidth = this.plugin.settings.labelOutlineWidth;
						ctx.lineJoin = "round";
						ctx.globalAlpha = zlo * globalZoneAlpha;
						ctx.strokeText(txt, spt.x, spt.y);
					}
					ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${zlo * globalZoneAlpha})`;
					ctx.fillText(txt, spt.x, spt.y);
					ctx.letterSpacing = "0px";
					ctx.restore();
				}

				// Province labels (fade in with zoom, italic, smaller)
				// Positioned at centroid of actual mesh cells, not note positions
				if (subAlpha > 0.01) {
					for (const zone of this.zones) {
						if (!zone.subDomainCells || zone.subDomainCells.size <= 1) continue;
						const subZones = this.subZonesMap.get(zone.id);
						if (!subZones) continue;

						const subIds = [...zone.subDomainCells.keys()].sort((a, b) => a - b);
						for (let si = 0; si < subIds.length; si++) {
							const cells = zone.subDomainCells.get(subIds[si]);
							if (!cells || cells.length === 0) continue;
							const sz = subZones[si];
							if (!sz) continue;

							// Centroid from mesh cell vertices (matches visible province area)
							let cx = 0, cy = 0, count = 0;
							for (const cell of cells) {
								for (const v of cell) { cx += v.x; cy += v.y; count++; }
							}
							if (count === 0) continue;
							cx /= count; cy /= count;
							const spt = w2sFn(cx, cy);

							const subSize = Math.max(5, this.plugin.settings.zoneLabelSize - 2);
							ctx.save();
							ctx.font = `${subSize}px var(--font-interface)`;
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
							ctx.translate(spt.x, spt.y);
							ctx.transform(1, 0, -0.21, 1, 0, 0);
							if (this.plugin.settings.labelOutline) {
								ctx.strokeStyle = themeOutlineColor();
								ctx.lineWidth = this.plugin.settings.labelOutlineWidth;
								ctx.lineJoin = "round";
								ctx.globalAlpha = 0.4 * subAlpha;
								ctx.strokeText(sz.label, 0, 0);
							}
							ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${0.4 * subAlpha})`;
							ctx.fillText(sz.label, 0, 0);
							ctx.restore();
						}
					}
				}

				// Continent labels (multi-zone only, fade out with zoom)
				const continentLabelAlpha = Math.max(0, 1 - (zoom - 1) / 2);
				if (continentLabelAlpha > 0.01) {
					for (const continent of this.continents) {
						if (continent.zoneIds.length <= 1) continue;
						const memberZones = continent.zoneIds
							.map((id) => zoneById.get(id))
							.filter((z): z is Zone => !!z);
						if (memberZones.length <= 1) continue;

						let cx = 0, cy = 0;
						for (const z of memberZones) {
							const blobCx = z.blob.reduce((s, p) => s + p.x, 0) / z.blob.length;
							const blobCy = z.blob.reduce((s, p) => s + p.y, 0) / z.blob.length;
							cx += blobCx; cy += blobCy;
						}
						cx /= memberZones.length; cy /= memberZones.length;
						const spt = w2sFn(cx, cy);

						const contSize = Math.round(this.plugin.settings.zoneLabelSize * 1.5);
						ctx.save();
						ctx.globalAlpha = continentLabelAlpha;
						ctx.font = `bold ${contSize}px var(--font-interface)`;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.letterSpacing = "3px";
						const contTxt = continent.label.toUpperCase();
						if (this.plugin.settings.labelOutline) {
							ctx.strokeStyle = isDarkTheme ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
							ctx.lineWidth = this.plugin.settings.labelOutlineWidth + 1;
							ctx.lineJoin = "round";
							ctx.strokeText(contTxt, spt.x, spt.y - 20);
						}
						ctx.fillStyle = isDarkTheme ? "rgba(200,220,255,0.4)" : "rgba(40,60,100,0.4)";
						ctx.fillText(contTxt, spt.x, spt.y - 20);
						ctx.letterSpacing = "0px";
						ctx.restore();
					}
				}
			} else {
				// ---------- STARMAP rendering (original) ----------
				const lcfg: LabelConfig = {
					zoneLabelSize: this.plugin.settings.zoneLabelSize,
					zoneLabelOpacity: this.plugin.settings.zoneLabelOpacity,
					labelOutline: this.plugin.settings.labelOutline,
					labelOutlineWidth: this.plugin.settings.labelOutlineWidth,
				};
				for (const zone of this.zones) {
					drawZone(ctx, zone, w2sFn, globalZoneAlpha, false, isWorldmap, false, undefined, parentFillFade, lcfg);
				}

				if (subAlpha > 0.01) {
					for (const zone of this.zones) {
						const subZones = this.subZonesMap.get(zone.id);
						if (!subZones) continue;

						const shades = subZones.map((_, i) => {
							const t = subZones.length > 1 ? i / (subZones.length - 1) : 0;
							return lerpColor(zone.color, "#FFFFFF", 0.15 + t * 0.35);
						});

						for (let si = 0; si < subZones.length; si++) {
							drawZone(ctx, subZones[si], w2sFn, subAlpha, true, false, false, shades[si], 1, lcfg);
						}
					}
				}
			}
		}

		// ---------- links ----------
		if (showLinks) {
			ctx.save();
			ctx.strokeStyle = th.linkStroke;
			ctx.lineWidth = 1;
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
		const baseR = Math.max(1.5, 1.5 * zoom);

		for (let i = 0; i < pts.length; i++) {
			const s = scr[i];
			if (s.x < -80 || s.x > W + 80 || s.y < -80 || s.y > H + 80) continue;

			const sel = i === this.selectedIdx;
			const hov = i === this.hoverIdx;
			const r = sel ? baseR * 1.4 : baseR;
			const alpha = hov || sel ? 1.0 : 0.78;

			// subtle glow behind point
			if (zoom > 2) {
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
		const labelAlpha = Math.min(1, Math.max(0, (zoom - 5) / 3)) * this.plugin.settings.noteTitleOpacity;
		if (labelAlpha > 0.01 && this.plugin.settings.showNoteTitles) this.drawGlobalLabels(ctx, pts, scr, labelAlpha, W, H);

		// ---------- minimap ----------
		if (zoom > 1.2 && this.plugin.settings.minimapCorner !== "off") {
			this.drawMinimap(ctx, W, H);
		}

		// ---------- hover tooltip (when labels hidden) ----------
		if (this.hoverIdx >= 0 && labelAlpha < 0.5) {
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

	private drawGlobalLabels(ctx: CanvasRenderingContext2D, pts: MapPoint[], scr: ScreenPt[], alpha: number, W: number, H: number) {
		const nts = this.plugin.settings.noteTitleSize;
		const isDark = document.body.classList.contains("theme-dark");
		const outlineOn = this.plugin.settings.labelOutline;
		const outlineW = this.plugin.settings.labelOutlineWidth;
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.font = `${nts}px var(--font-interface)`;
		ctx.fillStyle = this.theme.text;
		ctx.textAlign = "left";
		if (outlineOn) {
			ctx.strokeStyle = isDark ? "rgba(10,14,26,0.9)" : "rgba(248,248,255,0.9)";
			ctx.lineWidth = outlineW;
			ctx.lineJoin = "round";
		}
		for (let i = 0; i < pts.length; i++) {
			const s = scr[i];
			if (s.x < -50 || s.x > W + 50 || s.y < -50 || s.y > H + 50) continue;
			const t = pts[i].title.length > 40 ? pts[i].title.slice(0, 37) + "..." : pts[i].title;
			if (outlineOn) ctx.strokeText(t, s.x + 4, s.y + 2);
			ctx.fillText(t, s.x + 4, s.y + 2);
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

	// ===================== active note sync =====================

	private syncActiveNoteSelection() {
		const file = this.app.workspace.getActiveFile();
		if (!file) return;
		const idx = this.points.findIndex((p) => p.path === file.path);
		if (idx >= 0) {
			this.selectedIdx = idx;
			this.animateTo(this.points[idx].x, this.points[idx].y);
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

		// zone contours
		if (this.plugin.settings.showZones && this.zones.length > 0) {
			const w2m = (wx: number, wy: number) => ({
				x: cxOff + (wx - minX) * scale,
				y: cyOff + (maxY - wy) * scale,
			});
			const isWorldmap = this.plugin.settings.zoneStyle === "worldmap";
			const isDark = document.body.classList.contains("theme-dark");
			const borderCol = isDark ? "rgba(200,220,255,0.3)" : "rgba(40,60,100,0.3)";
			ctx.strokeStyle = borderCol;
			ctx.lineWidth = 0.8;
			ctx.globalAlpha = 1;

			if (isWorldmap && this.continents.length > 0) {
				// Coastlines
				for (const cont of this.continents) {
					if (!cont.coastline || cont.coastline.length < 3) continue;
					ctx.beginPath();
					const s0 = w2m(cont.coastline[0].x, cont.coastline[0].y);
					ctx.moveTo(s0.x, s0.y);
					for (let i = 1; i < cont.coastline.length; i++) {
						const sp = w2m(cont.coastline[i].x, cont.coastline[i].y);
						ctx.lineTo(sp.x, sp.y);
					}
					ctx.closePath();
					ctx.stroke();
				}
				// Country borders
				for (const edge of this.borderEdges) {
					if (edge.edgeType !== "border") continue;
					if (edge.vertices.length < 2) continue;
					ctx.beginPath();
					const s0 = w2m(edge.vertices[0].x, edge.vertices[0].y);
					ctx.moveTo(s0.x, s0.y);
					for (let i = 1; i < edge.vertices.length; i++) {
						const sp = w2m(edge.vertices[i].x, edge.vertices[i].y);
						ctx.lineTo(sp.x, sp.y);
					}
					ctx.stroke();
				}
			} else {
				// Starmap: draw zone blobs
				for (const zone of this.zones) {
					if (zone.blob.length < 3) continue;
					ctx.beginPath();
					const s0 = w2m(zone.blob[0].x, zone.blob[0].y);
					ctx.moveTo(s0.x, s0.y);
					for (let i = 1; i < zone.blob.length; i++) {
						const sp = w2m(zone.blob[i].x, zone.blob[i].y);
						ctx.lineTo(sp.x, sp.y);
					}
					ctx.closePath();
					ctx.stroke();
				}
			}
		}

		// draw all points uniformly
		for (const p of all) {
			const sx = cxOff + (p.x - minX) * scale;
			const sy = cyOff + (maxY - p.y) * scale; // flip y
			ctx.beginPath();
			ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
			ctx.fillStyle = this.color(p);
			ctx.globalAlpha = 0.7;
			ctx.fill();
		}

		// highlight selected
		if (this.selectedIdx >= 0) {
			const sp = this.points[this.selectedIdx];
			const sx = cxOff + (sp.x - minX) * scale;
			const sy = cyOff + (maxY - sp.y) * scale;
			ctx.beginPath();
			ctx.arc(sx, sy, 4, 0, Math.PI * 2);
			ctx.strokeStyle = "#C9963B";
			ctx.lineWidth = 1.5;
			ctx.globalAlpha = 1;
			ctx.stroke();
		}

		// viewport rectangle
		const topLeft = this.s2w(0, 0);
		const bottomRight = this.s2w(W, H);
		const vx1 = cxOff + (topLeft.x - minX) * scale;
		const vy1 = cyOff + (maxY - topLeft.y) * scale;
		const vx2 = cxOff + (bottomRight.x - minX) * scale;
		const vy2 = cyOff + (maxY - bottomRight.y) * scale;
		ctx.strokeStyle = th.text;
		ctx.globalAlpha = 0.4;
		ctx.lineWidth = 1;
		ctx.strokeRect(
			Math.min(vx1, vx2), Math.min(vy1, vy2),
			Math.abs(vx2 - vx1), Math.abs(vy2 - vy1),
		);

		ctx.restore();
	}

	// ===================== interactions =====================

	private setupInteractions() {
		const c = this.canvas;

		c.addEventListener("mousedown", (e) => {
			this.cancelAnimation();
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
			this.cancelAnimation();
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
			this.cancelAnimation();
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
			this.selectedIdx = -1;
			this.draw();
			return;
		}

		this.selectedIdx = i;
		const p = this.points[i];

		// Open note in a separate leaf (not this one — that would destroy the map)
		const leaves = this.app.workspace.getLeavesOfType("markdown");
		const targetLeaf = leaves.length > 0 ? leaves[0] : this.app.workspace.getLeaf("tab");
		targetLeaf.openFile(this.app.vault.getFileByPath(p.path)!);

		this.animateTo(p.x, p.y);
	}

	private updateStatus() {
		const t = this.allPoints.length;
		const z = this.zoom.toFixed(1);
		this.statusEl.textContent = `${t} notes | zoom ${z}x`;
	}

	async refresh(): Promise<void> {
		await this.loadPoints();
		this.resizeCanvas();
		this.draw();
	}
}
