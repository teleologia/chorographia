import { App, Notice } from "obsidian";
import { encodeFloat32 } from "./cache";
import type { EmbedResult } from "./openai";

declare const globalThis: { smart_env?: any };

export async function importSmartConnectionsEmbeddings(
	app: App,
	paths: string[]
): Promise<EmbedResult[]> {
	const results: EmbedResult[] = [];
	const pathSet = new Set(paths);
	const found = new Set<string>();

	// Primary: access via globalThis.smart_env (SC v4 singleton)
	const smartEnv = globalThis.smart_env;
	if (smartEnv?.smart_sources) {
		const sources = smartEnv.smart_sources;
		const items = sources.items || {};

		for (const [key, item] of Object.entries(items)) {
			const source = item as any;
			const sourcePath = source.data?.path || key;
			if (!pathSet.has(sourcePath) || found.has(sourcePath)) continue;
			const vec = source.vec;
			if (!vec || !Array.isArray(vec) || vec.length === 0) continue;
			found.add(sourcePath);
			results.push({
				path: sourcePath,
				embedding: encodeFloat32(new Float32Array(vec)),
			});
		}

		if (results.length > 0) {
			new Notice(`Chorographia: Imported ${results.length} embeddings from Smart Connections.`);
			return results;
		}
	}

	// Fallback: try reading .ajson files directly from disk via adapter
	const adapter = app.vault.adapter;
	const ajsonDir = ".smart-env/multi";

	if (await adapter.exists(ajsonDir)) {
		const listing = await adapter.list(ajsonDir);
		const ajsonFiles = listing.files.filter((f: string) => f.endsWith(".ajson"));

		for (const filePath of ajsonFiles) {
			try {
				const content = await adapter.read(filePath);
				for (const line of content.split("\n")) {
					const trimmed = line.trim();
					if (!trimmed || trimmed === "{" || trimmed === "}") continue;

					// AJSON format: "smart_sources:path/to/file.md": {"vec": [...], ...},
					const colonIdx = trimmed.indexOf(":");
					if (colonIdx < 0) continue;

					// Extract the key — strip quotes and "smart_sources:" prefix
					let keyPart = trimmed.slice(0, colonIdx + trimmed.slice(colonIdx + 1).indexOf(":") + colonIdx + 1);
					// Actually, parse more carefully: find the JSON value part
					const jsonStart = trimmed.indexOf(": {");
					if (jsonStart < 0) continue;

					let rawKey = trimmed.slice(0, jsonStart).trim();
					if (rawKey.startsWith('"')) rawKey = rawKey.slice(1);
					if (rawKey.endsWith('"')) rawKey = rawKey.slice(0, -1);

					// Remove "smart_sources:" or "smart_blocks:" prefix
					const prefixEnd = rawKey.indexOf(":");
					const notePath = prefixEnd >= 0 ? rawKey.slice(prefixEnd + 1) : rawKey;

					// Only want source-level embeddings, not blocks (which contain #)
					if (notePath.includes("#")) continue;
					if (!pathSet.has(notePath) || found.has(notePath)) continue;

					// Parse the JSON value (strip trailing comma)
					let jsonStr = trimmed.slice(jsonStart + 2);
					if (jsonStr.endsWith(",")) jsonStr = jsonStr.slice(0, -1);

					try {
						const data = JSON.parse(jsonStr);
						const vec = data.vec;
						if (!vec || !Array.isArray(vec) || vec.length === 0) continue;
						found.add(notePath);
						results.push({
							path: notePath,
							embedding: encodeFloat32(new Float32Array(vec)),
						});
					} catch {
						// Skip malformed JSON lines
					}
				}
			} catch {
				// Skip unreadable files
			}
		}

		if (results.length > 0) {
			new Notice(`Chorographia: Imported ${results.length} embeddings from Smart Connections files.`);
			return results;
		}
	}

	throw new Error(
		"Smart Connections embeddings not found. " +
		"Make sure Smart Connections is installed, enabled, and has generated embeddings."
	);
}
