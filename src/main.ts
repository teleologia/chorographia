import { Plugin, Notice, WorkspaceLeaf } from "obsidian";
import {
	ChorographiaSettings,
	DEFAULT_SETTINGS,
	ChorographiaSettingTab,
} from "./settings";
import { PluginCache, NoteCache } from "./cache";
import { indexVault } from "./indexer";
import { embedTexts } from "./openai";
import { embedTextsOllama } from "./ollama";
import { embedTextsOpenRouter } from "./openrouter";
import { computeLayout, interpolateNewPoints } from "./layout";
import { kMeans, computeSemanticAssignments } from "./kmeans";
import { decodeFloat32, encodeFloat32 } from "./cache";
import { ChorographiaView, VIEW_TYPE } from "./view";

// Same palette as view.ts — used for explorer dots
const SEM_PALETTE = [
	"#00D6FF", "#B9FF00", "#FF7A00", "#A855F7",
	"#00FFB3", "#FF3DB8", "#00FFA3", "#FFD400",
	"#00F5D4", "#FF9A3D", "#7CFFCB", "#B8C0FF",
];
const FOLDER_COLORS = [
	"#8E9AAF", "#C9963B", "#B28DFF", "#5AC6CE", "#B8541A",
	"#9AB2AF", "#BCDC2B", "#FF7A00", "#A855F7", "#00D6FF",
	"#00FFB3", "#FF3DB8",
];
const SEM_SPLIT: Record<number, number> = { 1: 0.80, 2: 0.65, 3: 0.50, 4: 0.35, 5: 0.20 };

function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerpHex(c1: string, c2: string, t: number): string {
	const [r1, g1, b1] = hexToRgb(c1);
	const [r2, g2, b2] = hexToRgb(c2);
	const r = Math.round(r1 + (r2 - r1) * t);
	const g = Math.round(g1 + (g2 - g1) * t);
	const b = Math.round(b1 + (b2 - b1) * t);
	return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function noteColor(note: NoteCache, folderColors: Map<string, string>): string {
	const semA = note.semA ?? -1;
	const semB = note.semB ?? -1;
	const semW = note.semW ?? 3;
	if (semA >= 0) {
		const cA = SEM_PALETTE[semA % SEM_PALETTE.length];
		if (semB < 0 || semA === semB) return cA;
		const cB = SEM_PALETTE[semB % SEM_PALETTE.length];
		return lerpHex(cA, cB, 1 - (SEM_SPLIT[semW] ?? 0.5));
	}
	return folderColors.get(note.folder) || FOLDER_COLORS[0];
}

export default class ChorographiaPlugin extends Plugin {
	settings: ChorographiaSettings = DEFAULT_SETTINGS;
	cache: PluginCache = { notes: {} };
	private explorerStyleEl: HTMLStyleElement | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();
		await this.loadCache();

		// Migration: compute semantic colors if notes exist but have no semA yet
		const noteEntries = Object.values(this.cache.notes);
		if (noteEntries.length > 0 && noteEntries.some(n => n.embedding) && !noteEntries.some(n => n.semA != null)) {
			await this.computeSemanticColors();
		}

		this.registerView(VIEW_TYPE, (leaf) => new ChorographiaView(leaf, this));

		this.addRibbonIcon("map", "Open Chorographia Map", () => {
			this.activateView();
		});

		this.addCommand({
			id: "open-chorographia-map",
			name: "Open Chorographia Map",
			callback: () => this.activateView(),
		});

		this.addCommand({
			id: "re-embed-changed",
			name: "Re-embed changed notes",
			callback: () => this.runEmbedPipeline(),
		});

		this.addSettingTab(new ChorographiaSettingTab(this.app, this));

		// Inject explorer dots once layout is ready
		this.app.workspace.onLayoutReady(() => {
			this.updateExplorerDots();
		});
	}

	async onunload(): Promise<void> {
		this.removeExplorerDots();
	}

	async activateView(): Promise<void> {
		const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
		if (existing.length > 0) {
			this.app.workspace.revealLeaf(existing[0]);
			return;
		}

		const leaf = this.app.workspace.getRightLeaf(false);
		if (leaf) {
			await leaf.setViewState({ type: VIEW_TYPE, active: true });
			this.app.workspace.revealLeaf(leaf);
		}
	}

	// --- Settings persistence ---

	async loadSettings(): Promise<void> {
		const data = await this.loadData();
		if (data?.settings) {
			this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
		}
	}

	async saveSettings(): Promise<void> {
		const data = (await this.loadData()) || {};
		data.settings = this.settings;
		await this.saveData(data);
	}

	// --- Cache persistence ---

	async loadCache(): Promise<void> {
		const data = await this.loadData();
		if (data?.cache) {
			this.cache = data.cache;
		}
	}

	async saveCache(): Promise<void> {
		const data = (await this.loadData()) || {};
		data.cache = this.cache;
		await this.saveData(data);
	}

	// --- Pipeline commands ---

	get embeddingModelString(): string {
		switch (this.settings.embeddingProvider) {
			case "ollama": return `ollama:${this.settings.ollamaEmbedModel}`;
			case "openai": return `openai:${this.settings.embeddingModel}`;
			case "openrouter": return `openrouter:${this.settings.openrouterEmbedModel}`;
		}
	}

	async runEmbedPipeline(): Promise<void> {
		const pipelineStart = performance.now();
		const provider = this.settings.embeddingProvider;
		const modelName = provider === "ollama"
			? this.settings.ollamaEmbedModel
			: provider === "openai"
				? this.settings.embeddingModel
				: this.settings.openrouterEmbedModel;
		if (provider === "ollama") {
			console.log(`[Chorographia] Pipeline started | provider: ${provider} | model: ${modelName} | url: ${this.settings.ollamaUrl}`);
		} else {
			console.log(`[Chorographia] Pipeline started | provider: ${provider} | model: ${modelName}`);
		}

		// Validate per-provider requirements
		if (provider === "openai" && !this.settings.openaiApiKey) {
			new Notice("Chorographia: Set your OpenAI API key in settings first.");
			return;
		}
		if (provider === "openrouter" && !this.settings.openrouterApiKey) {
			new Notice("Chorographia: Set your OpenRouter API key in settings first.");
			return;
		}

		const globs = this.settings.includeGlobs
			.split(",")
			.map((g) => g.trim())
			.filter(Boolean);
		const excludeGlobs = this.settings.excludeGlobs
			.split(",")
			.map((g) => g.trim())
			.filter(Boolean);

		console.log(`[Chorographia] Indexing vault | include: ${globs.join(", ")} | exclude: ${excludeGlobs.join(", ")} | maxNotes: ${this.settings.maxNotes}`);
		new Notice("Chorographia: Indexing vault...");
		const indexStart = performance.now();
		const notes = await indexVault(
			this.app.vault,
			globs,
			excludeGlobs,
			this.settings.maxNotes
		);
		const indexElapsed = ((performance.now() - indexStart) / 1000).toFixed(1);
		new Notice(`Chorographia: Found ${notes.length} notes.`);
		console.log(`[Chorographia] Indexing complete in ${indexElapsed}s | ${notes.length} notes found | modelString: ${this.embeddingModelString}`);

		// Determine which notes need (re-)embedding
		const modelStr = this.embeddingModelString;
		const toEmbed: { path: string; text: string }[] = [];
		for (const note of notes) {
			const cached = this.cache.notes[note.path];
			if (
				cached &&
				cached.sha256 === note.sha256 &&
				cached.model === modelStr &&
				cached.embedding
			) {
				// Update metadata even if embedding unchanged
				cached.title = note.title;
				cached.folder = note.folder;
				cached.noteType = note.noteType;
				cached.cat = note.cat;
				cached.tags = note.tags;
				cached.links = note.links;
				continue;
			}
			toEmbed.push({ path: note.path, text: note.embedText });
		}

		// Remove notes no longer in index
		const indexedPaths = new Set(notes.map((n) => n.path));
		for (const path of Object.keys(this.cache.notes)) {
			if (!indexedPaths.has(path)) {
				delete this.cache.notes[path];
			}
		}

		if (toEmbed.length === 0) {
			console.log(`[Chorographia] All ${notes.length} notes up to date (fully cached)`);
			new Notice("Chorographia: All notes up to date.");
			await this.saveCache();
			this.refreshMapViews();
			this.updateExplorerDots();
			return;
		}

		console.log(`[Chorographia] ${toEmbed.length} notes need embedding, ${notes.length - toEmbed.length} cached`);
		new Notice(
			`Chorographia: Embedding ${toEmbed.length} notes...`
		);

		const onProgress = (done: number, total: number) => {
			const pct = Math.round((done / total) * 100);
			const elapsedSec = (performance.now() - pipelineStart) / 1000;
			const safeElapsed = Math.max(elapsedSec, 0.001);
			const rate = done / safeElapsed;
			const rateStr = rate < 0.1 ? rate.toFixed(2) : rate.toFixed(1);
			const eta = done > 0 && rate > 0 ? Math.round((total - done) / rate) : "?";
			console.log(
				`[Chorographia] [${modelName}] Progress: ${done}/${total} (${pct}%) | ${elapsedSec.toFixed(1)}s elapsed | ~${rateStr} notes/s | ETA ~${eta}s`
			);
			new Notice(`Chorographia: Embedded ${done}/${total} (${pct}%)`);
		};

		let results: import("./openai").EmbedResult[] = [];
		try {
			switch (provider) {
				case "ollama":
					results = await embedTextsOllama(toEmbed, this.settings.ollamaUrl, this.settings.ollamaEmbedModel, onProgress);
					break;
				case "openai":
					results = await embedTexts(toEmbed, this.settings.openaiApiKey, this.settings.embeddingModel, onProgress);
					break;
				case "openrouter":
					results = await embedTextsOpenRouter(toEmbed, this.settings.openrouterApiKey, this.settings.openrouterEmbedModel, onProgress);
					break;
			}
			console.log(`[Chorographia] [${modelName}] Embedding phase complete | ${results.length} results`);
		} catch (err) {
			const elapsed = ((performance.now() - pipelineStart) / 1000).toFixed(1);
			const message = err instanceof Error ? err.message : String(err);
			console.error(`[Chorographia] [${modelName}] Pipeline FAILED after ${elapsed}s:`, err);
			new Notice(`Chorographia: Embedding failed - ${message}`);
			return;
		}

		// Update cache with new embeddings
		console.log(`[Chorographia] Caching ${results.length} embedding results...`);
		for (const r of results) {
			const note = notes.find((n) => n.path === r.path)!;
			this.cache.notes[r.path] = {
				sha256: note.sha256,
				model: modelStr,
				embedding: r.embedding,
				x: this.cache.notes[r.path]?.x,
				y: this.cache.notes[r.path]?.y,
				title: note.title,
				folder: note.folder,
				noteType: note.noteType,
				cat: note.cat,
				tags: note.tags,
				links: note.links,
			};
		}

		// Also ensure metadata for unchanged notes is updated
		for (const note of notes) {
			if (this.cache.notes[note.path]) {
				this.cache.notes[note.path].title = note.title;
				this.cache.notes[note.path].folder = note.folder;
				this.cache.notes[note.path].noteType = note.noteType;
				this.cache.notes[note.path].cat = note.cat;
				this.cache.notes[note.path].tags = note.tags;
				this.cache.notes[note.path].links = note.links;
			}
		}

		// Invalidate zone cache when embeddings change
		console.log("[Chorographia] Computing zones...");
		if (this.settings.mapLocked) {
			this.preserveAndInvalidateZones();
		} else {
			this.cache.zones = {};
		}

		// Compute semantic colors from k-means clustering
		console.log(`[Chorographia] Computing semantic colors (locked: ${this.settings.mapLocked})...`);
		const colorStart = performance.now();
		if (this.settings.mapLocked) {
			this.computeSemanticColorsLocked();
		} else {
			await this.computeSemanticColors();
		}
		console.log(`[Chorographia] Semantic colors computed in ${((performance.now() - colorStart) / 1000).toFixed(1)}s`);

		console.log("[Chorographia] Saving cache...");
		const saveStart = performance.now();
		await this.saveCache();
		console.log(`[Chorographia] Cache saved in ${((performance.now() - saveStart) / 1000).toFixed(1)}s`);
		this.refreshMapViews();
		this.updateExplorerDots();
		new Notice(`Chorographia: Embedding complete (${results.length} new).`);

		// Auto-compute layout if this is first run or locked mode has new notes without coords
		const hasLayout = Object.values(this.cache.notes).some(
			(n) => n.x != null
		);
		const hasNewWithoutCoords = this.settings.mapLocked &&
			Object.values(this.cache.notes).some((n) => n.embedding && n.x == null);
		if (!hasLayout || hasNewWithoutCoords) {
			console.log(`[Chorographia] Running UMAP layout compute (hasLayout: ${hasLayout}, newWithoutCoords: ${hasNewWithoutCoords})...`);
			const layoutStart = performance.now();
			await this.runLayoutCompute();
			console.log(`[Chorographia] Layout compute complete in ${((performance.now() - layoutStart) / 1000).toFixed(1)}s`);
			// Auto-enable lock after first successful layout
			if (!hasLayout && !this.settings.mapLocked) {
				this.settings.mapLocked = true;
				await this.saveSettings();
			}
		} else {
			console.log("[Chorographia] Skipping layout compute (existing layout found)");
		}

		const totalElapsed = ((performance.now() - pipelineStart) / 1000).toFixed(1);
		console.log(`[Chorographia] Pipeline complete in ${totalElapsed}s | ${results.length} embedded, ${notes.length - results.length} cached`);
	}

	async runZoneNaming(): Promise<void> {
		// When locked, clear locked labels so LLM naming runs fresh
		if (this.settings.mapLocked) {
			delete this.cache.lockedLabels;
			delete this.cache.lockedSubLabels;
		}
		// Invalidate zone cache so names are regenerated
		this.cache.zones = {};
		await this.saveCache();
		await this.refreshMapViews();
	}

	async refreshMapViews(): Promise<void> {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
			await (leaf.view as ChorographiaView).refresh();
		}
	}

	updateExplorerDots(): void {
		this.removeExplorerDots();
		if (!this.settings.showExplorerDots) return;

		const notes = this.cache.notes;
		if (Object.keys(notes).length === 0) return;

		// Build folder color map
		const folders = new Set<string>();
		for (const n of Object.values(notes)) {
			if (n.folder) folders.add(n.folder);
		}
		const folderArr = [...folders].sort();
		const folderColors = new Map<string, string>();
		folderArr.forEach((f, i) => {
			folderColors.set(f, FOLDER_COLORS[i % FOLDER_COLORS.length]);
		});

		// Build CSS rules — render dot as background-image on .nav-file-title-content
		// positioned after the TYPE + CAT badges (104px), matching the old snippet layout
		const dotSize = 9;
		const dotLeft = 104 + 6; // after badges + gap
		const totalPad = dotLeft + dotSize + 6; // dot + gap before title text

		const rules: string[] = [];

		// Base rule: expand padding to make room for dot after badges
		rules.push(
			`.chorographia-dots .nav-file-title[data-path] .nav-file-title-content { ` +
			`padding-left: ${totalPad}px !important; }`
		);

		for (const [path, note] of Object.entries(notes)) {
			const color = noteColor(note, folderColors);
			const escaped = CSS.escape(path);
			rules.push(
				`.nav-file-title[data-path="${escaped}"] .nav-file-title-content { ` +
				`background-image: ` +
				`radial-gradient(circle, transparent 0 58%, var(--background-primary) 60% 100%), ` +
				`radial-gradient(circle at 40% 35%, rgba(255,255,255,0.15) 0 45%, transparent 78%), ` +
				`radial-gradient(circle, ${color} 50%, transparent 51%); ` +
				`background-size: ${dotSize}px ${dotSize}px; ` +
				`background-position: ${dotLeft}px 50%; ` +
				`background-repeat: no-repeat; }`
			);
		}

		const el = document.createElement("style");
		el.id = "chorographia-explorer-dots";
		el.textContent = rules.join("\n");
		document.head.appendChild(el);
		this.explorerStyleEl = el;

		// Add marker class for the padding rule
		document.querySelectorAll(".nav-files-container").forEach((c) => {
			c.classList.add("chorographia-dots");
		});
	}

	private removeExplorerDots(): void {
		if (this.explorerStyleEl) {
			this.explorerStyleEl.remove();
			this.explorerStyleEl = null;
		}
		document.getElementById("chorographia-explorer-dots")?.remove();
		document.querySelectorAll(".chorographia-dots").forEach((c) => {
			c.classList.remove("chorographia-dots");
		});
	}

	async runLayoutCompute(): Promise<void> {
		const count = Object.values(this.cache.notes).filter(
			(n) => n.embedding
		).length;
		if (count === 0) {
			new Notice("Chorographia: No embeddings cached. Run re-embed first.");
			return;
		}

		if (this.settings.mapLocked) {
			// Locked mode: only place notes that have embeddings but no coordinates
			const newPaths = Object.entries(this.cache.notes)
				.filter(([_, n]) => n.embedding && n.x == null)
				.map(([p]) => p);

			if (newPaths.length === 0) {
				new Notice("Chorographia: All notes already placed.");
			} else {
				new Notice(`Chorographia: Placing ${newPaths.length} new notes...`);
				const points = interpolateNewPoints(this.cache.notes, newPaths);
				for (const p of points) {
					if (this.cache.notes[p.path]) {
						this.cache.notes[p.path].x = p.x;
						this.cache.notes[p.path].y = p.y;
					}
				}
			}

			// Use locked semantic colors and preserve zone labels
			this.computeSemanticColorsLocked();
			this.preserveAndInvalidateZones();
		} else {
			new Notice(`Chorographia: Computing layout for ${count} notes...`);

			// Run UMAP in a timeout to avoid blocking UI
			await new Promise<void>((resolve) => {
				setTimeout(() => {
					const points = computeLayout(this.cache.notes);
					for (const p of points) {
						if (this.cache.notes[p.path]) {
							this.cache.notes[p.path].x = p.x;
							this.cache.notes[p.path].y = p.y;
						}
					}
					resolve();
				}, 50);
			});

			// Invalidate zone cache when layout changes
			this.cache.zones = {};

			// Recompute semantic colors
			await this.computeSemanticColors();
		}

		await this.saveCache();
		new Notice("Chorographia: Layout computed.");

		// Refresh open map views
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
			(leaf.view as ChorographiaView).refresh();
		}
		this.updateExplorerDots();
	}

	async computeSemanticColors(): Promise<void> {
		const paths: string[] = [];
		const vectors: Float32Array[] = [];
		for (const [path, note] of Object.entries(this.cache.notes)) {
			if (note.embedding) {
				paths.push(path);
				vectors.push(decodeFloat32(note.embedding));
			}
		}
		if (vectors.length === 0) return;

		const k = Math.min(this.settings.zoneGranularity, vectors.length);
		const { centroids } = kMeans(vectors, k);
		const assignments = computeSemanticAssignments(vectors, centroids);

		for (let i = 0; i < paths.length; i++) {
			const note = this.cache.notes[paths[i]];
			if (note) {
				note.semA = assignments[i].semA;
				note.semB = assignments[i].semB;
				note.semW = assignments[i].semW;
			}
		}
	}

	/**
	 * Assign semantic colors using cached locked centroids instead of re-running k-means.
	 * Falls back to full computeSemanticColors if no locked centroids exist.
	 */
	computeSemanticColorsLocked(): void {
		// Try lockedCentroids first, then any zone cache entry's centroids
		let centroids: Float32Array[] | undefined;
		if (this.cache.lockedCentroids && this.cache.lockedCentroids.length > 0) {
			centroids = this.cache.lockedCentroids.map(c => decodeFloat32(c));
		} else if (this.cache.zones) {
			for (const entry of Object.values(this.cache.zones)) {
				if (entry.centroids && entry.centroids.length > 0) {
					centroids = entry.centroids.map(c => decodeFloat32(c));
					break;
				}
			}
		}

		if (!centroids) {
			// No cached centroids — fall back to full recompute
			this.computeSemanticColors();
			return;
		}

		const paths: string[] = [];
		const vectors: Float32Array[] = [];
		for (const [path, note] of Object.entries(this.cache.notes)) {
			if (note.embedding) {
				paths.push(path);
				vectors.push(decodeFloat32(note.embedding));
			}
		}
		if (vectors.length === 0) return;

		const assignments = computeSemanticAssignments(vectors, centroids);
		for (let i = 0; i < paths.length; i++) {
			const note = this.cache.notes[paths[i]];
			if (note) {
				note.semA = assignments[i].semA;
				note.semB = assignments[i].semB;
				note.semW = assignments[i].semW;
			}
		}
	}

	/**
	 * Extract labels + centroids from the most recent zone cache entry,
	 * store them in the locked* fields, then wipe zone geometry cache.
	 */
	preserveAndInvalidateZones(): void {
		if (this.cache.zones) {
			// Find the most recent (any) zone cache entry with centroids
			for (const entry of Object.values(this.cache.zones)) {
				if (entry.centroids && entry.centroids.length > 0) {
					this.cache.lockedCentroids = entry.centroids;
					this.cache.lockedLabels = entry.labels;
					this.cache.lockedSubLabels = entry.subLabels;
					break;
				}
			}
		}
		this.cache.zones = {};
	}
}
