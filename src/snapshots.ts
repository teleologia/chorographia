import type { ChorographiaSettings } from "./settings";
import type { PluginCache } from "./cache";

export interface MapSnapshot {
	version: 1;
	name: string;
	timestamp: number;
	settings: Partial<ChorographiaSettings>;
	cache: PluginCache;
}

const SETTINGS_KEYS: (keyof ChorographiaSettings)[] = [
	"zoneGranularity", "zoneStyle", "colorMode", "activeTheme",
	"worldmapSeaLevel", "worldmapUnity", "worldmapRuggedness",
	"mapLocked", "showZones", "showSubZones",
	"zoneLabelSize", "zoneLabelOpacity", "noteTitleSize", "noteTitleOpacity",
	"labelOutline", "labelOutlineWidth",
];

export function serializeSnapshot(
	name: string,
	settings: ChorographiaSettings,
	cache: PluginCache,
): MapSnapshot {
	const subset: Partial<ChorographiaSettings> = {};
	for (const key of SETTINGS_KEYS) {
		(subset as any)[key] = settings[key];
	}
	return {
		version: 1,
		name,
		timestamp: Date.now(),
		settings: subset,
		cache: JSON.parse(JSON.stringify(cache)),
	};
}

export function deserializeSnapshot(data: unknown): MapSnapshot | null {
	if (!data || typeof data !== "object") return null;
	const obj = data as any;
	if (obj.version !== 1 || !obj.name || !obj.cache || !obj.cache.notes) return null;
	return obj as MapSnapshot;
}
