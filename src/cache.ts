export interface NoteCache {
	sha256: string;
	model: string;
	embedding?: string; // base64-encoded Float32Array
	x?: number;
	y?: number;
	title: string;
	folder: string;
	semA?: number; // top-1 cluster index
	semB?: number; // top-2 cluster index
	semW?: number; // weight bucket (1-5): 1=mostly A, 5=mostly B
	noteType?: string; // frontmatter "type" field
	cat?: string; // frontmatter "cat" field
	links: string[]; // wikilink targets (resolved paths)
}

export interface ZoneCacheEntry {
	k: number;
	model: string;
	assignments: Record<string, number>; // path → cluster index
	labels: Record<number, string>; // cluster index → label
	llmEnhanced: boolean;
	centroids?: string[]; // base64-encoded Float32Arrays
	subAssignments?: Record<number, Record<string, number>>; // globalZoneId → {path → subCluster}
	subLabels?: Record<number, Record<number, string>>; // globalZoneId → {subCluster → label}
}

export interface PluginCache {
	notes: Record<string, NoteCache>; // keyed by vault-relative path
	zones?: Record<string, ZoneCacheEntry>; // keyed by `${k}_${model}`
}

export function encodeFloat32(arr: Float32Array): string {
	const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

export function decodeFloat32(b64: string): Float32Array {
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new Float32Array(bytes.buffer);
}
