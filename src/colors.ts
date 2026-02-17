export const SEM_PALETTE = [
	"#00D6FF", "#B9FF00", "#FF7A00", "#A855F7",
	"#00FFB3", "#FF3DB8", "#00FFA3", "#FFD400",
	"#00F5D4", "#FF9A3D", "#7CFFCB", "#B8C0FF",
];

export const FOLDER_COLORS = [
	"#8E9AAF", "#C9963B", "#B28DFF", "#5AC6CE", "#B8541A",
	"#9AB2AF", "#BCDC2B", "#FF7A00", "#A855F7", "#00D6FF",
	"#00FFB3", "#FF3DB8",
];

export const SEM_SPLIT: Record<number, number> = { 1: 0.80, 2: 0.65, 3: 0.50, 4: 0.35, 5: 0.20 };

export const TYPE_COLORS: Record<string, string> = {
	SRC: "#8E9AAF", LIT: "#C9963B", SEED: "#B8541A",
	EVE: "#B28DFF", REV: "#9AB2AF", NOTE: "#5AC6CE",
};

export function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
	return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function lerpColor(c1: string, c2: string, t: number): string {
	const [r1, g1, b1] = hexToRgb(c1);
	const [r2, g2, b2] = hexToRgb(c2);
	return rgbToHex(
		Math.round(r1 + (r2 - r1) * t),
		Math.round(g1 + (g2 - g1) * t),
		Math.round(b1 + (b2 - b1) * t),
	);
}
