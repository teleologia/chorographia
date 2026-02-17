import { requestUrl } from "obsidian";
import { encodeFloat32 } from "./cache";
import type { EmbedResult } from "./openai";

const BATCH_SIZE = 50;

export async function embedTextsOllama(
	texts: { path: string; text: string }[],
	baseUrl: string,
	model: string,
	onProgress?: (done: number, total: number) => void
): Promise<EmbedResult[]> {
	const results: EmbedResult[] = [];

	for (let i = 0; i < texts.length; i += BATCH_SIZE) {
		const batch = texts.slice(i, i + BATCH_SIZE);
		const resp = await requestUrl({
			url: `${baseUrl}/api/embed`,
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model,
				input: batch.map((b) => b.text),
			}),
		});

		if (resp.status !== 200) {
			const msg = resp.json?.error || `HTTP ${resp.status}`;
			throw new Error(`Ollama embed error: ${msg}`);
		}

		const embeddings = resp.json.embeddings as number[][];
		for (let j = 0; j < embeddings.length; j++) {
			const arr = new Float32Array(embeddings[j]);
			results.push({
				path: batch[j].path,
				embedding: encodeFloat32(arr),
			});
		}

		onProgress?.(Math.min(i + BATCH_SIZE, texts.length), texts.length);
	}

	return results;
}

export async function generateZoneNamesOllama(
	clusters: { idx: number; titles: string[] }[],
	baseUrl: string,
	model: string
): Promise<Map<number, string>> {
	const result = new Map<number, string>();
	if (clusters.length === 0) return result;

	const clusterDescs = clusters.map((c) => {
		const sample = c.titles.slice(0, 15).join(", ");
		return `Cluster ${c.idx}: ${sample}`;
	}).join("\n");

	try {
		const resp = await requestUrl({
			url: `${baseUrl}/api/chat`,
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model,
				messages: [
					{
						role: "system",
						content: "You are naming regions on a knowledge map. For each cluster of note titles, produce a short evocative name (2-4 words) that captures the thematic essence. Respond with one name per line in the format: CLUSTER_NUM: Name\n/nothink",
					},
					{
						role: "user",
						content: `Name each knowledge region:\n\n${clusterDescs}`,
					},
				],
				stream: false,
				think: false,
			}),
		});

		if (resp.status !== 200) {
			console.warn("Chorographia: Ollama zone naming returned", resp.status);
			return result;
		}

		let text = resp.json?.message?.content || "";
		// Strip <think>...</think> blocks from reasoning models
		text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

		for (const line of text.split("\n")) {
			const match = line.match(/(\d+)\s*:\s*(.+)/);
			if (match) {
				const idx = parseInt(match[1], 10);
				const name = match[2].trim();
				if (name) result.set(idx, name);
			}
		}
	} catch (e) {
		console.warn("Chorographia: Ollama zone naming failed:", e);
	}

	return result;
}
