// ---------- Theme system ----------

export interface ThemeColors {
	panelBg: string;
	panelBorder: string;
	text: string;
	textMuted: string;
	linkStroke: string;
}

export interface MapThemePalette {
	semantic: string[];
	folder: string[];
	type: Record<string, string>;
	semSplit: Record<number, number>;
}

export interface MapThemeBackground {
	dark: { container: string; ocean: string };
	light: { container: string; ocean: string };
}

export interface MapThemeFonts {
	zoneLabel: string;
	zoneLabelWeight: string;
	subZoneLabel: string;
	noteTitle: string;
	continentLabel: string;
	continentLabelWeight: string;
}

export interface MapThemeBorders {
	coast: { dark: string; light: string };
	coastWidth: number;
	coastGlow: number;
	border: { dark: string; light: string };
	borderWidth: number;
	province: { dark: string; light: string };
	provinceWidth: number;
	provinceDash: number[];
}

export interface DecorativeConfig {
	compassRose: boolean;
	compassCorner: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	compassStyle: "modern" | "cartographic";
	gridLines: boolean;
	gridStyle: "subtle" | "cartographic";
	gridColor: { dark: string; light: string };
	gridOpacity: number;
	gridSpacing: number;
	inkWobble: boolean;
	inkWobbleAmplitude: number;
	stippleOcean: boolean;
	stippleDensity: number;
	coastHatch: boolean;
	neatline: boolean;
	routeNetwork: boolean;
}

export interface NoteRenderStyle {
	shape: "dot" | "terrain";
	dotGlow: boolean;
	selectionRing: string;
	highlightEdge: string;
}

export interface MapTheme {
	id: string;
	name: string;
	readonly: boolean;
	palette: MapThemePalette;
	background: MapThemeBackground;
	fonts: MapThemeFonts;
	ui: { dark: ThemeColors; light: ThemeColors };
	borders: MapThemeBorders;
	decorative: DecorativeConfig;
	noteStyle: NoteRenderStyle;
}

// ---------- Default theme (extracts current hardcoded values) ----------

export const DEFAULT_THEME: MapTheme = {
	id: "default",
	name: "Default",
	readonly: true,
	palette: {
		semantic: [
			"#00D6FF", "#B9FF00", "#FF7A00", "#A855F7",
			"#00FFB3", "#FF3DB8", "#00FFA3", "#FFD400",
			"#00F5D4", "#FF9A3D", "#7CFFCB", "#B8C0FF",
		],
		folder: [
			"#8E9AAF", "#C9963B", "#B28DFF", "#5AC6CE", "#B8541A",
			"#9AB2AF", "#BCDC2B", "#FF7A00", "#A855F7", "#00D6FF",
			"#00FFB3", "#FF3DB8",
		],
		type: {
			SRC: "#8E9AAF", LIT: "#C9963B", SEED: "#B8541A",
			EVE: "#B28DFF", REV: "#9AB2AF", NOTE: "#5AC6CE",
		},
		semSplit: { 1: 0.80, 2: 0.65, 3: 0.50, 4: 0.35, 5: 0.20 },
	},
	background: {
		dark: {
			container: "linear-gradient(135deg, #07070f 0%, #0f0f1a 50%, #1a1a2e 100%)",
			ocean: "#0a0e1a",
		},
		light: {
			container: "linear-gradient(135deg, #e8e8f0 0%, #f0f0f8 50%, #f8f8ff 100%)",
			ocean: "#e8eef5",
		},
	},
	fonts: {
		zoneLabel: "var(--font-interface)",
		zoneLabelWeight: "600",
		subZoneLabel: "var(--font-interface)",
		noteTitle: "var(--font-interface)",
		continentLabel: "var(--font-interface)",
		continentLabelWeight: "bold",
	},
	ui: {
		dark: {
			panelBg: "rgba(15,15,26,0.92)",
			panelBorder: "rgba(44,44,58,0.6)",
			text: "#D6D6E0",
			textMuted: "#8E9AAF",
			linkStroke: "rgba(214,214,224,0.18)",
		},
		light: {
			panelBg: "rgba(255,255,255,0.92)",
			panelBorder: "rgba(160,160,180,0.4)",
			text: "#1e1e2e",
			textMuted: "#6e6e80",
			linkStroke: "rgba(60,60,80,0.22)",
		},
	},
	borders: {
		coast: { dark: "rgba(200,220,255,0.35)", light: "rgba(40,60,100,0.35)" },
		coastWidth: 2,
		coastGlow: 10,
		border: { dark: "rgba(200,220,255,0.2)", light: "rgba(40,60,100,0.2)" },
		borderWidth: 1,
		province: { dark: "rgba(200,220,255,0.2)", light: "rgba(40,60,100,0.2)" },
		provinceWidth: 0.8,
		provinceDash: [3, 4],
	},
	decorative: {
		compassRose: false,
		compassCorner: "bottom-right",
		compassStyle: "modern",
		gridLines: false,
		gridStyle: "subtle",
		gridColor: { dark: "rgba(200,220,255,0.08)", light: "rgba(40,60,100,0.08)" },
		gridOpacity: 0.3,
		gridSpacing: 0.25,
		inkWobble: false,
		inkWobbleAmplitude: 0,
		stippleOcean: false,
		stippleDensity: 0,
		coastHatch: false,
		neatline: false,
		routeNetwork: false,
	},
	noteStyle: {
		shape: "dot",
		dotGlow: true,
		selectionRing: "#C9963B",
		highlightEdge: "#BCDC2B",
	},
};

// ---------- 17th-Century Cartography theme ----------

export const CARTOGRAPHY_THEME: MapTheme = {
	id: "cartography-17c",
	name: "17th-Century Cartography",
	readonly: true,
	palette: {
		// Sepia/brown monochrome — like ink on parchment
		semantic: [
			"#5C4833", "#4A3C2A", "#6B5540", "#3D3028",
			"#7A6350", "#524335", "#695343", "#4F4030",
			"#635040", "#584838", "#6E5A48", "#4D3E30",
		],
		folder: [
			"#5C4833", "#4A3C2A", "#6B5540", "#3D3028", "#7A6350",
			"#524335", "#695343", "#4F4030", "#635040", "#584838",
			"#6E5A48", "#4D3E30",
		],
		type: {
			SRC: "#5C4833", LIT: "#4A3C2A", SEED: "#6B5540",
			EVE: "#3D3028", REV: "#524335", NOTE: "#7A6350",
		},
		semSplit: { 1: 0.80, 2: 0.65, 3: 0.50, 4: 0.35, 5: 0.20 },
	},
	background: {
		dark: {
			container: "linear-gradient(135deg, #1a150e 0%, #2a1f14 50%, #1e1810 100%)",
			ocean: "#1a2030",
		},
		light: {
			container: "linear-gradient(135deg, #f5e6c8 0%, #ede0c0 50%, #e8d5b0 100%)",
			ocean: "#c8d8e8",
		},
	},
	fonts: {
		zoneLabel: "'Garamond', 'EB Garamond', 'Cormorant Garamond', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
		zoneLabelWeight: "italic",
		subZoneLabel: "'Garamond', 'EB Garamond', 'Cormorant Garamond', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
		noteTitle: "'Garamond', 'EB Garamond', 'Cormorant Garamond', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
		continentLabel: "'Garamond', 'EB Garamond', 'Cormorant Garamond', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
		continentLabelWeight: "italic bold",
	},
	ui: {
		dark: {
			panelBg: "rgba(26,21,14,0.94)",
			panelBorder: "rgba(139,115,85,0.4)",
			text: "#D4C5A9",
			textMuted: "#8B7355",
			linkStroke: "rgba(180,160,130,0.55)",
		},
		light: {
			panelBg: "rgba(245,230,200,0.94)",
			panelBorder: "rgba(139,115,85,0.35)",
			text: "#3a2a1a",
			textMuted: "#8B7355",
			linkStroke: "rgba(80,60,40,0.50)",
		},
	},
	borders: {
		coast: { dark: "rgba(180,160,120,0.45)", light: "rgba(100,80,50,0.4)" },
		coastWidth: 2.5,
		coastGlow: 8,
		border: { dark: "rgba(180,160,120,0.25)", light: "rgba(100,80,50,0.25)" },
		borderWidth: 1.2,
		province: { dark: "rgba(180,160,120,0.15)", light: "rgba(100,80,50,0.15)" },
		provinceWidth: 0.6,
		provinceDash: [4, 5],
	},
	decorative: {
		compassRose: true,
		compassCorner: "bottom-right",
		compassStyle: "cartographic",
		gridLines: true,
		gridStyle: "cartographic",
		gridColor: { dark: "rgba(139,115,85,0.12)", light: "rgba(139,115,85,0.08)" },
		gridOpacity: 0.4,
		gridSpacing: 0.2,
		inkWobble: true,
		inkWobbleAmplitude: 1.0,
		stippleOcean: true,
		stippleDensity: 0.0003,
		coastHatch: true,
		neatline: true,
		routeNetwork: true,
	},
	noteStyle: {
		shape: "terrain",
		dotGlow: false,
		selectionRing: "#8B7355",
		highlightEdge: "#A0916B",
	},
};

// ---------- Theme registry ----------

export const BUILTIN_THEMES: MapTheme[] = [DEFAULT_THEME, CARTOGRAPHY_THEME];

export function getThemeById(id: string): MapTheme {
	return BUILTIN_THEMES.find(t => t.id === id) || DEFAULT_THEME;
}
