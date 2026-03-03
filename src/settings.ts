import { App, Modal, PluginSettingTab, Setting, Notice } from "obsidian";
import type ChorographiaPlugin from "./main";
import { BUILTIN_THEMES } from "./theme";
import { OnboardingModal } from "./onboarding";

class ConfirmModal extends Modal {
	private message: string;
	private onConfirm: () => void;

	constructor(app: App, message: string, onConfirm: () => void) {
		super(app);
		this.message = message;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		this.contentEl.createEl("p", { text: this.message });
		new Setting(this.contentEl)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => this.close())
			)
			.addButton((btn) =>
				btn
					.setButtonText("Confirm")
					.setWarning()
					.onClick(() => {
						this.close();
						this.onConfirm();
					})
			);
	}

	onClose() {
		this.contentEl.empty();
	}
}

export type ColorMode = "semantic" | "folder" | "property";

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
	embeddingProvider: "ollama" | "openai" | "openrouter" | "azure-openai";
	ollamaUrl: string;
	ollamaEmbedModel: string;
	ollamaEmbedBatchSize: number;
	ollamaLlmModel: string;
	llmProvider: "ollama" | "openai" | "openrouter" | "azure-openai";
	azureLlmEndpoint: string;
	azureLlmApiKey: string;
	azureLlmModel: string;
	azureEmbeddingEndpoint: string;
	azureEmbeddingApiKey: string;
	azureEmbeddingEmbedBatchSize: number;
	azureEmbeddingModel: string;
	openaiApiKey: string;
	openaiLlmModel: string;
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
	explorerDotOffset: number;
	minimapCorner: MinimapCorner;
	embedFields: string;
	embedIncludeTags: boolean;
	filterIncludeTags: string;
	filterExcludeTags: string;
	filterIncludeFolders: string;
	filterExcludeFolders: string;
	filterRequireProperty: string;
	colorPropertyField: string;
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
	subZoneLabelSize: number;
	subZoneLabelOpacity: number;
	noteTitleSize: number;
	noteTitleOpacity: number;
	labelOutline: boolean;
	labelOutlineWidth: number;
	activeTheme: string;
}

export const DEFAULT_SETTINGS: ChorographiaSettings = {
	embeddingProvider: "ollama",
	ollamaUrl: "http://localhost:11434",
	ollamaEmbedModel: "qwen3-embedding",
	ollamaEmbedBatchSize: DEFAULT_EMBED_BATCH_SIZE,
	ollamaLlmModel: "qwen3:8b",
	llmProvider: "ollama",
	openaiApiKey: "",
	openaiLlmModel: "gpt-5-mini",
	embeddingModel: "text-embedding-3-large",
	openaiEmbedBatchSize: DEFAULT_EMBED_BATCH_SIZE,
	azureLlmEndpoint: "https://<your-azure-openai>.openai.azure.com/openai/responses?api-version=2025-04-01-preview",
	azureLlmApiKey: "",
	azureLlmModel: "gpt-5-mini",
	azureEmbeddingEndpoint: "https://<your-azure-openai>.openai.azure.com/openai/deployments/text-embedding-3-large/embeddings?api-version=2023-05-15",
	azureEmbeddingApiKey: "",
	azureEmbeddingEmbedBatchSize: DEFAULT_EMBED_BATCH_SIZE,
	azureEmbeddingModel: "text-embedding-3-large",
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
	explorerDotOffset: 20,
	minimapCorner: "bottom-left",
	embedFields: "title, type, cat, topics",
	embedIncludeTags: false,
	filterIncludeTags: "",
	filterExcludeTags: "",
	filterIncludeFolders: "",
	filterExcludeFolders: "",
	filterRequireProperty: "",
	colorPropertyField: "type",
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
	subZoneLabelSize: 7,
	subZoneLabelOpacity: 0.4,
	noteTitleSize: 5,
	noteTitleOpacity: 1.0,
	labelOutline: true,
	labelOutlineWidth: 2,
	activeTheme: "default",
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
			if (saveTimer == null) return;
			window.clearTimeout(saveTimer);
			saveTimer = null;
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
						t.inputEl.addClass("chorographia-input-xs");
						t.inputEl.addEventListener("blur", () => {
							t.inputEl.value = String(getValue());
							flushSave();
						});
					})
			);
	}

	private createSection(container: HTMLElement, title: string, desc: string, open = false): HTMLElement {
		const details = container.createEl("details", { cls: "chorographia-settings-section" });
		if (open) details.setAttribute("open", "");
		const summary = details.createEl("summary", { cls: "chorographia-settings-summary", text: title });
		if (desc) {
			details.createEl("p", { text: desc, cls: "setting-item-description chorographia-settings-desc" });
		}
		return details;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.addClass("chorographia-settings");

		// ======== 1. Providers ========
		{
			const sec = this.createSection(containerEl, "Providers", "Connection details for services used by embedding or zone naming.");

			new Setting(sec)
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
						.then((t) => { t.inputEl.addClass("chorographia-input-lg"); })
				);

			new Setting(sec)
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
							t.inputEl.addClass("chorographia-input-xl");
						})
				);

			new Setting(sec)
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
							t.inputEl.addClass("chorographia-input-xl");
						})
				);
		}

		// ======== 2. Embedding Model ========
		{
			const sec = this.createSection(containerEl, "Embedding model", "Choose how note content is converted into vectors for the map layout.");

			new Setting(sec)
				.setName("Provider")
				.addDropdown((dd) =>
					dd
						.addOption("ollama", "Ollama (local)")
						.addOption("openai", "OpenAI")
						.addOption("openrouter", "OpenRouter")
						.addOption("azure-openai", "Azure OpenAI")
						.setValue(this.plugin.settings.embeddingProvider)
						.onChange(async (value) => {
							this.plugin.settings.embeddingProvider = value as ChorographiaSettings["embeddingProvider"];
							await this.plugin.saveSettings();
							this.display();
						})
				);

			if (this.plugin.settings.embeddingProvider === "ollama") {
				new Setting(sec)
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
					sec,
					"Notes per Ollama embedding request (1\u2013100).",
					() => this.plugin.settings.ollamaEmbedBatchSize,
					DEFAULT_SETTINGS.ollamaEmbedBatchSize,
					(next) => { this.plugin.settings.ollamaEmbedBatchSize = next; }
				);
			} else if (this.plugin.settings.embeddingProvider === "openai") {
				new Setting(sec)
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
					sec,
					"Notes per OpenAI embedding request (1\u2013100).",
					() => this.plugin.settings.openaiEmbedBatchSize,
					DEFAULT_SETTINGS.openaiEmbedBatchSize,
					(next) => { this.plugin.settings.openaiEmbedBatchSize = next; }
				);
			} else if (this.plugin.settings.embeddingProvider === "openrouter") {
				new Setting(sec)
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
					sec,
					"Notes per OpenRouter embedding request (1\u2013100).",
					() => this.plugin.settings.openrouterEmbedBatchSize,
					DEFAULT_SETTINGS.openrouterEmbedBatchSize,
					(next) => { this.plugin.settings.openrouterEmbedBatchSize = next; }
				);
			} else if (this.plugin.settings.embeddingProvider === "azure-openai") {
				new Setting(sec)
					.setName("Embedding endpoint")
					.setDesc("Azure OpenAI Endpoint for your Embedding.")
					.addText((text) =>
						text
							.setValue(this.plugin.settings.azureEmbeddingEndpoint)
							.onChange(async (value) => {
								this.plugin.settings.azureEmbeddingEndpoint = value;
								await this.plugin.saveSettings();
							})
					);
				
				new Setting(sec)
					.setName("Embedding model")
					.setDesc("Azure OpenAI model name (e.g. text-embedding-3-large).")
					.addText((text) =>
						text
							.setValue(this.plugin.settings.azureEmbeddingModel)
							.onChange(async (value) => {
								this.plugin.settings.azureEmbeddingModel = value;
								await this.plugin.saveSettings();
							})
					);
				new Setting(sec)
					.setName("Embedding API key")
					.setDesc("Azure OpenAI API Key for the Embedding Endpoint")
					.addText((text) =>
						text
							.setValue(this.plugin.settings.azureEmbeddingApiKey)
							.onChange(async (value) => {
								this.plugin.settings.azureEmbeddingApiKey = value;
								await this.plugin.saveSettings();
							})
					);
				
				this.addEmbedBatchSizeSetting(
					sec,
					"Notes per OpenAI embedding request (1\u2013100).",
					() => this.plugin.settings.azureEmbeddingEmbedBatchSize,
					DEFAULT_SETTINGS.azureEmbeddingEmbedBatchSize,
					(next) => { this.plugin.settings.azureEmbeddingEmbedBatchSize = next; }
				);
			}
		}

		// ======== 3. Note Selection ========
		{
			const sec = this.createSection(containerEl, "Note selection", "Control which notes are included in the map.");

			new Setting(sec)
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
						.then((t) => { t.inputEl.addClass("chorographia-input-xl"); })
				);

			new Setting(sec)
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
						.then((t) => { t.inputEl.addClass("chorographia-input-xl"); })
				);

			new Setting(sec)
				.setName("Include folders")
				.setDesc("Only include notes from these top-level folders (comma-separated). Leave empty for all.")
				.addText((text) =>
					text
						.setPlaceholder("projects, references")
						.setValue(this.plugin.settings.filterIncludeFolders)
						.onChange(async (value) => {
							this.plugin.settings.filterIncludeFolders = value;
							await this.plugin.saveSettings();
						})
						.then((t) => { t.inputEl.addClass("chorographia-input-xl"); })
				);

			new Setting(sec)
				.setName("Exclude folders")
				.setDesc("Skip notes from these top-level folders (comma-separated).")
				.addText((text) =>
					text
						.setPlaceholder("archive, drafts")
						.setValue(this.plugin.settings.filterExcludeFolders)
						.onChange(async (value) => {
							this.plugin.settings.filterExcludeFolders = value;
							await this.plugin.saveSettings();
						})
						.then((t) => { t.inputEl.addClass("chorographia-input-xl"); })
				);

			new Setting(sec)
				.setName("Include tags")
				.setDesc("Only include notes with at least one of these tags (comma-separated). Leave empty for all.")
				.addText((text) =>
					text
						.setPlaceholder("project, evergreen")
						.setValue(this.plugin.settings.filterIncludeTags)
						.onChange(async (value) => {
							this.plugin.settings.filterIncludeTags = value;
							await this.plugin.saveSettings();
						})
						.then((t) => { t.inputEl.addClass("chorographia-input-xl"); })
				);

			new Setting(sec)
				.setName("Exclude tags")
				.setDesc("Skip notes with any of these tags (comma-separated).")
				.addText((text) =>
					text
						.setPlaceholder("draft, private")
						.setValue(this.plugin.settings.filterExcludeTags)
						.onChange(async (value) => {
							this.plugin.settings.filterExcludeTags = value;
							await this.plugin.saveSettings();
						})
						.then((t) => { t.inputEl.addClass("chorographia-input-xl"); })
				);

			new Setting(sec)
				.setName("Require property")
				.setDesc("Only include notes that have this frontmatter property. Use \"key\" or \"key:value\".")
				.addText((text) =>
					text
						.setPlaceholder("status:published")
						.setValue(this.plugin.settings.filterRequireProperty)
						.onChange(async (value) => {
							this.plugin.settings.filterRequireProperty = value;
							await this.plugin.saveSettings();
						})
						.then((t) => { t.inputEl.addClass("chorographia-input-md"); })
				);

			new Setting(sec)
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
						.then((t) => { t.inputEl.addClass("chorographia-input-xs"); })
				);
		}

		// ======== 4. Embedding Content ========
		{
			const sec = this.createSection(containerEl, "Embedding content", "What information from each note is sent to the embedding model.");

			new Setting(sec)
				.setName("Frontmatter fields")
				.setDesc("Comma-separated list of frontmatter fields to include in the embedding text. The note body is always appended.")
				.addText((text) =>
					text
						.setPlaceholder("title, type, cat, topics")
						.setValue(this.plugin.settings.embedFields)
						.onChange(async (value) => {
							this.plugin.settings.embedFields = value;
							await this.plugin.saveSettings();
						})
						.then((t) => { t.inputEl.addClass("chorographia-input-xl"); })
				);

			new Setting(sec)
				.setName("Include tags in embedding")
				.setDesc("Append the note's tags to the embedding text.")
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.embedIncludeTags)
						.onChange(async (value) => {
							this.plugin.settings.embedIncludeTags = value;
							await this.plugin.saveSettings();
						})
				);
		}

		// ======== 5. Semantic Zones ========
		{
			const sec = this.createSection(containerEl, "Semantic zones", "Group nearby notes into labeled regions on the map using k-means clustering.");

			new Setting(sec)
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
				new Setting(sec)
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

				new Setting(sec)
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
							this.display();
						});
					});

				if (this.plugin.settings.zoneStyle === "worldmap") {
					new Setting(sec)
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

					new Setting(sec)
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

					new Setting(sec)
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

				new Setting(sec)
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
					new Setting(sec)
						.setName("Zone naming provider")
						.addDropdown((dd) =>
							dd
								.addOption("ollama", "Ollama (local)")
								.addOption("openai", "OpenAI")
								.addOption("openrouter", "OpenRouter")
								.addOption("azure-openai", "Azure OpenAI")
								.setValue(this.plugin.settings.llmProvider)
								.onChange(async (value) => {
									this.plugin.settings.llmProvider = value as ChorographiaSettings["llmProvider"];
									await this.plugin.saveSettings();
									this.display();
								})
						);

					if (this.plugin.settings.llmProvider === "ollama") {
						new Setting(sec)
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
					} else if (this.plugin.settings.llmProvider === "openai") {
						new Setting(sec)
							.setName("LLM model")
							.setDesc("OpenAI model for zone naming (e.g. gpt-5-mini).")
							.addText((text) =>
								text
									.setValue(this.plugin.settings.openaiLlmModel)
									.onChange(async (value) => {
										this.plugin.settings.openaiLlmModel = value;
										await this.plugin.saveSettings();
									})
							);
					} else if (this.plugin.settings.llmProvider === "openrouter") {
						new Setting(sec)
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
					} else if (this.plugin.settings.llmProvider === "azure-openai") {
						new Setting(sec)
							.setName("LLM endpoint")
							.setDesc("Azure OpenAI Endpoint for your LLM.")
							.addText((text) =>
								text
									.setValue(this.plugin.settings.azureLlmEndpoint)
									.onChange(async (value) => {
										this.plugin.settings.azureLlmEndpoint = value;
										await this.plugin.saveSettings();
									})
							);
						
						new Setting(sec)
							.setName("Azure OpenAI model")
							.setDesc("Azure OpenAI model name (e.g. gpt-5-mini).")
							.addText((text) =>
								text
									.setValue(this.plugin.settings.azureLlmModel)
									.onChange(async (value) => {
										this.plugin.settings.azureLlmModel = value;
										await this.plugin.saveSettings();
									})
							);
						new Setting(sec)
							.setName("Embedding API key")
							.setDesc("Azure OpenAI API Key for the response Endpoint")
							.addText((text) =>
								text
									.setValue(this.plugin.settings.azureLlmApiKey)
									.onChange(async (value) => {
										this.plugin.settings.azureLlmApiKey = value;
										await this.plugin.saveSettings();
									})
							);
					}
				}

				new Setting(sec)
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
		}

		// ======== 6. Map Display ========
		{
			const sec = this.createSection(containerEl, "Map display", "Visual appearance of the map canvas and file explorer integration.", true);

			new Setting(sec)
				.setName("Theme")
				.setDesc("Visual theme for palette, fonts, and decorative elements.")
				.addDropdown((dd) => {
					for (const t of BUILTIN_THEMES) dd.addOption(t.id, t.name);
					dd.setValue(this.plugin.settings.activeTheme);
					dd.onChange(async (value) => {
						this.plugin.settings.activeTheme = value;
						await this.plugin.saveSettings();
						this.plugin.refreshMapViews();
					});
				});

			new Setting(sec)
				.setName("Color mode")
				.setDesc("How to color points on the map.")
				.addDropdown((dd) =>
					dd
						.addOption("semantic", "Semantic")
						.addOption("folder", "Folder")
						.addOption("property", "Property")
						.setValue(this.plugin.settings.colorMode)
						.onChange(async (value) => {
							this.plugin.settings.colorMode = value as ColorMode;
							await this.plugin.saveSettings();
							this.display();
							this.plugin.refreshMapViews();
						})
				);

			if (this.plugin.settings.colorMode === "property") {
				new Setting(sec)
					.setName("Color property field")
					.setDesc("Frontmatter field to use for property-based coloring.")
					.addText((text) =>
						text
							.setPlaceholder("type")
							.setValue(this.plugin.settings.colorPropertyField)
							.onChange(async (value) => {
								this.plugin.settings.colorPropertyField = value;
								await this.plugin.saveSettings();
								this.plugin.refreshMapViews();
								this.plugin.updateExplorerDots();
							})
							.then((t) => { t.inputEl.addClass("chorographia-input-sm"); })
					);
			}

			new Setting(sec)
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

			new Setting(sec)
				.setName("File explorer dots")
				.setDesc("Show colored circles next to notes in the file explorer.")
				.addToggle((toggle) =>
					toggle
						.setValue(this.plugin.settings.showExplorerDots)
						.onChange(async (value) => {
							this.plugin.settings.showExplorerDots = value;
							await this.plugin.saveSettings();
							this.plugin.updateExplorerDots();
							this.display();
						})
				);

			if (this.plugin.settings.showExplorerDots) {
				new Setting(sec)
					.setName("Dot offset")
					.setDesc("Left offset in pixels for the explorer dot (adjust if you have other badges).")
					.addSlider((sl) =>
						sl
							.setLimits(0, 200, 1)
							.setValue(this.plugin.settings.explorerDotOffset)
							.setDynamicTooltip()
							.onChange(async (value) => {
								this.plugin.settings.explorerDotOffset = value;
								await this.plugin.saveSettings();
								this.plugin.updateExplorerDots();
							})
					);
			}

			new Setting(sec)
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
		}

		// ======== 7. Label Appearance ========
		{
			const sec = this.createSection(containerEl, "Label appearance", "Control the size, opacity, and contrast of zone and note labels on the map.");

			new Setting(sec)
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

			new Setting(sec)
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

			new Setting(sec)
				.setName("Sub-zone label size")
				.setDesc("Font size for sub-zone (province) labels (px).")
				.addSlider((sl) =>
					sl
						.setLimits(4, 14, 1)
						.setValue(this.plugin.settings.subZoneLabelSize)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.subZoneLabelSize = value;
							await this.plugin.saveSettings();
							this.plugin.refreshMapViews();
						})
				);

			new Setting(sec)
				.setName("Sub-zone label opacity")
				.setDesc("Opacity of sub-zone (province) labels.")
				.addSlider((sl) =>
					sl
						.setLimits(0.1, 1.0, 0.05)
						.setValue(this.plugin.settings.subZoneLabelOpacity)
						.setDynamicTooltip()
						.onChange(async (value) => {
							this.plugin.settings.subZoneLabelOpacity = value;
							await this.plugin.saveSettings();
							this.plugin.refreshMapViews();
						})
				);

			new Setting(sec)
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

			new Setting(sec)
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

			new Setting(sec)
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
				new Setting(sec)
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
		}

		// ======== 8. Actions ========
		{
			const sec = this.createSection(containerEl, "Actions", "Run pipeline steps or clear data.", true);

			new Setting(sec)
				.setName("Setup wizard")
				.setDesc("Walk through initial configuration.")
				.addButton((btn) =>
					btn.setButtonText("Open").onClick(() => {
						new OnboardingModal(this.app, this.plugin).open();
					})
				);

			new Setting(sec)
				.setName("Re-embed changed notes")
				.setDesc("Index notes and compute embeddings for new/changed notes.")
				.addButton((btn) =>
					btn.setButtonText("Run").onClick(async () => {
						btn.setDisabled(true);
						btn.setButtonText("Running...");
						try {
							await this.plugin.runEmbedPipeline();
						} catch (e: unknown) {
							new Notice("Chorographia: " + (e instanceof Error ? e.message : String(e)));
						}
						btn.setDisabled(false);
						btn.setButtonText("Run");
					})
				);

			new Setting(sec)
				.setName("Recompute layout")
				.setDesc("Run UMAP on cached embeddings to produce a new 2D layout.")
				.addButton((btn) =>
					btn.setButtonText("Run").onClick(async () => {
						btn.setDisabled(true);
						btn.setButtonText("Running...");
						try {
							await this.plugin.runLayoutCompute();
							new Notice("Chorographia: Layout complete.");
						} catch (e: unknown) {
							new Notice("Chorographia: " + (e instanceof Error ? e.message : String(e)));
						}
						btn.setDisabled(false);
						btn.setButtonText("Run");
					})
				);

			if (this.plugin.settings.enableLLMZoneNaming) {
				new Setting(sec)
					.setName("Re-run zone naming")
					.setDesc("Regenerate LLM names for all zones and sub-zones.")
					.addButton((btn) =>
						btn.setButtonText("Run").onClick(() => {
							const runNaming = async () => {
								btn.setDisabled(true);
								btn.setButtonText("Running...");
								try {
									await this.plugin.runZoneNaming();
									new Notice("Chorographia: Zone naming complete.");
								} catch (e: unknown) {
									new Notice("Chorographia: " + (e instanceof Error ? e.message : String(e)));
								}
								btn.setDisabled(false);
								btn.setButtonText("Run");
							};
							if (this.plugin.settings.mapLocked) {
								new ConfirmModal(this.app, "Map is locked. This will regenerate all zone names. Continue?", runNaming).open();
							} else {
								void runNaming();
							}
						})
					);
			}

			new Setting(sec)
				.setName("Clear cache")
				.setDesc("Delete all cached embeddings and layout data.")
				.addButton((btn) =>
					btn
						.setButtonText("Clear")
						.setWarning()
						.onClick(() => {
							const locked = this.plugin.settings.mapLocked;
							const msg = locked
								? "Map is locked. Clearing cache will erase all positions, zone data, and locked names. Continue?"
								: "This will erase all cached embeddings, positions, and zone data. You will need to re-embed to rebuild the map. Continue?";
							new ConfirmModal(this.app, msg, async () => {
								this.plugin.cache = { notes: {} };
								if (locked) {
									this.plugin.settings.mapLocked = false;
									await this.plugin.saveSettings();
								}
								await this.plugin.saveCache();
								new Notice("Chorographia: Cache cleared.");
								this.display();
							}).open();
						})
				);
		}
	}
}
