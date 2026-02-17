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
import { importSmartConnectionsEmbeddings } from "./smartconnections";
import { computeLayout } from "./layout";
import { ChorographiaView, VIEW_TYPE } from "./view";
import { SEM_PALETTE, FOLDER_COLORS, SEM_SPLIT, lerpColor } from "./colors";

function noteColor(note: NoteCache, folderColors: Map<string, string>): string {
	const semA = note.semA ?? -1;
	const semB = note.semB ?? -1;
	const semW = note.semW ?? 3;
	if (semA >= 0) {
		const cA = SEM_PALETTE[semA % SEM_PALETTE.length];
		if (semB < 0 || semA === semB) return cA;
		const cB = SEM_PALETTE[semB % SEM_PALETTE.length];
		return lerpColor(cA, cB, 1 - (SEM_SPLIT[semW] ?? 0.5));
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

		this.addCommand({
			id: "recompute-layout",
			name: "Recompute layout",
			callback: () => this.runLayoutCompute(),
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
			case "smart-connections": return "smart-connections";
		}
	}

	async runEmbedPipeline(): Promise<void> {
		// Validate per-provider requirements
		if (this.settings.embeddingProvider === "openai" && !this.settings.openaiApiKey) {
			new Notice("Chorographia: Set your OpenAI API key in settings first.");
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

		new Notice("Chorographia: Indexing vault...");
		const notes = await indexVault(
			this.app.vault,
			globs,
			excludeGlobs,
			this.settings.maxNotes
		);
		new Notice(`Chorographia: Found ${notes.length} notes.`);

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
				cached.semK = note.semK;
				cached.semA = note.semA;
				cached.semB = note.semB;
				cached.semW = note.semW;
				cached.noteType = note.noteType;
				cached.cat = note.cat;
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
			new Notice("Chorographia: All notes up to date.");
			await this.saveCache();
			this.refreshMapViews();
			this.updateExplorerDots();
			return;
		}

		new Notice(
			`Chorographia: Embedding ${toEmbed.length} notes...`
		);

		const onProgress = (done: number, total: number) => {
			new Notice(`Chorographia: Embedded ${done}/${total}`);
		};

		let results: import("./openai").EmbedResult[];
		switch (this.settings.embeddingProvider) {
			case "ollama":
				results = await embedTextsOllama(toEmbed, this.settings.ollamaUrl, this.settings.ollamaEmbedModel, onProgress);
				break;
			case "openai":
				results = await embedTexts(toEmbed, this.settings.openaiApiKey, this.settings.embeddingModel, onProgress);
				break;
			case "smart-connections":
				results = await importSmartConnectionsEmbeddings(this.app, toEmbed.map((t) => t.path));
				break;
		}

		// Update cache with new embeddings
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
				semK: note.semK,
				semA: note.semA,
				semB: note.semB,
				semW: note.semW,
				noteType: note.noteType,
				cat: note.cat,
				links: note.links,
			};
		}

		// Also ensure metadata for unchanged notes is updated
		for (const note of notes) {
			if (this.cache.notes[note.path]) {
				this.cache.notes[note.path].title = note.title;
				this.cache.notes[note.path].folder = note.folder;
				this.cache.notes[note.path].semK = note.semK;
				this.cache.notes[note.path].semA = note.semA;
				this.cache.notes[note.path].semB = note.semB;
				this.cache.notes[note.path].semW = note.semW;
				this.cache.notes[note.path].noteType = note.noteType;
				this.cache.notes[note.path].cat = note.cat;
				this.cache.notes[note.path].links = note.links;
			}
		}

		// Invalidate zone cache when embeddings change
		this.cache.zones = {};

		await this.saveCache();
		this.refreshMapViews();
		this.updateExplorerDots();
		new Notice(`Chorographia: Embedding complete (${results.length} new).`);

		// Auto-compute layout if this is first run
		const hasLayout = Object.values(this.cache.notes).some(
			(n) => n.x != null
		);
		if (!hasLayout) {
			await this.runLayoutCompute();
		}
	}

	async runZoneNaming(): Promise<void> {
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

		await this.saveCache();
		new Notice("Chorographia: Layout computed.");

		// Refresh open map views
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
			(leaf.view as ChorographiaView).refresh();
		}
		this.updateExplorerDots();
	}
}
