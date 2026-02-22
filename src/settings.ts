import { App, PluginSettingTab, Setting, Notice } from "obsidian";
import type ChorographiaPlugin from "./main";

export type ColorMode = "semantic" | "folder" | "type" | "cat";

export type MinimapCorner = "off" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export const EMBED_BATCH_SIZE_MIN = 1;
export const EMBED_BATCH_SIZE_MAX = 100;
const DEFAULT_EMBED_BATCH_SIZE = 50;

export function clampEmbedBatchSize(value: number, fallback = DEFAULT_EMBED_BATCH_SIZE): number {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(EMBED_BATCH_SIZE_MAX, Math.max(EMBED_BATCH_SIZE_MIN, Math.round(n)));
}

export interface ChorographiaSettings {
	embeddingProvider: "ollama" | "openai" | "openrouter";
	ollamaUrl: string;
	ollamaEmbedModel: string;
	ollamaEmbedBatchSize: number;
	ollamaLlmModel: string;
	llmProvider: "ollama" | "openai" | "openrouter";
	openaiApiKey: string;
	embeddingModel: string;
	openaiEmbedBatchSize: number;
	openrouterApiKey: string;
	openrouterEmbedModel: string;
	openrouterEmbedBatchSize: number;
	openrouterLlmModel: string;
	includeGlobs: string;
	excludeGlobs: string;
	maxNotes: number;
	showLinks: boolean;
	colorMode: ColorMode;
	showExplorerDots: boolean;
	minimapCorner: MinimapCorner;
	showZones: boolean;
	zoneGranularity: number;
	enableLLMZoneNaming: boolean;
	zoneStyle: "starmap" | "worldmap";
	worldmapSeaLevel: number;       // 0.1 (flood) – 0.5 (drought)
	worldmapUnity: number;          // 0.03 (islands) – 0.12 (pangea)
	worldmapRuggedness: number;     // 0.1 (smooth) – 1.0 (jagged)
	mapLocked: boolean;
	showSubZones: boolean;
	showNoteTitles: boolean;
	zoneLabelSize: number;
	zoneLabelOpacity: number;
	noteTitleSize: number;
	noteTitleOpacity: number;
	labelOutline: boolean;
	labelOutlineWidth: number;
}

export const DEFAULT_SETTINGS: ChorographiaSettings = {
	embeddingProvider: "ollama",
	ollamaUrl: "http://localhost:11434",
	ollamaEmbedModel: "qwen3-embedding",
	ollamaEmbedBatchSize: DEFAULT_EMBED_BATCH_SIZE,
	ollamaLlmModel: "qwen3:8b",
	llmProvider: "ollama",
	openaiApiKey: "",
	embeddingModel: "text-embedding-3-large",
	openaiEmbedBatchSize: DEFAULT_EMBED_BATCH_SIZE,
	openrouterApiKey: "",
	openrouterEmbedModel: "openai/text-embedding-3-small",
	openrouterEmbedBatchSize: DEFAULT_EMBED_BATCH_SIZE,
	openrouterLlmModel: "google/gemini-2.0-flash-001",
	includeGlobs: "**/*.md",
	excludeGlobs: "templates/**",
	maxNotes: 2000,
	showLinks: false,
	colorMode: "semantic",
	showExplorerDots: true,
	minimapCorner: "bottom-left",
	showZones: false,
	zoneGranularity: 6,
	enableLLMZoneNaming: false,
	zoneStyle: "starmap",
	worldmapSeaLevel: 0.20,
	worldmapUnity: 0.07,
	worldmapRuggedness: 0.4,
	mapLocked: false,
	showSubZones: true,
	showNoteTitles: true,
	zoneLabelSize: 9,
	zoneLabelOpacity: 0.5,
	noteTitleSize: 5,
	noteTitleOpacity: 1.0,
	labelOutline: true,
	labelOutlineWidth: 2,
};

export class ChorographiaSettingTab extends PluginSettingTab {
	plugin: ChorographiaPlugin;

	constructor(app: App, plugin: ChorographiaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private addEmbedBatchSizeSetting(
		containerEl: HTMLElement,
		description: string,
		getValue: () => number,
		fallback: number,
		setValue: (next: number) => void
	): void {
		let saveTimer: number | null = null;
		const scheduleSave = () => {
			if (saveTimer != null) {
				window.clearTimeout(saveTimer);
			}
			saveTimer = window.setTimeout(() => {
				saveTimer = null;
				void this.plugin.saveSettings();
			}, 200);
		};
		const flushSave = () => {
			if (saveTimer != null) {
				window.clearTimeout(saveTimer);
				saveTimer = null;
			}
			void this.plugin.saveSettings();
		};

		new Setting(containerEl)
			.setName("Batch size")
			.setDesc(description)
			.addText((text) =>
				text
					.setPlaceholder(String(fallback))
					.setValue(String(getValue()))
					.onChange(async (raw) => {
						if (raw.trim() === "") return;
						const parsed = Number(raw);
						if (!Number.isFinite(parsed)) return;
						const current = getValue();
						const normalized = clampEmbedBatchSize(parsed, fallback);
						if (normalized !== current) {
							setValue(normalized);
							scheduleSave();
						}
						const normalizedStr = String(normalized);
						if (text.inputEl.value !== normalizedStr) {
							text.inputEl.value = normalizedStr;
						}
					})
					.then((t) => {
						t.inputEl.type = "number";
						t.inputEl.min = String(EMBED_BATCH_SIZE_MIN);
						t.inputEl.max = String(EMBED_BATCH_SIZE_MAX);
						t.inputEl.step = "1";
						t.inputEl.style.width = "80px";
						t.inputEl.addEventListener("blur", () => {
							t.inputEl.value = String(getValue());
							flushSave();
						});
					})
			);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const needsOllama =
			this.plugin.settings.embeddingProvider === "ollama" ||
			this.plugin.settings.llmProvider === "ollama";
		const needsOpenAI =
			this.plugin.settings.embeddingProvider === "openai" ||
			this.plugin.settings.llmProvider === "openai";
		const needsOpenRouter =
			this.plugin.settings.embeddingProvider === "openrouter" ||
			this.plugin.settings.llmProvider === "openrouter";

		// ======== Providers ========
		if (needsOllama || needsOpenAI || needsOpenRouter) {
			containerEl.createEl("h3", { text: "Providers" });
			containerEl.createEl("p", {
				text: "Connection details for services used by embedding or zone naming below.",
				cls: "setting-item-description",
			});

			if (needsOllama) {
				new Setting(containerEl)
					.setName("Ollama URL")
					.setDesc("Base URL for the local Ollama server.")
					.addText((text) =>
						text
							.setPlaceholder("http://localhost:11434")
							.setValue(this.plugin.settings.ollamaUrl)
							.onChange(async (value) => {
								this.plugin.settings.ollamaUrl = value;
								await this.plugin.saveSettings();
							})
							.then((t) => { t.inputEl.style.width = "250px"; })
					);
			}

			if (needsOpenAI) {
				new Setting(containerEl)
					.setName("OpenAI API key")
					.addText((text) =>
						text
							.setPlaceholder("sk-...")
							.setValue(this.plugin.settings.openaiApiKey)
							.onChange(async (value) => {
								this.plugin.settings.openaiApiKey = value;
								await this.plugin.saveSettings();
							})
							.then((t) => {
								t.inputEl.type = "password";
								t.inputEl.style.width = "300px";
							})
					);
			}

			if (needsOpenRouter) {
				new Setting(containerEl)
					.setName("OpenRouter API key")
					.setDesc("Get one at openrouter.ai/keys.")
					.addText((text) =>
						text
							.setPlaceholder("sk-or-...")
							.setValue(this.plugin.settings.openrouterApiKey)
							.onChange(async (value) => {
								this.plugin.settings.openrouterApiKey = value;
								await this.plugin.saveSettings();
							})
							.then((t) => {
								t.inputEl.type = "password";
								t.inputEl.style.width = "300px";
							})
					);
			}
		}

		// ======== Embedding ========
		containerEl.createEl("h3", { text: "Embedding" });
		containerEl.createEl("p", {
			text: "Choose how note content is converted into vectors for the map layout.",
			cls: "setting-item-description",
		});

		new Setting(containerEl)
			.setName("Provider")
			.addDropdown((dd) =>
				dd
					.addOption("ollama", "Ollama (local)")
					.addOption("openai", "OpenAI")
					.addOption("openrouter", "OpenRouter")
					.setValue(this.plugin.settings.embeddingProvider)
					.onChange(async (value) => {
						this.plugin.settings.embeddingProvider = value as any;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		if (this.plugin.settings.embeddingProvider === "ollama") {
			new Setting(containerEl)
				.setName("Embedding model")
				.setDesc("Ollama model name (e.g. qwen3-embedding).")
				.addText((text) =>
					text
						.setValue(this.plugin.settings.ollamaEmbedModel)
						.onChange(async (value) => {
							this.plugin.settings.ollamaEmbedModel = value;
							await this.plugin.saveSettings();
						})
				);
			this.addEmbedBatchSizeSetting(
				containerEl,
				"Notes per Ollama embedding request (1-100). Lower values are gentler on constrained hardware and rate limits; higher values reduce total API calls.",
				() => this.plugin.settings.ollamaEmbedBatchSize,
				DEFAULT_SETTINGS.ollamaEmbedBatchSize,
				(next) => {
					this.plugin.settings.ollamaEmbedBatchSize = next;
				}
			);
		} else if (this.plugin.settings.embeddingProvider === "openai") {
			new Setting(containerEl)
				.setName("Embedding model")
				.setDesc("OpenAI model name (e.g. text-embedding-3-large).")
				.addText((text) =>
					text
						.setValue(this.plugin.settings.embeddingModel)
						.onChange(async (value) => {
							this.plugin.settings.embeddingModel = value;
							await this.plugin.saveSettings();
						})
				);
			this.addEmbedBatchSizeSetting(
				containerEl,
				"Notes per OpenAI embedding request (1-100). Lower values help with strict rate limits; higher values reduce total API calls.",
				() => this.plugin.settings.openaiEmbedBatchSize,
				DEFAULT_SETTINGS.openaiEmbedBatchSize,
				(next) => {
					this.plugin.settings.openaiEmbedBatchSize = next;
				}
			);
		} else if (this.plugin.settings.embeddingProvider === "openrouter") {
			new Setting(containerEl)
				.setName("Embedding model")
				.setDesc("OpenRouter model ID (e.g. openai/text-embedding-3-small).")
				.addText((text) =>
					text
						.setValue(this.plugin.settings.openrouterEmbedModel)
						.onChange(async (value) => {
							this.plugin.settings.openrouterEmbedModel = value;
							await this.plugin.saveSettings();
						})
				);
			this.addEmbedBatchSizeSetting(
				containerEl,
				"Notes per OpenRouter embedding request (1-100). Lower values improve reliability under tighter limits; higher values reduce total API calls.",
				() => this.plugin.settings.openrouterEmbedBatchSize,
				DEFAULT_SETTINGS.openrouterEmbedBatchSize,
				(next) => {
					this.plugin.settings.openrouterEmbedBatchSize = next;
				}
			);
		}

		new Setting(containerEl)
			.setName("Include globs")
			.setDesc("Comma-separated glob patterns for notes to index.")
			.addText((text) =>
				text
					.setPlaceholder("**/*.md")
					.setValue(this.plugin.settings.includeGlobs)
					.onChange(async (value) => {
						this.plugin.settings.includeGlobs = value;
						await this.plugin.saveSettings();
					})
					.then((t) => {
						t.inputEl.style.width = "400px";
					})
			);

		new Setting(containerEl)
			.setName("Exclude globs")
			.setDesc("Comma-separated glob patterns for notes to skip.")
			.addText((text) =>
				text
					.setPlaceholder("templates/**,daily/**")
					.setValue(this.plugin.settings.excludeGlobs)
					.onChange(async (value) => {
						this.plugin.settings.excludeGlobs = value;
						await this.plugin.saveSettings();
					})
					.then((t) => {
						t.inputEl.style.width = "400px";
					})
			);

		new Setting(containerEl)
			.setName("Max notes")
			.setDesc("Safety cap on number of notes to index.")
			.addText((text) =>
				text
					.setValue(String(this.plugin.settings.maxNotes))
					.onChange(async (value) => {
						const n = parseInt(value, 10);
						if (!isNaN(n) && n > 0) {
							this.plugin.settings.maxNotes = n;
							await this.plugin.saveSettings();
						}
					})
			);

		// ======== Semantic Zones ========
		containerEl.createEl("h3", { text: "Semantic Zones" });
		containerEl.createEl("p", {
			text: "Group nearby notes into labeled regions on the map using k-means clustering.",
			cls: "setting-item-description",
		});

		new Setting(containerEl)
			.setName("Show semantic zones")
			.setDesc("Display thematic cluster regions behind points on the map.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showZones)
					.onChange(async (value) => {
						this.plugin.settings.showZones = value;
						await this.plugin.saveSettings();
						this.display();
						this.plugin.refreshMapViews();
					})
			);

		if (this.plugin.settings.showZones) {
			new Setting(containerEl)
				.setName("Zone granularity")
				.setDesc("Number of zone clusters (3\u201324). Higher = more, smaller zones.")
				.addDropdown((dd) => {
					for (let n = 3; n <= 24; n++)
						dd.addOption(String(n), String(n));
					dd.setValue(String(this.plugin.settings.zoneGranularity));
					dd.onChange(async (value) => {
						this.plugin.settings.zoneGranularity = parseInt(value, 10);
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					});
				});

			new Setting(containerEl)
				.setName("Zone style")
				.setDesc("Star map: overlapping smooth blobs. World map: non-overlapping country shapes with fractal borders.")
				.addDropdown((dd) => {
					dd.addOption("starmap", "Star map");
					dd.addOption("worldmap", "World map");
					dd.setValue(this.plugin.settings.zoneStyle);
					dd.onChange(async (value) => {
						this.plugin.settings.zoneStyle = value as "starmap" | "worldmap";
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
						this.display(); // re-render to show/hide worldmap sliders
					});
				});

			if (this.plugin.settings.zoneStyle === "worldmap") {
				new Setting(containerEl)
					.setName("Land density")
					.setDesc("% of peak height that becomes land. High = sparse thin countries, low = thick flooded land.")
					.addSlider((sl) =>
						sl
							.setLimits(0.05, 0.50, 0.01)
							.setValue(this.plugin.settings.worldmapSeaLevel)
							.setDynamicTooltip()
							.onChange(async (value) => {
								this.plugin.settings.worldmapSeaLevel = value;
								await this.plugin.saveSettings();
								this.plugin.refreshMapViews();
							})
					);

				new Setting(containerEl)
					.setName("Continental unity")
					.setDesc("How far clusters reach to merge. Low = archipelago, high = pangea.")
					.addSlider((sl) =>
						sl
							.setLimits(0.03, 0.12, 0.005)
							.setValue(this.plugin.settings.worldmapUnity)
							.setDynamicTooltip()
							.onChange(async (value) => {
								this.plugin.settings.worldmapUnity = value;
								await this.plugin.saveSettings();
								this.plugin.refreshMapViews();
							})
					);

				new Setting(containerEl)
					.setName("Coast ruggedness")
					.setDesc("Higher = jagged fjords, lower = smooth beaches.")
					.addSlider((sl) =>
						sl
							.setLimits(0.1, 1.0, 0.05)
							.setValue(this.plugin.settings.worldmapRuggedness)
							.setDynamicTooltip()
							.onChange(async (value) => {
								this.plugin.settings.worldmapRuggedness = value;
								await this.plugin.saveSettings();
								this.plugin.refreshMapViews();
							})
					);
			}

			new Setting(containerEl)
				.setName("LLM zone naming")
				.setDesc("Use an LLM to generate evocative names for each zone.")
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.enableLLMZoneNaming)
						.onChange(async (value) => {
							this.plugin.settings.enableLLMZoneNaming = value;
							await this.plugin.saveSettings();
							this.display();
							this.plugin.refreshMapViews();
						})
				);

			if (this.plugin.settings.enableLLMZoneNaming) {
				new Setting(containerEl)
					.setName("Zone naming provider")
					.addDropdown((dd) =>
						dd
							.addOption("ollama", "Ollama (local)")
							.addOption("openai", "OpenAI")
							.addOption("openrouter", "OpenRouter")
							.setValue(this.plugin.settings.llmProvider)
							.onChange(async (value) => {
								this.plugin.settings.llmProvider = value as any;
								await this.plugin.saveSettings();
								this.display();
							})
					);

				if (this.plugin.settings.llmProvider === "ollama") {
					new Setting(containerEl)
						.setName("LLM model")
						.setDesc("Ollama model for zone naming (e.g. qwen3:8b).")
						.addText((text) =>
							text
								.setValue(this.plugin.settings.ollamaLlmModel)
								.onChange(async (value) => {
									this.plugin.settings.ollamaLlmModel = value;
									await this.plugin.saveSettings();
								})
						);
				} else if (this.plugin.settings.llmProvider === "openrouter") {
					new Setting(containerEl)
						.setName("LLM model")
						.setDesc("OpenRouter model ID (e.g. google/gemini-2.0-flash-001).")
						.addText((text) =>
							text
								.setValue(this.plugin.settings.openrouterLlmModel)
								.onChange(async (value) => {
									this.plugin.settings.openrouterLlmModel = value;
									await this.plugin.saveSettings();
								})
						);
				}
			}

			new Setting(containerEl)
				.setName("Lock map")
				.setDesc("Preserve note positions, cluster assignments, and zone names across re-embeds.")
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.mapLocked)
						.onChange(async (value) => {
							this.plugin.settings.mapLocked = value;
							await this.plugin.saveSettings();
							this.plugin.refreshMapViews();
						})
				);
		}

		// ======== Map Display ========
		containerEl.createEl("h3", { text: "Map Display" });
		containerEl.createEl("p", {
			text: "Visual appearance of the map canvas and file explorer integration.",
			cls: "setting-item-description",
		});

		new Setting(containerEl)
			.setName("Color mode")
			.setDesc("How to color points on the map.")
			.addDropdown((dd) =>
				dd
					.addOption("semantic", "Semantic")
					.addOption("folder", "Folder")
					.addOption("type", "Type (frontmatter)")
					.addOption("cat", "Category (frontmatter)")
					.setValue(this.plugin.settings.colorMode)
					.onChange(async (value) => {
						this.plugin.settings.colorMode = value as ColorMode;
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					})
			);

		new Setting(containerEl)
			.setName("Show link overlay")
			.setDesc("Draw wikilink edges between notes on the map.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showLinks)
					.onChange(async (value) => {
						this.plugin.settings.showLinks = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("File explorer dots")
			.setDesc("Show colored semantic circles next to notes in the file explorer.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showExplorerDots)
					.onChange(async (value) => {
						this.plugin.settings.showExplorerDots = value;
						await this.plugin.saveSettings();
						this.plugin.updateExplorerDots();
					})
			);

		new Setting(containerEl)
			.setName("Minimap corner")
			.setDesc("Corner for the global minimap shown in local view.")
			.addDropdown((dd) =>
				dd
					.addOption("off", "Off")
					.addOption("top-left", "Top-left")
					.addOption("top-right", "Top-right")
					.addOption("bottom-left", "Bottom-left")
					.addOption("bottom-right", "Bottom-right")
					.setValue(this.plugin.settings.minimapCorner)
					.onChange(async (value) => {
						this.plugin.settings.minimapCorner = value as MinimapCorner;
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					})
			);

		// ======== Label Appearance ========
		containerEl.createEl("h3", { text: "Label Appearance" });
		containerEl.createEl("p", {
			text: "Control the size, opacity, and contrast of zone and note labels on the map.",
			cls: "setting-item-description",
		});

		new Setting(containerEl)
			.setName("Zone label size")
			.setDesc("Font size for zone name labels (px).")
			.addSlider((sl) =>
				sl
					.setLimits(6, 18, 1)
					.setValue(this.plugin.settings.zoneLabelSize)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.zoneLabelSize = value;
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					})
			);

		new Setting(containerEl)
			.setName("Zone label opacity")
			.setDesc("Opacity of zone name labels.")
			.addSlider((sl) =>
				sl
					.setLimits(0.1, 1.0, 0.05)
					.setValue(this.plugin.settings.zoneLabelOpacity)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.zoneLabelOpacity = value;
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					})
			);

		new Setting(containerEl)
			.setName("Note title size")
			.setDesc("Font size for note title labels (px).")
			.addSlider((sl) =>
				sl
					.setLimits(3, 12, 1)
					.setValue(this.plugin.settings.noteTitleSize)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.noteTitleSize = value;
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					})
			);

		new Setting(containerEl)
			.setName("Note title opacity")
			.setDesc("Opacity of note title labels when zoomed in.")
			.addSlider((sl) =>
				sl
					.setLimits(0.1, 1.0, 0.05)
					.setValue(this.plugin.settings.noteTitleOpacity)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.noteTitleOpacity = value;
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					})
			);

		new Setting(containerEl)
			.setName("Label outline")
			.setDesc("Add a contrasting outline behind labels for readability.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.labelOutline)
					.onChange(async (value) => {
						this.plugin.settings.labelOutline = value;
						await this.plugin.saveSettings();
						this.display();
						this.plugin.refreshMapViews();
					})
			);

		if (this.plugin.settings.labelOutline) {
			new Setting(containerEl)
				.setName("Outline width")
				.setDesc("Thickness of the label outline (px).")
				.addSlider((sl) =>
					sl
						.setLimits(1, 4, 0.5)
						.setValue(this.plugin.settings.labelOutlineWidth)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.labelOutlineWidth = value;
							await this.plugin.saveSettings();
							this.plugin.refreshMapViews();
						})
				);
		}

		// ======== Actions ========
		containerEl.createEl("h3", { text: "Actions" });

		new Setting(containerEl)
			.setName("Re-embed changed notes")
			.setDesc("Index notes and compute embeddings for new/changed notes.")
				.addButton((btn) =>
					btn.setButtonText("Run").onClick(async () => {
						btn.setDisabled(true);
						btn.setButtonText("Running...");
						try {
							await this.plugin.runEmbedPipeline();
						} catch (e: any) {
							new Notice("Chorographia: " + e.message);
						}
						btn.setDisabled(false);
					btn.setButtonText("Run");
				})
			);

		new Setting(containerEl)
			.setName("Recompute layout")
			.setDesc("Run UMAP on cached embeddings to produce a new 2D layout.")
			.addButton((btn) =>
				btn.setButtonText("Run").onClick(async () => {
					btn.setDisabled(true);
					btn.setButtonText("Running...");
					try {
						await this.plugin.runLayoutCompute();
						new Notice("Chorographia: Layout complete.");
					} catch (e: any) {
						new Notice("Chorographia: " + e.message);
					}
					btn.setDisabled(false);
					btn.setButtonText("Run");
				})
			);

		if (this.plugin.settings.enableLLMZoneNaming) {
			new Setting(containerEl)
				.setName("Re-run zone naming")
				.setDesc("Regenerate LLM names for all zones and sub-zones.")
				.addButton((btn) =>
					btn.setButtonText("Run").onClick(async () => {
						if (this.plugin.settings.mapLocked) {
							if (!confirm("Map is locked. This will regenerate all zone names. Continue?")) return;
						}
						btn.setDisabled(true);
						btn.setButtonText("Running...");
						try {
							await this.plugin.runZoneNaming();
							new Notice("Chorographia: Zone naming complete.");
						} catch (e: any) {
							new Notice("Chorographia: " + e.message);
						}
						btn.setDisabled(false);
						btn.setButtonText("Run");
					})
				);
		}

		new Setting(containerEl)
			.setName("Clear cache")
			.setDesc("Delete all cached embeddings and layout data.")
			.addButton((btn) =>
				btn
					.setButtonText("Clear")
					.setWarning()
					.onClick(async () => {
						const locked = this.plugin.settings.mapLocked;
						const msg = locked
							? "Map is locked. Clearing cache will erase all positions, zone data, and locked names. Continue?"
							: "This will erase all cached embeddings, positions, and zone data. You will need to re-embed to rebuild the map. Continue?";
						if (!confirm(msg)) return;
						this.plugin.cache = { notes: {} };
						if (locked) {
							this.plugin.settings.mapLocked = false;
							await this.plugin.saveSettings();
						}
						await this.plugin.saveCache();
						new Notice("Chorographia: Cache cleared.");
						this.display();
					})
			);
	}
}
