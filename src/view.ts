import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import type ChorographiaPlugin from "./main";
import type { NoteCache, ZoneCacheEntry } from "./cache";
import { decodeFloat32, encodeFloat32 } from "./cache";
import { kMeans, computeSemanticAssignments } from "./kmeans";
import { Zone, Continent, BorderEdge, WorldMapResult, WorldMapSettings, computeZones, computeWorldMapZones, computeWorldMapSubZones, drawZone, drawZoneLabel, type LabelConfig } from "./zones";
import { generateZoneNames } from "./zoneNaming";
import { generateZoneNamesOllama } from "./ollama";
import { generateZoneNamesOpenRouter } from "./openrouter";
import type { ThemeColors, MapTheme } from "./theme";
import { classifyAll, drawTerrainIcon, type TerrainType } from "./terrain";
import { strokeWobblyLine, strokeWobblyPolyline, fillStipple, hashCoords, mulberry32 } from "./ink";
import { computeRouteNetwork, type RouteNetwork } from "./routes";

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

// palettes are now sourced from the active MapTheme — see theme.ts
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
// UI theme colors are now sourced from the active MapTheme — see theme.ts

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
	private terrainTypes: TerrainType[] = [];
	private routeNetwork: RouteNetwork | null = null;
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
	private allPanels: HTMLDivElement[] = [];
	private settingsPanel!: HTMLDivElement;
	private snapshotPanel!: HTMLDivElement;
	private exportPanel!: HTMLDivElement;
	private snapshotListEl!: HTMLDivElement;
	private colorModeSelect!: HTMLSelectElement;
	private linksToggle!: HTMLInputElement;
	private zonesToggle!: HTMLInputElement;
	private subZonesToggle!: HTMLInputElement;
	private titlesToggle!: HTMLInputElement;
	private minimapSelect!: HTMLSelectElement;
	private editMode = false;

	// export state
	private exportMode: "current" | "whole" | "region" = "current";
	private exportScale = 2;
	private exportZoneLabels = true;
	private exportSubZoneLabels = true;
	private exportNoteTitles = true;
	private exportLinks = true;
	private regionSelectActive = false;
	private regionStart: { x: number; y: number } | null = null;
	private regionEnd: { x: number; y: number } | null = null;
	private regionWorld: { x1: number; y1: number; x2: number; y2: number } | null = null;
	private exportLabelOverride = false;
	private exportLabelScale = 1;
	private editingLabel: { type: "zone" | "subzone"; zoneId: number; subId?: number; el: HTMLInputElement } | null = null;
	private labelHitboxes: { type: "zone" | "subzone"; zoneId: number; subId?: number; x: number; y: number; w: number; h: number }[] = [];
	private filterPanel!: HTMLDivElement;
	private activeFolderFilters = new Set<string>();
	private activeTagFilters = new Set<string>();

	constructor(leaf: WorkspaceLeaf, plugin: ChorographiaPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	private get mapTheme(): MapTheme {
		return this.plugin.getActiveTheme();
	}

	private get theme(): ThemeColors {
		const t = this.mapTheme;
		return document.body.classList.contains("theme-light") ? t.ui.light : t.ui.dark;
	}

	private applyThemeBackground(root?: HTMLElement) {
		const el = root || this.containerEl.children[1] as HTMLElement;
		const isDark = document.body.classList.contains("theme-dark");
		const bg = this.mapTheme.background;
		el.style.setProperty("--chorographia-bg", isDark ? bg.dark.container : bg.light.container);
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
		this.applyThemeBackground(root);
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
		// SVG icon strings
		const gearSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
		const cameraSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`;
		const downloadSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

		// Icon bar
		const iconBar = root.createEl("div", { cls: "chorographia-icon-bar" });

		const settingsBtn = iconBar.createEl("button", { cls: "chorographia-icon-btn", attr: { "aria-label": "Settings" } });
		settingsBtn.innerHTML = gearSvg;

		const snapshotBtn = iconBar.createEl("button", { cls: "chorographia-icon-btn", attr: { "aria-label": "Snapshots" } });
		snapshotBtn.innerHTML = cameraSvg;

		const exportBtn = iconBar.createEl("button", { cls: "chorographia-icon-btn", attr: { "aria-label": "Export" } });
		exportBtn.innerHTML = downloadSvg;

		// Build panels
		this.settingsPanel = root.createEl("div", { cls: "chorographia-menu" });
		this.snapshotPanel = root.createEl("div", { cls: "chorographia-menu chorographia-snapshot-panel" });
		this.exportPanel = root.createEl("div", { cls: "chorographia-menu chorographia-export-panel" });
		this.allPanels = [this.settingsPanel, this.snapshotPanel, this.exportPanel];

		this.buildSettingsPanel();
		this.buildSnapshotPanel();
		this.buildExportPanel();

		// Wire icon buttons
		settingsBtn.addEventListener("click", (e) => { e.stopPropagation(); this.togglePanel(this.settingsPanel); });
		snapshotBtn.addEventListener("click", (e) => { e.stopPropagation(); this.togglePanel(this.snapshotPanel); });
		exportBtn.addEventListener("click", (e) => { e.stopPropagation(); this.togglePanel(this.exportPanel); });

		// Close panels on canvas click
		this.canvas.addEventListener("mousedown", () => {
			if (this.regionSelectActive) return;
			this.closeAllPanels();
		}, true);
	}

	private togglePanel(panel: HTMLDivElement) {
		const wasOpen = panel.classList.contains("is-open");
		for (const p of this.allPanels) p.classList.remove("is-open");
		if (!wasOpen) panel.classList.add("is-open");
	}

	private closeAllPanels() {
		for (const p of this.allPanels) p.classList.remove("is-open");
	}

	// ---------- settings panel ----------

	private buildSettingsPanel() {
		const panel = this.settingsPanel;
		panel.createEl("div", { cls: "chorographia-panel-heading", text: "SETTINGS" });

		// Color row
		const colorRow = panel.createEl("div", { cls: "chorographia-menu-row" });
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

		// Links
		const linksRow = panel.createEl("div", { cls: "chorographia-menu-row" });
		const linksLbl = linksRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.linksToggle = linksLbl.createEl("input", { type: "checkbox" });
		this.linksToggle.checked = this.plugin.settings.showLinks;
		linksLbl.appendText(" Links");
		this.linksToggle.addEventListener("change", async () => {
			this.plugin.settings.showLinks = this.linksToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Zones
		const zonesRow = panel.createEl("div", { cls: "chorographia-menu-row" });
		const zonesLbl = zonesRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.zonesToggle = zonesLbl.createEl("input", { type: "checkbox" });
		this.zonesToggle.checked = this.plugin.settings.showZones;
		zonesLbl.appendText(" Zones");
		this.zonesToggle.addEventListener("change", async () => {
			this.plugin.settings.showZones = this.zonesToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Sub-zones
		const subZonesRow = panel.createEl("div", { cls: "chorographia-menu-row" });
		const subZonesLbl = subZonesRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.subZonesToggle = subZonesLbl.createEl("input", { type: "checkbox" });
		this.subZonesToggle.checked = this.plugin.settings.showSubZones;
		subZonesLbl.appendText(" Sub-zones");
		this.subZonesToggle.addEventListener("change", async () => {
			this.plugin.settings.showSubZones = this.subZonesToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Edit Labels
		const editRow = panel.createEl("div", { cls: "chorographia-menu-row" });
		const editLbl = editRow.createEl("label", { cls: "chorographia-toggle-label" });
		const editToggle = editLbl.createEl("input", { type: "checkbox" });
		editLbl.appendText(" Edit Labels");
		editToggle.addEventListener("change", () => {
			this.editMode = editToggle.checked;
			if (!this.editMode && this.editingLabel) {
				this.editingLabel.el.remove();
				this.editingLabel = null;
			}
			this.draw();
		});

		// Titles
		const titlesRow = panel.createEl("div", { cls: "chorographia-menu-row" });
		const titlesLbl = titlesRow.createEl("label", { cls: "chorographia-toggle-label" });
		this.titlesToggle = titlesLbl.createEl("input", { type: "checkbox" });
		this.titlesToggle.checked = this.plugin.settings.showNoteTitles;
		titlesLbl.appendText(" Titles");
		this.titlesToggle.addEventListener("change", async () => {
			this.plugin.settings.showNoteTitles = this.titlesToggle.checked;
			await this.plugin.saveSettings();
			this.draw();
		});

		// Minimap
		const minimapRow = panel.createEl("div", { cls: "chorographia-menu-row" });
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

		// Filters
		panel.createEl("div", { cls: "chorographia-menu-sep" });
		const filterHeader = panel.createEl("div", { cls: "chorographia-menu-row" });
		filterHeader.createEl("span", { text: "Filters", cls: "chorographia-filter-header" });
		const filterClearBtn = filterHeader.createEl("button", { cls: "chorographia-filter-clear", text: "Clear" });
		filterClearBtn.addEventListener("click", () => this.clearFilters());
		this.filterPanel = panel.createEl("div", { cls: "chorographia-filter-panel" });
	}

	// ---------- snapshot panel ----------

	private buildSnapshotPanel() {
		const panel = this.snapshotPanel;
		panel.createEl("div", { cls: "chorographia-panel-heading", text: "SNAPSHOTS" });

		// Save input
		const saveInput = panel.createEl("input", {
			cls: "chorographia-snapshot-save-input",
			attr: { type: "text", placeholder: "Name this snapshot..." },
		});

		// Save button
		const saveBtn = panel.createEl("button", { cls: "chorographia-export-btn-primary", text: "Save Snapshot" });
		saveBtn.addEventListener("click", async () => {
			const name = saveInput.value.trim();
			if (!name) { new Notice("Enter a name for the snapshot."); return; }
			saveBtn.disabled = true;
			try {
				await this.plugin.saveSnapshot(name);
				new Notice(`Snapshot "${name}" saved.`);
				saveInput.value = "";
				this.refreshSnapshotList();
			} catch (e: any) {
				new Notice("Save failed: " + e.message);
			}
			saveBtn.disabled = false;
		});

		panel.createEl("div", { cls: "chorographia-menu-sep" });
		panel.createEl("div", { cls: "chorographia-panel-subheading", text: "Saved Snapshots:" });

		// Scrollable list
		this.snapshotListEl = panel.createEl("div", { cls: "chorographia-snapshot-list" });
		this.refreshSnapshotList();
	}

	private async refreshSnapshotList() {
		this.snapshotListEl.empty();
		const snaps = await this.plugin.listSnapshots();
		if (snaps.length === 0) {
			this.snapshotListEl.createEl("div", { cls: "chorographia-filter-empty", text: "No snapshots yet" });
			return;
		}
		for (const s of snaps) {
			const row = this.snapshotListEl.createEl("div", { cls: "chorographia-snapshot-list-item" });
			const info = row.createEl("div", { cls: "chorographia-snapshot-list-info" });
			info.createEl("span", { cls: "chorographia-snapshot-list-name", text: s.name });
			const date = new Date(s.timestamp);
			const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
			info.createEl("span", { cls: "chorographia-snapshot-list-date", text: dateStr });

			const delBtn = row.createEl("button", { cls: "chorographia-snapshot-list-del", text: "\u00d7" });
			let confirmPending = false;
			delBtn.addEventListener("click", async (e) => {
				e.stopPropagation();
				if (!confirmPending) {
					confirmPending = true;
					row.classList.add("is-confirm");
					delBtn.textContent = "Del?";
					setTimeout(() => {
						if (confirmPending) {
							confirmPending = false;
							row.classList.remove("is-confirm");
							delBtn.textContent = "\u00d7";
						}
					}, 3000);
					return;
				}
				await this.plugin.deleteSnapshot(s.path);
				new Notice("Snapshot deleted.");
				this.refreshSnapshotList();
			});

			// Click row to load
			row.addEventListener("click", async () => {
				try {
					await this.plugin.loadSnapshot(s.path);
					new Notice(`Snapshot "${s.name}" loaded.`);
				} catch (e: any) {
					new Notice("Load failed: " + e.message);
				}
			});
		}
	}

	// ---------- export panel ----------

	private buildExportPanel() {
		const panel = this.exportPanel;
		panel.createEl("div", { cls: "chorographia-panel-heading", text: "EXPORT MAP" });

		// Mode selection
		const modeGroup = panel.createEl("div", { cls: "chorographia-export-mode-group" });
		const modes: { value: typeof this.exportMode; label: string }[] = [
			{ value: "current", label: "Current View" },
			{ value: "whole", label: "Whole Map" },
			{ value: "region", label: "Select Region" },
		];

		const modeEls: HTMLDivElement[] = [];
		for (const m of modes) {
			const item = modeGroup.createEl("div", { cls: "chorographia-export-mode-item" + (m.value === this.exportMode ? " is-active" : "") });
			item.createEl("span", { text: m.label });
			modeEls.push(item);
			item.addEventListener("click", () => {
				this.exportMode = m.value;
				for (const el of modeEls) el.classList.remove("is-active");
				item.classList.add("is-active");
				this.updateExportOptions(optionsContainer, exportActionBtn);
				// Cancel any active region selection when switching modes
				if (m.value !== "region") {
					this.regionSelectActive = false;
					this.regionStart = null;
					this.regionEnd = null;
					this.regionWorld = null;
					this.draw();
				}
			});
		}

		// Options (shown for whole/region)
		const optionsContainer = panel.createEl("div", { cls: "chorographia-export-options" });

		// Export button
		const exportActionBtn = panel.createEl("button", { cls: "chorographia-export-btn-primary", text: "Export PNG" });
		exportActionBtn.addEventListener("click", () => this.executeExport());

		this.updateExportOptions(optionsContainer, exportActionBtn);
	}

	private updateExportOptions(container: HTMLDivElement, exportBtn: HTMLButtonElement) {
		container.empty();
		const hintEl = this.containerEl.querySelector(".chorographia-region-hint");
		if (hintEl) hintEl.remove();

		if (this.exportMode === "current") {
			// No options for current view
			exportBtn.textContent = "Export PNG";
			exportBtn.disabled = false;
			this.regionSelectActive = false;
			return;
		}

		if (this.exportMode === "region") {
			exportBtn.textContent = "Export Region";
			exportBtn.disabled = !this.regionWorld;
			this.regionSelectActive = true;
			// Show hint overlay
			const root = this.containerEl.children[1] as HTMLElement;
			root.createEl("div", { cls: "chorographia-region-hint", text: "Draw a rectangle on the map" });
			this.draw();
		} else {
			this.regionSelectActive = false;
			exportBtn.textContent = "Export PNG";
			exportBtn.disabled = false;
		}

		// Label toggles (shared by whole + region)
		const zlLabel = container.createEl("label", { cls: "chorographia-toggle-label" });
		const zlCb = zlLabel.createEl("input", { type: "checkbox" });
		zlCb.checked = this.exportZoneLabels;
		zlLabel.appendText(" Zone labels");
		zlCb.addEventListener("change", () => { this.exportZoneLabels = zlCb.checked; });

		const szLabel = container.createEl("label", { cls: "chorographia-toggle-label" });
		const szCb = szLabel.createEl("input", { type: "checkbox" });
		szCb.checked = this.exportSubZoneLabels;
		szLabel.appendText(" Sub-zone labels");
		szCb.addEventListener("change", () => { this.exportSubZoneLabels = szCb.checked; });

		const ntLabel = container.createEl("label", { cls: "chorographia-toggle-label" });
		const ntCb = ntLabel.createEl("input", { type: "checkbox" });
		ntCb.checked = this.exportNoteTitles;
		ntLabel.appendText(" Note titles");
		ntCb.addEventListener("change", () => { this.exportNoteTitles = ntCb.checked; });

		const lnLabel = container.createEl("label", { cls: "chorographia-toggle-label" });
		const lnCb = lnLabel.createEl("input", { type: "checkbox" });
		lnCb.checked = this.exportLinks;
		lnLabel.appendText(" Links");
		lnCb.addEventListener("change", () => { this.exportLinks = lnCb.checked; });

		// Scale buttons
		const scaleRow = container.createEl("div", { cls: "chorographia-export-scale-group" });
		scaleRow.createEl("span", { text: "Scale:" });
		for (const s of [1, 2, 4]) {
			const btn = scaleRow.createEl("button", {
				cls: "chorographia-export-scale-btn" + (s === this.exportScale ? " is-active" : ""),
				text: `${s}x`,
			});
			btn.addEventListener("click", () => {
				this.exportScale = s;
				scaleRow.querySelectorAll(".chorographia-export-scale-btn").forEach(el => el.classList.remove("is-active"));
				btn.classList.add("is-active");
			});
		}
	}

	private executeExport() {
		if (this.exportMode === "current") {
			this.exportCurrentView();
		} else if (this.exportMode === "whole") {
			this.exportWholeMap();
		} else if (this.exportMode === "region") {
			if (!this.regionWorld) {
				new Notice("Draw a rectangle on the map first.");
				return;
			}
			this.exportRegion();
		}
	}

	private exportCurrentView() {
		this.canvas.toBlob((blob) => {
			if (!blob) { new Notice("Export failed."); return; }
			this.downloadBlob(blob, "chorographia-view");
		}, "image/png");
	}

	private exportWholeMap() {
		if (this.allPoints.length === 0) { new Notice("No points to export."); return; }

		// Compute world bounding box
		let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
		for (const p of this.allPoints) {
			if (p.x < minX) minX = p.x;
			if (p.x > maxX) maxX = p.x;
			if (p.y < minY) minY = p.y;
			if (p.y > maxY) maxY = p.y;
		}
		const margin = 0.15;
		const rangeX = (maxX - minX) || 0.01;
		const rangeY = (maxY - minY) || 0.01;
		minX -= rangeX * margin; maxX += rangeX * margin;
		minY -= rangeY * margin; maxY += rangeY * margin;

		this.exportWorldRect(minX, minY, maxX, maxY);
	}

	private exportRegion() {
		if (!this.regionWorld) return;
		const r = this.regionWorld;
		this.exportWorldRect(
			Math.min(r.x1, r.x2), Math.min(r.y1, r.y2),
			Math.max(r.x1, r.x2), Math.max(r.y1, r.y2),
		);
	}

	private exportWorldRect(wMinX: number, wMinY: number, wMaxX: number, wMaxY: number) {
		const baseSize = 2048;
		const scale = this.exportScale;
		const rangeX = wMaxX - wMinX;
		const rangeY = wMaxY - wMinY;
		const aspect = rangeX / rangeY;
		let canvasW: number, canvasH: number;
		if (aspect >= 1) {
			canvasW = baseSize * scale;
			canvasH = Math.round(canvasW / aspect);
		} else {
			canvasH = baseSize * scale;
			canvasW = Math.round(canvasH * aspect);
		}

		// Cap at 16384 (browser limit)
		const maxDim = 16384;
		if (canvasW > maxDim || canvasH > maxDim) {
			const f = maxDim / Math.max(canvasW, canvasH);
			canvasW = Math.round(canvasW * f);
			canvasH = Math.round(canvasH * f);
		}

		const offCanvas = document.createElement("canvas");
		offCanvas.width = canvasW;
		offCanvas.height = canvasH;
		const offCtx = offCanvas.getContext("2d")!;

		// Save original state
		const origCanvas = this.canvas;
		const origCtx = this.ctx;
		const origDpr = this.dpr;
		const origZoom = this.zoom;
		const origPanX = this.panX;
		const origPanY = this.panY;
		const origShowZones = this.plugin.settings.showZones;
		const origShowSubZones = this.plugin.settings.showSubZones;
		const origShowTitles = this.plugin.settings.showNoteTitles;
		const origTitleOpacity = this.plugin.settings.noteTitleOpacity;
		const origShowLinks = this.plugin.settings.showLinks;
		const origMinimap = this.plugin.settings.minimapCorner;

		// Temporarily override
		this.canvas = offCanvas;
		this.ctx = offCtx;
		this.dpr = 1;

		// Compute zoom/pan to fit the world rect into offCanvas
		const cx = (wMinX + wMaxX) / 2;
		const cy = (wMinY + wMaxY) / 2;
		const fitDim = Math.min(canvasW, canvasH);
		const zoomX = canvasW / (fitDim * 0.42 * rangeX);
		const zoomY = canvasH / (fitDim * 0.42 * rangeY);
		this.zoom = Math.min(zoomX, zoomY) * 0.95;
		const s = fitDim * 0.42 * this.zoom;
		this.panX = -cx * s;
		this.panY = cy * s;

		// Apply export panel toggles (override main settings)
		this.plugin.settings.showZones = this.exportZoneLabels;
		this.plugin.settings.showSubZones = this.exportSubZoneLabels;
		this.plugin.settings.showNoteTitles = this.exportNoteTitles;
		this.plugin.settings.noteTitleOpacity = this.exportNoteTitles ? 1 : 0;
		this.plugin.settings.showLinks = this.exportLinks;
		// No minimap for whole-map; keep for region
		this.plugin.settings.minimapCorner = this.exportMode === "region" ? origMinimap : "off";

		// Override clientWidth/clientHeight for offscreen canvas
		Object.defineProperty(offCanvas, "clientWidth", { value: canvasW, configurable: true });
		Object.defineProperty(offCanvas, "clientHeight", { value: canvasH, configurable: true });

		// Force labels to render at full alpha regardless of zoom level
		this.exportLabelOverride = true;
		// Scale labels relative to base resolution (before scale multiplier)
		// so that 1x/2x/4x only increases pixel density, not label size
		this.exportLabelScale = Math.max(canvasW / scale, canvasH / scale) / 1200;

		this.draw();
		this.exportLabelOverride = false;
		this.exportLabelScale = 1;

		// Restore
		this.canvas = origCanvas;
		this.ctx = origCtx;
		this.dpr = origDpr;
		this.zoom = origZoom;
		this.panX = origPanX;
		this.panY = origPanY;
		this.plugin.settings.showZones = origShowZones;
		this.plugin.settings.showSubZones = origShowSubZones;
		this.plugin.settings.showNoteTitles = origShowTitles;
		this.plugin.settings.noteTitleOpacity = origTitleOpacity;
		this.plugin.settings.showLinks = origShowLinks;
		this.plugin.settings.minimapCorner = origMinimap;

		offCanvas.toBlob((blob) => {
			if (!blob) { new Notice("Export failed."); return; }
			const suffix = this.exportMode === "region" ? "region" : "full";
			this.downloadBlob(blob, `chorographia-${suffix}`);
			new Notice("Map exported.");
		}, "image/png");
	}

	private downloadBlob(blob: Blob, prefix: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		const date = new Date().toISOString().slice(0, 10);
		a.download = `${prefix}-${date}.png`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		new Notice("Map exported.");
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

		const folderPal = this.mapTheme.palette.folder;
		[...folders].sort().forEach((f, i) => this.folderColorMap.set(f, folderPal[i % folderPal.length]));
		[...cats].sort().forEach((c, i) => this.catColorMap.set(c, folderPal[i % folderPal.length]));

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

		// Compute route network if enabled
		if (this.mapTheme.decorative.routeNetwork && pts.length > 1) {
			const pathIdx = new Map<string, number>();
			pts.forEach((p, i) => pathIdx.set(p.path, i));
			const links = pts.map(p => p.links.map(l => pathIdx.get(l)).filter((i): i is number => i != null));
			this.routeNetwork = computeRouteNetwork(
				pts.map(p => ({ x: p.x, y: p.y })),
				links,
				this.terrainTypes.length > 0 ? this.terrainTypes : undefined,
			);
		} else {
			this.routeNetwork = null;
		}

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
					const result = computeWorldMapZones(pointsForZones, assignments, k, subCentroidsByCluster, wmSettings, this.mapTheme.palette.semantic);
					this.zones = result.zones;
					this.continents = result.continents;
					this.borderEdges = result.borderEdges;
				} else {
					this.zones = computeZones(pointsForZones, assignments, k, this.mapTheme.palette.semantic);
					this.continents = [];
					this.borderEdges = [];
				}
				// Apply cached labels then user overrides
				for (const zone of this.zones) {
					if (cached.labels[zone.id]) zone.label = cached.labels[zone.id];
					const userLabel = this.plugin.cache.userLabelOverrides?.[zone.id];
					if (userLabel) zone.label = userLabel;
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
								? computeWorldMapSubZones(zone.hull, subPts, subIdx, localK, this.mapTheme.palette.semantic)
								: computeZones(subPts, subIdx, localK, this.mapTheme.palette.semantic);
							const subLabels = cached.subLabels?.[zone.id];
							if (subLabels) {
								for (const sz of subZones) {
									if (subLabels[sz.id]) sz.label = subLabels[sz.id];
								}
							}
							const userSubs = this.plugin.cache.userSubLabelOverrides?.[zone.id];
							if (userSubs) {
								for (const sz of subZones) {
									if (userSubs[sz.id]) sz.label = userSubs[sz.id];
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
				this.classifyTerrainTypes();
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
			const result = computeWorldMapZones(pointsForZones, pointAssignments, k, subCentroidsByCluster, wmSettings, this.mapTheme.palette.semantic);
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
				? computeWorldMapSubZones(zone.hull, subPts, subIdx, localK, this.mapTheme.palette.semantic)
				: computeZones(subPts, subIdx, localK, this.mapTheme.palette.semantic);

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

		// Apply user label overrides (highest priority)
		if (this.plugin.cache.userLabelOverrides) {
			for (const zone of this.zones) {
				const userLabel = this.plugin.cache.userLabelOverrides[zone.id];
				if (userLabel) {
					zone.label = userLabel;
					labelMap[zone.id] = userLabel;
				}
			}
		}
		if (this.plugin.cache.userSubLabelOverrides) {
			for (const [zoneId, subZones] of this.subZonesMap) {
				const userSubs = this.plugin.cache.userSubLabelOverrides[zoneId];
				if (!userSubs) continue;
				for (const sz of subZones) {
					const userLabel = userSubs[sz.id];
					if (userLabel) {
						sz.label = userLabel;
						if (subLabelsCache[zoneId]) subLabelsCache[zoneId][sz.id] = userLabel;
					}
				}
			}
		}

		// Classify terrain for worldmap + terrain theme
		this.classifyTerrainTypes();

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

	private classifyTerrainTypes() {
		if (this.mapTheme.noteStyle.shape === "terrain" && this.plugin.settings.zoneStyle === "worldmap" && this.continents.length > 0) {
			const pts = this.points.map(p => ({ x: p.x, y: p.y }));
			this.terrainTypes = classifyAll(pts, this.continents);
		} else {
			this.terrainTypes = [];
		}
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
		const pal = this.mapTheme.palette;
		switch (this.plugin.settings.colorMode) {
			case "semantic": return this.semColor(p);
			case "folder": return this.folderColorMap.get(p.folder) || pal.folder[0];
			case "type": {
				const t = p.noteType.toUpperCase();
				return pal.type[t] || pal.folder[hashStr(p.noteType) % pal.folder.length];
			}
			case "cat": return p.cat ? (this.catColorMap.get(p.cat) || pal.folder[0]) : pal.folder[0];
			default: return pal.folder[0];
		}
	}

	private semColor(p: MapPoint): string {
		const pal = this.mapTheme.palette;
		if (p.semA < 0) return this.folderColorMap.get(p.folder) || pal.folder[0];
		const cA = pal.semantic[p.semA % pal.semantic.length];
		if (p.semB < 0 || p.semA === p.semB) return cA;
		return lerpColor(cA, pal.semantic[p.semB % pal.semantic.length], 1 - (pal.semSplit[p.semW] ?? 0.5));
	}

	// ===================== draw =====================

	private draw() {
		const ctx = this.ctx;
		const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
		ctx.clearRect(0, 0, W, H);
		this.labelHitboxes = [];

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

		// ---------- grid lines ----------
		this.drawGridLines(ctx, W, H);

		// ---------- zones ----------
		if (this.plugin.settings.showZones && this.zones.length > 0) {
			const w2sFn = (wx: number, wy: number) => this.w2s(wx, wy);
			const isWorldmap = this.plugin.settings.zoneStyle === "worldmap";
			const isDarkTheme = document.body.classList.contains("theme-dark");

			// Sub-zones fade in at zoom 2-5
			let subAlpha = this.exportLabelOverride ? 1 : Math.max(0, Math.min(1, (zoom - 2) / 3));
			if (!this.plugin.settings.showSubZones) subAlpha = 0;
			const globalZoneAlpha = this.exportLabelOverride ? 1 : 1 - subAlpha * 0.3;
			const parentFillFade = 1 - subAlpha; // fill crossfades out

			if (isWorldmap && this.continents.length > 0) {
				// ---------- WORLDMAP rendering ----------

				// Ocean background
				const bg = this.mapTheme.background;
				ctx.fillStyle = isDarkTheme ? bg.dark.ocean : bg.light.ocean;
				ctx.fillRect(0, 0, W, H);

				// Ocean stipple (sparse engraved dots)
				const decCfg = this.mapTheme.decorative;
				if (decCfg.stippleOcean && decCfg.stippleDensity > 0) {
					// Use opaque ink color at very low alpha — avoids brownish tint from rgba grid colors
					const stippleColor = isDarkTheme ? "rgba(180,190,200,1)" : "rgba(60,70,80,1)";
					ctx.save();
					ctx.globalAlpha = 0.06;
					fillStipple(ctx, 0, 0, W, H, decCfg.stippleDensity, 0.5, stippleColor, 12345);
					ctx.restore();
				}

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
						const useInkProvinces = this.mapTheme.decorative.inkWobble;
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

									// Cartographic: hatch alternate provinces for visual distinction
									if (useInkProvinces && si % 2 === 1) {
										const cells = zone.subDomainCells.get(subIds[si])!;
										// Clip to province cells and draw hatch
										ctx.save();
										ctx.beginPath();
										for (const cell of cells) {
											if (cell.length < 3) continue;
											const cs0 = w2sFn(cell[0].x, cell[0].y);
											ctx.moveTo(cs0.x, cs0.y);
											for (let vi = 1; vi < cell.length; vi++) {
												const csv = w2sFn(cell[vi].x, cell[vi].y);
												ctx.lineTo(csv.x, csv.y);
											}
											ctx.closePath();
										}
										ctx.clip();
										// Compute bounding box of this province's cells
										let hMinX = Infinity, hMinY = Infinity, hMaxX = -Infinity, hMaxY = -Infinity;
										for (const cell of cells) {
											for (const v of cell) {
												const sv = w2sFn(v.x, v.y);
												if (sv.x < hMinX) hMinX = sv.x;
												if (sv.x > hMaxX) hMaxX = sv.x;
												if (sv.y < hMinY) hMinY = sv.y;
												if (sv.y > hMaxY) hMaxY = sv.y;
											}
										}
										// Draw subtle diagonal hatch lines
										const hatchAngle = Math.PI * 0.25 + (si * 0.3);
										const hatchSpacing = 6;
										const hColor = isDarkTheme ? `rgba(${rgb.join(",")},${blendedAlpha * 1.5})` : `rgba(${rgb.join(",")},${blendedAlpha * 2})`;
										ctx.strokeStyle = hColor;
										ctx.lineWidth = 0.3;
										const cos = Math.cos(hatchAngle), sin = Math.sin(hatchAngle);
										const hcx = (hMinX + hMaxX) / 2, hcy = (hMinY + hMaxY) / 2;
										const diag = Math.sqrt((hMaxX - hMinX) ** 2 + (hMaxY - hMinY) ** 2);
										const count = Math.ceil(diag / hatchSpacing);
										ctx.beginPath();
										for (let hi = -count; hi <= count; hi++) {
											const off = hi * hatchSpacing;
											const lx = hcx + cos * off, ly = hcy + sin * off;
											ctx.moveTo(lx - sin * diag, ly + cos * diag);
											ctx.lineTo(lx + sin * diag, ly - cos * diag);
										}
										ctx.stroke();
										ctx.restore();
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
						const continentZoneSet = new Set(continent.zoneIds);
						const brd = this.mapTheme.borders;
						const zoomWF = Math.max(0, Math.min(1, (zoom - 1) / 3));
						const inkWobbleOn = decCfg.inkWobble && zoomWF > 0.05;
						const inkAmpBase = (decCfg.inkWobbleAmplitude || 1) * zoomWF;

						// 1. Province borders (dashed, minor)
						{
							const provColor = isDarkTheme ? brd.province.dark : brd.province.light;
							ctx.setLineDash(brd.provinceDash);
							ctx.strokeStyle = provColor;
							ctx.lineWidth = brd.provinceWidth;
							for (const edge of this.borderEdges) {
								if (edge.edgeType !== "province") continue;
								if (!continentZoneSet.has(edge.leftZone) && !continentZoneSet.has(edge.rightZone)) continue;
								const edgeScreen = edge.vertices.map((p) => w2sFn(p.x, p.y));
								if (edgeScreen.length < 2) continue;
								if (inkWobbleOn) {
									ctx.setLineDash([]); // wobble + dash doesn't mix well, use solid
									strokeWobblyPolyline(ctx, edgeScreen, inkAmpBase * 0.4, brd.provinceWidth, hashCoords(edge.leftZone, edge.rightZone));
								} else {
									ctx.beginPath();
									ctx.moveTo(edgeScreen[0].x, edgeScreen[0].y);
									for (let ei = 1; ei < edgeScreen.length; ei++) ctx.lineTo(edgeScreen[ei].x, edgeScreen[ei].y);
									ctx.stroke();
								}
							}
							ctx.setLineDash([]);
						}

						// 2. Country borders (solid, draws over province lines)
						{
						const borderColor = isDarkTheme ? brd.border.dark : brd.border.light;
						ctx.strokeStyle = borderColor;
						ctx.lineWidth = brd.borderWidth;
						for (const edge of this.borderEdges) {
							if (edge.edgeType !== "border") continue;
							if (!continentZoneSet.has(edge.leftZone) && !continentZoneSet.has(edge.rightZone)) continue;
							const edgeScreen = edge.vertices.map((p) => w2sFn(p.x, p.y));
							if (edgeScreen.length < 2) continue;
							if (inkWobbleOn) {
								strokeWobblyPolyline(ctx, edgeScreen, inkAmpBase * 0.5, brd.borderWidth, hashCoords(edge.leftZone + 1000, edge.rightZone + 1000));
							} else {
								ctx.beginPath();
								ctx.moveTo(edgeScreen[0].x, edgeScreen[0].y);
								for (let ei = 1; ei < edgeScreen.length; ei++) ctx.lineTo(edgeScreen[ei].x, edgeScreen[ei].y);
								ctx.stroke();
							}
						}
						}

						ctx.restore(); // pop coastline clip

						// Coastline stroke (over everything)
						{
						const coastColor = isDarkTheme ? brd.coast.dark : brd.coast.light;
						const wobbleAmp = inkAmpBase * 0.6;

						// Precompute coastline centroid (used by double-line + stipple passes)
						const coastCentroid = { x: 0, y: 0 };
						for (const p of coastScreen) { coastCentroid.x += p.x; coastCentroid.y += p.y; }
						coastCentroid.x /= coastScreen.length;
						coastCentroid.y /= coastScreen.length;

						if (decCfg.inkWobble && wobbleAmp > 0.05) {
							// Pass 1: main coast stroke with wobbly line
							ctx.save();
							ctx.strokeStyle = coastColor;
							ctx.shadowColor = coastColor;
							ctx.shadowBlur = brd.coastGlow;
							strokeWobblyPolyline(ctx, coastScreen, wobbleAmp, brd.coastWidth, hashCoords(continent.zoneIds[0] || 0, 999));
							ctx.shadowBlur = 0;

							// Pass 2: thin secondary stroke offset inward (toward land) — double-line coast
							if (zoom > 1.2) {
								ctx.globalAlpha = 0.25;
								const inset = Math.min(3, 1.5 * zoom);
								const innerCoast = coastScreen.map(p => {
									const dx = coastCentroid.x - p.x, dy = coastCentroid.y - p.y;
									const dist = Math.sqrt(dx * dx + dy * dy);
									if (dist < 1) return p;
									const f = inset / dist;
									return { x: p.x + dx * f, y: p.y + dy * f };
								});
								strokeWobblyPolyline(ctx, innerCoast, wobbleAmp * 0.3, brd.coastWidth * 0.35, hashCoords(continent.zoneIds[0] || 0, 1999));
							}

							// Pass 3: stipple band along ocean side (zoom > 2 only)
							if (decCfg.coastHatch && zoom > 2) {
								ctx.globalAlpha = 0.12;
								ctx.fillStyle = coastColor;
								const stippleBand = 5;
								const rng = mulberry32(hashCoords(continent.zoneIds[0] || 0, 2999));
								ctx.beginPath();
								const step = Math.max(1, Math.floor(coastScreen.length / 60));
								for (let ci = 0; ci < coastScreen.length; ci += step) {
									const p = coastScreen[ci];
									const dx = p.x - coastCentroid.x, dy = p.y - coastCentroid.y;
									const dist = Math.sqrt(dx * dx + dy * dy);
									if (dist < 1) continue;
									const nx = dx / dist, ny = dy / dist;
									const bx = p.x + nx * stippleBand;
									const by = p.y + ny * stippleBand;
									const r = 0.3 + rng() * 0.2;
									ctx.moveTo(bx + r, by);
									ctx.arc(bx, by, r, 0, Math.PI * 2);
								}
								ctx.fill();
							}
							ctx.restore();
						} else {
							// Original non-wobbly coastline
							ctx.save();
							ctx.beginPath();
							ctx.moveTo(coastScreen[0].x, coastScreen[0].y);
							for (let ci = 1; ci < coastScreen.length; ci++) {
								ctx.lineTo(coastScreen[ci].x, coastScreen[ci].y);
							}
							ctx.closePath();
							ctx.shadowColor = coastColor;
							ctx.shadowBlur = brd.coastGlow;
							ctx.strokeStyle = coastColor;
							ctx.lineWidth = brd.coastWidth;
							ctx.stroke();
							ctx.shadowBlur = 0;
							ctx.restore();
						}
						}
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
				{
				const fonts = this.mapTheme.fonts;
				for (const zone of this.zones) {
					if (!zone.cellPolygons || zone.cellPolygons.length === 0) continue;
					let cx = 0, cy = 0, count = 0;
					for (const cell of zone.cellPolygons) {
						for (const v of cell) { cx += v.x; cy += v.y; count++; }
					}
					if (count === 0) continue;
					cx /= count; cy /= count;
					const spt = w2sFn(cx, cy);

					const zls = Math.round(this.plugin.settings.zoneLabelSize * this.exportLabelScale);
					const zlo = this.plugin.settings.zoneLabelOpacity;
					ctx.save();
					ctx.font = `${fonts.zoneLabelWeight} ${zls}px ${fonts.zoneLabel}`;
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					const isCartStyle = this.mapTheme.decorative.compassStyle === "cartographic";
					ctx.letterSpacing = isCartStyle ? "2.5px" : "1.5px";
					const txt = zone.label.toUpperCase();
					if (this.plugin.settings.labelOutline && !this.exportLabelOverride) {
						ctx.strokeStyle = themeOutlineColor();
						ctx.lineWidth = this.plugin.settings.labelOutlineWidth * this.exportLabelScale;
						ctx.lineJoin = "round";
						ctx.globalAlpha = zlo * globalZoneAlpha;
						ctx.strokeText(txt, spt.x, spt.y);
					}
					ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${zlo * globalZoneAlpha})`;
					ctx.fillText(txt, spt.x, spt.y);
					ctx.letterSpacing = "0px";
					if (this.editMode) {
						const tw = ctx.measureText(txt).width;
						this.labelHitboxes.push({ type: "zone", zoneId: zone.id, x: spt.x - tw / 2, y: spt.y + zls / 2, w: tw, h: zls + 4 });
					}
					ctx.restore();
				}
				}

				// Province labels (fade in with zoom, italic, smaller)
				if (subAlpha > 0.01) {
					const fonts = this.mapTheme.fonts;
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

							let cx = 0, cy = 0, count = 0;
							for (const cell of cells) {
								for (const v of cell) { cx += v.x; cy += v.y; count++; }
							}
							if (count === 0) continue;
							cx /= count; cy /= count;
							const spt = w2sFn(cx, cy);

							const subSize = Math.round(this.plugin.settings.subZoneLabelSize * this.exportLabelScale * 1.5);
							const subLabelOpacity = this.plugin.settings.subZoneLabelOpacity;
							ctx.save();
							ctx.font = `${subSize}px ${fonts.subZoneLabel}`;
							ctx.textAlign = "center";
							ctx.textBaseline = "middle";
							ctx.translate(spt.x, spt.y);
							ctx.transform(1, 0, -0.21, 1, 0, 0);
							if (this.plugin.settings.labelOutline && !this.exportLabelOverride) {
								ctx.strokeStyle = themeOutlineColor();
								ctx.lineWidth = this.plugin.settings.labelOutlineWidth * this.exportLabelScale;
								ctx.lineJoin = "round";
								ctx.globalAlpha = subLabelOpacity * subAlpha;
								ctx.strokeText(sz.label, 0, 0);
							}
							ctx.fillStyle = `rgba(${hexToRgb(zone.color).join(",")},${subLabelOpacity * subAlpha})`;
							ctx.fillText(sz.label, 0, 0);
							if (this.editMode) {
								const tw = ctx.measureText(sz.label).width;
								this.labelHitboxes.push({ type: "subzone", zoneId: zone.id, subId: sz.id, x: spt.x - tw / 2, y: spt.y + subSize / 2, w: tw, h: subSize + 4 });
							}
							ctx.restore();
						}
					}
				}

				// Continent labels (multi-zone only, fade out with zoom)
				const continentLabelAlpha = this.exportLabelOverride ? 0 : Math.max(0, 1 - (zoom - 1) / 2);
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

						const fonts = this.mapTheme.fonts;
						const contSize = Math.round(this.plugin.settings.zoneLabelSize * 1.5 * this.exportLabelScale);
						ctx.save();
						ctx.globalAlpha = continentLabelAlpha;
						ctx.font = `${fonts.continentLabelWeight} ${contSize}px ${fonts.continentLabel}`;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						const isCartStyle = this.mapTheme.decorative.compassStyle === "cartographic";
						ctx.letterSpacing = isCartStyle ? "5px" : "3px";
						const contTxt = continent.label.toUpperCase();
						if (this.plugin.settings.labelOutline) {
							ctx.strokeStyle = isDarkTheme ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
							ctx.lineWidth = this.plugin.settings.labelOutlineWidth + 1;
							ctx.lineJoin = "round";
							ctx.strokeText(contTxt, spt.x, spt.y - 20);
						}
						const brd = this.mapTheme.borders;
						ctx.fillStyle = isDarkTheme ? brd.coast.dark : brd.coast.light;
						ctx.fillText(contTxt, spt.x, spt.y - 20);
						ctx.letterSpacing = "0px";
						ctx.restore();
					}
				}
			} else {
				// ---------- STARMAP rendering (original) ----------
				const fonts = this.mapTheme.fonts;
				const lcfg: LabelConfig = {
					zoneLabelSize: Math.round(this.plugin.settings.zoneLabelSize * this.exportLabelScale),
					zoneLabelOpacity: this.plugin.settings.zoneLabelOpacity,
					labelOutline: this.plugin.settings.labelOutline,
					labelOutlineWidth: this.plugin.settings.labelOutlineWidth,
					fontFamily: fonts.zoneLabel,
					fontWeight: fonts.zoneLabelWeight,
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

		// ---------- links / route network ----------
		if (showLinks) {
			const dec = this.mapTheme.decorative;
			if (this.routeNetwork && dec.routeNetwork && this.routeNetwork.edges.length > 0) {
				// Route network rendering — shared road/trade routes
				const rn = this.routeNetwork;
				ctx.save();
				ctx.globalAlpha = 0.45;
				ctx.strokeStyle = th.linkStroke;

				for (let ei = 0; ei < rn.edges.length; ei++) {
					const edge = rn.edges[ei];
					if (edge.traffic === 0) continue;
					const s0 = scr[edge.from], s1 = scr[edge.to];
					if (!s0 || !s1) continue;
					// Cull off-screen edges
					if (s0.x < -100 && s1.x < -100) continue;
					if (s0.x > W + 100 && s1.x > W + 100) continue;
					if (s0.y < -100 && s1.y < -100) continue;
					if (s0.y > H + 100 && s1.y > H + 100) continue;

					const cp = this.w2s(edge.controlPt.x, edge.controlPt.y);
					const width = Math.max(0.5, Math.log(edge.traffic + 1) * 0.6 + 0.3);
					ctx.lineWidth = width;
					ctx.setLineDash(edge.isOcean ? [4, 3] : []);

					// Use simple quadratic curves — no wobble on routes (perf + clarity)
					ctx.beginPath();
					ctx.moveTo(s0.x, s0.y);
					ctx.quadraticCurveTo(cp.x, cp.y, s1.x, s1.y);
					ctx.stroke();
				}
				ctx.setLineDash([]);
				ctx.restore();

				// Selection highlight: show specific routes for selected/hovered note
				const fi = this.selectedIdx >= 0 ? this.selectedIdx : this.hoverIdx;
				if (fi >= 0) {
					ctx.save();
					ctx.strokeStyle = this.mapTheme.noteStyle.highlightEdge;
					ctx.globalAlpha = 0.7;
					const fp = pts[fi];
					// Collect all edge indices used by this note's links
					const highlightEdges = new Set<number>();
					for (const link of fp.links) {
						const j = idx.get(link);
						if (j == null) continue;
						const key1 = `${fi}→${j}`, key2 = `${j}→${fi}`;
						const path = rn.linkPaths.get(key1) || rn.linkPaths.get(key2);
						if (path) for (const ei of path) highlightEdges.add(ei);
					}
					// Also check reverse links
					for (let i = 0; i < pts.length; i++) {
						if (i === fi) continue;
						if (pts[i].links.includes(fp.path)) {
							const key1 = `${i}→${fi}`, key2 = `${fi}→${i}`;
							const path = rn.linkPaths.get(key1) || rn.linkPaths.get(key2);
							if (path) for (const ei of path) highlightEdges.add(ei);
						}
					}

					for (const ei of highlightEdges) {
						const edge = rn.edges[ei];
						const s0 = scr[edge.from], s1 = scr[edge.to];
						if (!s0 || !s1) continue;
						const cp = this.w2s(edge.controlPt.x, edge.controlPt.y);
						const width = Math.max(1, Math.log(edge.traffic + 1) * 0.8 + 1);
						ctx.lineWidth = width;
						ctx.setLineDash(edge.isOcean ? [4, 3] : []);
						ctx.beginPath();
						ctx.moveTo(s0.x, s0.y);
						ctx.quadraticCurveTo(cp.x, cp.y, s1.x, s1.y);
						ctx.stroke();
					}
					ctx.setLineDash([]);
					ctx.restore();
				}
			} else {
				// Fallback: straight-line rendering (default theme)
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

				// highlighted edges (fallback)
				const fi = this.selectedIdx >= 0 ? this.selectedIdx : this.hoverIdx;
				if (fi >= 0) {
					ctx.save();
					ctx.strokeStyle = this.mapTheme.noteStyle.highlightEdge;
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
			}
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
			if (this.terrainTypes.length > i && this.terrainTypes[i]) {
				const iconSize = Math.max(6, 4 * zoom);
				drawTerrainIcon(ctx, this.terrainTypes[i], s.x, s.y, iconSize, this.color(pts[i]), alpha, pts[i].x, pts[i].y);
			} else if (isSem && pts[i].semA >= 0 && pts[i].semB >= 0 && pts[i].semA !== pts[i].semB) {
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

		// ---------- selection ring + linked-note indicators ----------
		if (this.selectedIdx >= 0) {
			const sp = scr[this.selectedIdx];
			const selColor = this.mapTheme.noteStyle.selectionRing;
			// Main selection ring
			ctx.beginPath();
			ctx.arc(sp.x, sp.y, baseR * 2.2, 0, Math.PI * 2);
			ctx.strokeStyle = selColor;
			ctx.lineWidth = 1.5;
			ctx.stroke();

			// Encircle linked notes with a thinner ring
			if (showLinks) {
				ctx.save();
				ctx.strokeStyle = selColor;
				ctx.globalAlpha = 0.5;
				ctx.lineWidth = 1;
				const selP = pts[this.selectedIdx];
				// Outgoing links
				for (const link of selP.links) {
					const j = idx.get(link);
					if (j == null) continue;
					const sj = scr[j];
					ctx.beginPath();
					ctx.arc(sj.x, sj.y, baseR * 2, 0, Math.PI * 2);
					ctx.stroke();
				}
				// Incoming links (backlinks)
				for (let i = 0; i < pts.length; i++) {
					if (i === this.selectedIdx) continue;
					if (pts[i].links.includes(selP.path)) {
						const si = scr[i];
						ctx.beginPath();
						ctx.arc(si.x, si.y, baseR * 2, 0, Math.PI * 2);
						ctx.stroke();
					}
				}
				ctx.restore();
			}
		}

		// ---------- labels ----------
		const labelAlpha = this.exportLabelOverride ? 1 : Math.min(1, Math.max(0, (zoom - 5) / 3)) * this.plugin.settings.noteTitleOpacity;
		if (labelAlpha > 0.01 && this.plugin.settings.showNoteTitles) this.drawGlobalLabels(ctx, pts, scr, labelAlpha, W, H);

		// ---------- region selection overlay ----------
		if (this.regionSelectActive && this.regionStart && this.regionEnd) {
			ctx.save();
			const rx = Math.min(this.regionStart.x, this.regionEnd.x);
			const ry = Math.min(this.regionStart.y, this.regionEnd.y);
			const rw = Math.abs(this.regionEnd.x - this.regionStart.x);
			const rh = Math.abs(this.regionEnd.y - this.regionStart.y);
			ctx.strokeStyle = "#5AC6CE";
			ctx.lineWidth = 2;
			ctx.setLineDash([6, 4]);
			ctx.strokeRect(rx, ry, rw, rh);
			ctx.fillStyle = "rgba(90, 198, 206, 0.08)";
			ctx.fillRect(rx, ry, rw, rh);
			ctx.setLineDash([]);
			ctx.restore();
		}
		// Persisted region outline
		if (this.regionSelectActive && this.regionWorld && !this.regionStart) {
			ctx.save();
			const s1 = this.w2s(this.regionWorld.x1, this.regionWorld.y1);
			const s2 = this.w2s(this.regionWorld.x2, this.regionWorld.y2);
			const rx = Math.min(s1.x, s2.x), ry = Math.min(s1.y, s2.y);
			const rw = Math.abs(s2.x - s1.x), rh = Math.abs(s2.y - s1.y);
			ctx.strokeStyle = "#5AC6CE";
			ctx.lineWidth = 2;
			ctx.setLineDash([6, 4]);
			ctx.strokeRect(rx, ry, rw, rh);
			ctx.fillStyle = "rgba(90, 198, 206, 0.08)";
			ctx.fillRect(rx, ry, rw, rh);
			ctx.setLineDash([]);
			ctx.restore();
		}

		// ---------- minimap ----------
		if ((zoom > 1.2 || this.exportLabelOverride) && this.plugin.settings.minimapCorner !== "off") {
			this.drawMinimap(ctx, W, H);
		}

		// ---------- compass rose ----------
		this.drawCompassRose(ctx, W, H);

		// ---------- hover tooltip (when labels hidden) ----------
		if (this.hoverIdx >= 0 && labelAlpha < 0.5) {
			this.drawTooltip(ctx, scr[this.hoverIdx], pts[this.hoverIdx].title);
		}
	}

	// ---------- semantic point ----------
	private drawSemPt(ctx: CanvasRenderingContext2D, sx: number, sy: number, r: number, p: MapPoint, a: number) {
		const pal = this.mapTheme.palette;
		const cA = pal.semantic[p.semA % pal.semantic.length];
		const cB = pal.semantic[p.semB % pal.semantic.length];
		const split = pal.semSplit[p.semW] ?? 0.5;

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
		const nts = Math.round(this.plugin.settings.noteTitleSize * this.exportLabelScale);
		const isDark = document.body.classList.contains("theme-dark");
		const outlineOn = this.plugin.settings.labelOutline;
		const outlineW = this.plugin.settings.labelOutlineWidth * this.exportLabelScale;
		const fonts = this.mapTheme.fonts;
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.font = `${nts}px ${fonts.noteTitle}`;
		ctx.fillStyle = this.theme.text;
		ctx.textAlign = "left";
		const drawOutline = outlineOn && !this.exportLabelOverride;
		if (drawOutline) {
			ctx.strokeStyle = isDark ? "rgba(10,14,26,0.9)" : "rgba(248,248,255,0.9)";
			ctx.lineWidth = outlineW;
			ctx.lineJoin = "round";
		}
		for (let i = 0; i < pts.length; i++) {
			const s = scr[i];
			if (s.x < -50 || s.x > W + 50 || s.y < -50 || s.y > H + 50) continue;
			const t = pts[i].title.length > 40 ? pts[i].title.slice(0, 37) + "..." : pts[i].title;
			if (drawOutline) ctx.strokeText(t, s.x + 4, s.y + 2);
			ctx.fillText(t, s.x + 4, s.y + 2);
		}
		ctx.restore();
	}

	// ---------- tooltip ----------
	// ---------- grid lines ----------
	private drawGridLines(ctx: CanvasRenderingContext2D, W: number, H: number) {
		const dec = this.mapTheme.decorative;
		if (!dec.gridLines) return;
		const isDark = document.body.classList.contains("theme-dark");
		const color = isDark ? dec.gridColor.dark : dec.gridColor.light;
		const spacing = dec.gridSpacing;
		const isCartographic = dec.gridStyle === "cartographic";
		const useWobble = dec.inkWobble;
		const wobbleAmp = 0.3 * (dec.inkWobbleAmplitude || 1);

		ctx.save();
		ctx.strokeStyle = color;
		ctx.lineWidth = 0.5;
		ctx.globalAlpha = dec.gridOpacity;

		// World-space grid from -2 to 2
		for (let wx = -2; wx <= 2; wx += spacing) {
			const s0 = this.w2s(wx, -2);
			const s1 = this.w2s(wx, 2);
			if (useWobble) {
				strokeWobblyLine(ctx, s0.x, s0.y, s1.x, s1.y, wobbleAmp, 0.5, 10, hashCoords(wx, 0));
			} else {
				ctx.beginPath();
				ctx.moveTo(s0.x, s0.y);
				ctx.lineTo(s1.x, s1.y);
				ctx.stroke();
			}
		}
		for (let wy = -2; wy <= 2; wy += spacing) {
			const s0 = this.w2s(-2, wy);
			const s1 = this.w2s(2, wy);
			if (useWobble) {
				strokeWobblyLine(ctx, s0.x, s0.y, s1.x, s1.y, wobbleAmp, 0.5, 10, hashCoords(0, wy));
			} else {
				ctx.beginPath();
				ctx.moveTo(s0.x, s0.y);
				ctx.lineTo(s1.x, s1.y);
				ctx.stroke();
			}
		}

		// Grid intersection ornamental dots (cartographic only)
		if (isCartographic) {
			ctx.fillStyle = color;
			ctx.globalAlpha = dec.gridOpacity * 0.5;
			ctx.beginPath();
			for (let wx = -2; wx <= 2; wx += spacing) {
				for (let wy = -2; wy <= 2; wy += spacing) {
					const s = this.w2s(wx, wy);
					if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) continue;
					ctx.moveTo(s.x + 1.2, s.y);
					ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
				}
			}
			ctx.fill();
		}

		// Tick marks for cartographic style
		if (isCartographic) {
			ctx.globalAlpha = dec.gridOpacity * 0.6;
			const fonts = this.mapTheme.fonts;
			ctx.font = `italic 7px ${fonts.noteTitle}`;
			ctx.fillStyle = color;
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			for (let wx = -1; wx <= 1; wx += spacing) {
				const s = this.w2s(wx, -1);
				if (s.x > 10 && s.x < W - 10) {
					const deg = Math.round((wx + 1) * 90);
					ctx.fillText(`${deg}\u00B0`, s.x, s.y + 2);
				}
			}
			ctx.textAlign = "right";
			ctx.textBaseline = "middle";
			for (let wy = -1; wy <= 1; wy += spacing) {
				const s = this.w2s(-1, wy);
				if (s.y > 10 && s.y < H - 10) {
					const deg = Math.round((wy + 1) * 90);
					ctx.fillText(`${deg}\u00B0`, s.x - 3, s.y);
				}
			}
		}

		// Neatline border — decorative double-line rectangle around canvas
		if (dec.neatline) {
			ctx.globalAlpha = dec.gridOpacity * 0.8;
			ctx.strokeStyle = color;
			const m = 12; // margin from edge
			const gap = 4; // gap between double lines

			if (useWobble) {
				// Outer rectangle
				ctx.lineWidth = 1.2;
				const outerPts = [
					{ x: m, y: m }, { x: W - m, y: m },
					{ x: W - m, y: H - m }, { x: m, y: H - m }, { x: m, y: m },
				];
				strokeWobblyPolyline(ctx, outerPts, wobbleAmp * 0.5, 1.2, 77777);
				// Inner rectangle
				ctx.lineWidth = 0.6;
				const innerPts = [
					{ x: m + gap, y: m + gap }, { x: W - m - gap, y: m + gap },
					{ x: W - m - gap, y: H - m - gap }, { x: m + gap, y: H - m - gap }, { x: m + gap, y: m + gap },
				];
				strokeWobblyPolyline(ctx, innerPts, wobbleAmp * 0.3, 0.6, 88888);
			} else {
				ctx.lineWidth = 1.2;
				ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
				ctx.lineWidth = 0.6;
				ctx.strokeRect(m + gap, m + gap, W - 2 * (m + gap), H - 2 * (m + gap));
			}

			// Tick marks at grid intersections along the border
			ctx.lineWidth = 0.8;
			for (let wx = -2; wx <= 2; wx += spacing) {
				const s = this.w2s(wx, 0);
				if (s.x > m && s.x < W - m) {
					// Top tick
					ctx.beginPath(); ctx.moveTo(s.x, m); ctx.lineTo(s.x, m + gap); ctx.stroke();
					// Bottom tick
					ctx.beginPath(); ctx.moveTo(s.x, H - m - gap); ctx.lineTo(s.x, H - m); ctx.stroke();
				}
			}
			for (let wy = -2; wy <= 2; wy += spacing) {
				const s = this.w2s(0, wy);
				if (s.y > m && s.y < H - m) {
					// Left tick
					ctx.beginPath(); ctx.moveTo(m, s.y); ctx.lineTo(m + gap, s.y); ctx.stroke();
					// Right tick
					ctx.beginPath(); ctx.moveTo(W - m - gap, s.y); ctx.lineTo(W - m, s.y); ctx.stroke();
				}
			}
		}

		ctx.restore();
	}

	// ---------- compass rose ----------
	private drawCompassRose(ctx: CanvasRenderingContext2D, W: number, H: number) {
		const dec = this.mapTheme.decorative;
		if (!dec.compassRose) return;
		const isDark = document.body.classList.contains("theme-dark");
		const isCartographic = dec.compassStyle === "cartographic";
		const size = isCartographic ? 60 : 40;
		const margin = 20;
		let cx: number, cy: number;
		switch (dec.compassCorner) {
			case "top-left": cx = margin + size; cy = margin + size; break;
			case "top-right": cx = W - margin - size; cy = margin + size; break;
			case "bottom-left": cx = margin + size; cy = H - margin - size; break;
			default: cx = W - margin - size; cy = H - margin - size;
		}

		const color = isDark ? "rgba(200,200,220,0.5)" : "rgba(60,60,80,0.5)";
		const accentColor = isDark ? "rgba(200,200,220,0.7)" : "rgba(60,60,80,0.7)";
		const darkHalf = isDark ? "rgba(200,200,220,0.55)" : "rgba(60,60,80,0.55)";
		const lightHalf = isDark ? "rgba(200,200,220,0.2)" : "rgba(60,60,80,0.15)";

		ctx.save();
		ctx.translate(cx, cy);

		if (isCartographic) {
			const useWobble = dec.inkWobble;
			const seed = 54321;

			// Layer 1: 16-point star
			const drawStar = (dirs: number, getLen: (i: number) => number, getW: (i: number) => number) => {
				for (let i = 0; i < dirs; i++) {
					const angle = (i * Math.PI * 2) / dirs - Math.PI / 2;
					const len = getLen(i);
					const w = getW(i);
					const tipX = Math.cos(angle) * len;
					const tipY = Math.sin(angle) * len;
					const lx = Math.cos(angle - 0.08) * w;
					const ly = Math.sin(angle - 0.08) * w;
					const rx = Math.cos(angle + 0.08) * w;
					const ry = Math.sin(angle + 0.08) * w;

					// Dark half (left)
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(lx, ly);
					ctx.lineTo(tipX, tipY);
					ctx.closePath();
					ctx.fillStyle = i === 0 ? accentColor : darkHalf;
					ctx.fill();

					// Light half (right)
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(rx, ry);
					ctx.lineTo(tipX, tipY);
					ctx.closePath();
					ctx.fillStyle = lightHalf;
					ctx.fill();

					// Thin outline
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(lx, ly);
					ctx.lineTo(tipX, tipY);
					ctx.lineTo(rx, ry);
					ctx.closePath();
					ctx.strokeStyle = color;
					ctx.lineWidth = 0.3;
					ctx.stroke();
				}
			};

			// 16-point star: 4 cardinal (long), 4 ordinal (medium), 8 inter-ordinal (short)
			drawStar(16,
				(i) => i % 4 === 0 ? size : i % 2 === 0 ? size * 0.6 : size * 0.35,
				(i) => i % 4 === 0 ? 7 : i % 2 === 0 ? 4 : 2,
			);

			// Layer 2: Fleur-de-lis north pointer
			ctx.save();
			ctx.translate(0, -size - 4);
			const fleurSize = size * 0.2;
			ctx.fillStyle = accentColor;
			ctx.beginPath();
			// Center petal
			ctx.moveTo(0, -fleurSize);
			ctx.bezierCurveTo(fleurSize * 0.3, -fleurSize * 0.6, fleurSize * 0.2, 0, 0, fleurSize * 0.3);
			ctx.bezierCurveTo(-fleurSize * 0.2, 0, -fleurSize * 0.3, -fleurSize * 0.6, 0, -fleurSize);
			ctx.fill();
			// Left petal
			ctx.beginPath();
			ctx.moveTo(-fleurSize * 0.15, 0);
			ctx.bezierCurveTo(-fleurSize * 0.6, -fleurSize * 0.4, -fleurSize * 0.8, -fleurSize * 0.1, -fleurSize * 0.5, fleurSize * 0.3);
			ctx.lineTo(-fleurSize * 0.1, fleurSize * 0.1);
			ctx.closePath();
			ctx.fill();
			// Right petal
			ctx.beginPath();
			ctx.moveTo(fleurSize * 0.15, 0);
			ctx.bezierCurveTo(fleurSize * 0.6, -fleurSize * 0.4, fleurSize * 0.8, -fleurSize * 0.1, fleurSize * 0.5, fleurSize * 0.3);
			ctx.lineTo(fleurSize * 0.1, fleurSize * 0.1);
			ctx.closePath();
			ctx.fill();
			ctx.restore();

			// Layer 3: Two concentric wobbly rings
			ctx.strokeStyle = color;
			const outerR = size * 0.82;
			const innerR = size * 0.72;
			for (const r of [outerR, innerR]) {
				const segments = 36;
				ctx.beginPath();
				for (let j = 0; j <= segments; j++) {
					const a = (j / segments) * Math.PI * 2;
					const wobble = useWobble ? 1 + (mulberry32(seed + j * 17 + Math.round(r))() - 0.5) * 0.02 : 1;
					const px = Math.cos(a) * r * wobble;
					const py = Math.sin(a) * r * wobble;
					if (j === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.closePath();
				ctx.lineWidth = r === outerR ? 0.8 : 0.5;
				ctx.stroke();
			}

			// Cardinal labels between rings
			const fonts = this.mapTheme.fonts;
			ctx.font = `italic bold 8px ${fonts.zoneLabel}`;
			ctx.fillStyle = accentColor;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			const labelR = (outerR + innerR) / 2;
			const labels: [string, number][] = [["N", -Math.PI / 2], ["E", 0], ["S", Math.PI / 2], ["W", Math.PI]];
			for (const [label, angle] of labels) {
				// Skip N — replaced by fleur-de-lis
				if (label === "N") continue;
				ctx.fillText(label, Math.cos(angle) * labelR, Math.sin(angle) * labelR);
			}

			// Tick marks every 30°
			ctx.strokeStyle = color;
			ctx.lineWidth = 0.5;
			for (let deg = 0; deg < 360; deg += 30) {
				const a = (deg * Math.PI) / 180 - Math.PI / 2;
				if (deg % 90 === 0) continue; // skip cardinals (have labels)
				ctx.beginPath();
				ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
				ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
				ctx.stroke();
			}

			// Center ornamental circle
			ctx.beginPath();
			ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
			ctx.fillStyle = color;
			ctx.fill();
			ctx.beginPath();
			ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
			ctx.fillStyle = isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)";
			ctx.fill();

		} else {
			// Modern minimal 4-point compass
			const points: [number, number][] = [
				[0, -size], [size * 0.5, 0], [0, size], [-size * 0.5, 0],
			];
			ctx.beginPath();
			ctx.moveTo(points[0][0], points[0][1]);
			for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
			ctx.closePath();
			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.stroke();

			// Fill north triangle
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(-4, 0);
			ctx.lineTo(0, -size);
			ctx.lineTo(4, 0);
			ctx.closePath();
			ctx.fillStyle = accentColor;
			ctx.fill();

			// N label
			const fonts = this.mapTheme.fonts;
			ctx.font = `bold 10px ${fonts.zoneLabel}`;
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			ctx.fillStyle = accentColor;
			ctx.fillText("N", 0, -size - 4);
		}

		ctx.restore();
	}

	private drawTooltip(ctx: CanvasRenderingContext2D, s: ScreenPt, title: string) {
		const th = this.theme;
		const label = title.length > 60 ? title.slice(0, 57) + "..." : title;
		ctx.font = `12px ${this.mapTheme.fonts.noteTitle}`;
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
		const baseSize = Math.min(160, Math.min(W, H) * 0.28);
		const size = this.exportLabelOverride ? baseSize * 5 : baseSize;
		const pad = this.exportLabelOverride ? 40 : 14;
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
			if (this.regionSelectActive) {
				const rect = c.getBoundingClientRect();
				const mx = e.clientX - rect.left, my = e.clientY - rect.top;
				this.regionStart = { x: mx, y: my };
				this.regionEnd = { x: mx, y: my };
				this.regionWorld = null;
				c.style.cursor = "crosshair";
				return;
			}
			this.dragging = true;
			this.dragStartX = e.clientX;
			this.dragStartY = e.clientY;
			this.dragPanX = this.panX;
			this.dragPanY = this.panY;
			c.style.cursor = "grabbing";
		});

		c.addEventListener("mousemove", (e) => {
			if (this.regionSelectActive && this.regionStart) {
				const rect = c.getBoundingClientRect();
				this.regionEnd = { x: e.clientX - rect.left, y: e.clientY - rect.top };
				this.draw();
				return;
			}
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
				c.style.cursor = this.regionSelectActive ? "crosshair" : (best >= 0 ? "pointer" : "grab");
				this.draw();
			}
		});

		c.addEventListener("mouseup", (e) => {
			if (this.regionSelectActive && this.regionStart && this.regionEnd) {
				const dx = this.regionEnd.x - this.regionStart.x;
				const dy = this.regionEnd.y - this.regionStart.y;
				if (Math.abs(dx) > 10 && Math.abs(dy) > 10) {
					const w1 = this.s2w(this.regionStart.x, this.regionStart.y);
					const w2 = this.s2w(this.regionEnd.x, this.regionEnd.y);
					this.regionWorld = { x1: w1.x, y1: w1.y, x2: w2.x, y2: w2.y };
					// Enable the export button
					const exportBtn = this.exportPanel.querySelector(".chorographia-export-btn-primary") as HTMLButtonElement | null;
					if (exportBtn) exportBtn.disabled = false;
					// Remove hint
					const hint = this.containerEl.querySelector(".chorographia-region-hint");
					if (hint) hint.remove();
				}
				this.regionStart = null;
				this.regionEnd = null;
				this.draw();
				return;
			}
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

		c.addEventListener("dblclick", (e) => {
			if (!this.editMode) return;
			const rect = c.getBoundingClientRect();
			const mx = e.clientX - rect.left;
			const my = e.clientY - rect.top;
			for (const hb of this.labelHitboxes) {
				if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y - hb.h && my <= hb.y) {
					this.startLabelEdit(hb, rect);
					break;
				}
			}
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

	private startLabelEdit(hb: typeof this.labelHitboxes[0], canvasRect: DOMRect) {
		if (this.editingLabel) {
			this.editingLabel.el.remove();
			this.editingLabel = null;
		}
		const container = this.containerEl.children[1] as HTMLElement;
		const input = container.createEl("input", { cls: "chorographia-label-edit" });
		const currentLabel = hb.type === "zone"
			? this.zones.find(z => z.id === hb.zoneId)?.label || ""
			: this.subZonesMap.get(hb.zoneId)?.find(sz => sz.id === hb.subId)?.label || "";
		input.value = currentLabel;
		input.style.left = `${hb.x}px`;
		input.style.top = `${hb.y - hb.h - 4}px`;
		input.style.width = `${Math.max(80, hb.w + 20)}px`;
		input.focus();
		input.select();

		const commit = () => {
			const val = input.value.trim();
			if (val && val !== currentLabel) {
				if (!this.plugin.cache.userLabelOverrides) this.plugin.cache.userLabelOverrides = {};
				if (!this.plugin.cache.userSubLabelOverrides) this.plugin.cache.userSubLabelOverrides = {};
				if (hb.type === "zone") {
					this.plugin.cache.userLabelOverrides[hb.zoneId] = val;
					const zone = this.zones.find(z => z.id === hb.zoneId);
					if (zone) zone.label = val;
				} else if (hb.subId != null) {
					if (!this.plugin.cache.userSubLabelOverrides[hb.zoneId]) {
						this.plugin.cache.userSubLabelOverrides[hb.zoneId] = {};
					}
					this.plugin.cache.userSubLabelOverrides[hb.zoneId][hb.subId] = val;
					const sub = this.subZonesMap.get(hb.zoneId)?.find(sz => sz.id === hb.subId);
					if (sub) sub.label = val;
				}
				this.plugin.saveCache();
				this.draw();
			}
			input.remove();
			this.editingLabel = null;
		};

		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") { e.preventDefault(); commit(); }
			if (e.key === "Escape") { input.remove(); this.editingLabel = null; }
		});
		input.addEventListener("blur", commit);
		this.editingLabel = { type: hb.type, zoneId: hb.zoneId, subId: hb.subId, el: input };
	}

	async refresh(): Promise<void> {
		this.applyThemeBackground();
		await this.loadPoints();
		this.resizeCanvas();
		this.draw();
	}
}
