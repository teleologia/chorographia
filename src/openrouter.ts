import { requestUrl } from "obsidian";
import { encodeFloat32 } from "./cache";
import type { EmbedResult } from "./openai";

const DELAY_MS = 200;

export async function embedTextsOpenRouter(
	texts: { path: string; text: string }[],
	apiKey: string,
	model: string,
	onProgress?: (done: number, total: number) => void,
	batchSize = 50
): Promise<EmbedResult[]> {
	if (!apiKey) throw new Error("OpenRouter API key not set.");
	const step = Math.max(1, Math.floor(batchSize));
	const results: EmbedResult[] = [];
	const skipped: string[] = [];

	for (let i = 0; i < texts.length; i += step) {
		const batch = texts.slice(i, i + step);

		try {
			const batchResults = await embedBatch(batch, apiKey, model);
			results.push(...batchResults);
		} catch (e: any) {
			if (e.status === 400 && batch.length > 1) {
				for (const item of batch) {
					try {
						const single = await embedBatch([item], apiKey, model);
						results.push(...single);
					} catch (e2: any) {
						const msg = e2.message || `HTTP ${e2.status}`;
						console.warn(`Chorographia: Skipping "${item.path}": ${msg}`);
						skipped.push(item.path);
					}
				}
			} else {
				throw e;
			}
		}

		onProgress?.(Math.min(i + step, texts.length), texts.length);

		if (i + step < texts.length) {
			await sleep(DELAY_MS);
		}
	}

	if (skipped.length > 0) {
		console.warn(`Chorographia: Skipped ${skipped.length} notes due to API errors:`, skipped);
	}

	return results;
}

async function embedBatch(
	batch: { path: string; text: string }[],
	apiKey: string,
	model: string
): Promise<EmbedResult[]> {
	const resp = await requestUrl({
		url: "https://openrouter.ai/api/v1/embeddings",
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model,
			input: batch.map((b) => b.text),
		}),
	});

	if (resp.status !== 200) {
		const msg = resp.json?.error?.message || `HTTP ${resp.status}`;
		const err = new Error(`OpenRouter API error: ${msg}`) as any;
		err.status = resp.status;
		throw err;
	}

	const results: EmbedResult[] = [];
	const data = resp.json.data as { embedding: number[]; index: number }[];
	for (const d of data) {
		const arr = new Float32Array(d.embedding);
		results.push({
			path: batch[d.index].path,
			embedding: encodeFloat32(arr),
		});
	}
	return results;
}

export async function generateZoneNamesOpenRouter(
	clusters: { idx: number; titles: string[] }[],
	apiKey: string,
	model: string
): Promise<Map<number, string>> {
	const result = new Map<number, string>();
	if (!apiKey || clusters.length === 0) return result;

	const clusterDescs = clusters.map((c) => {
		const sample = c.titles.slice(0, 15).join(", ");
		return `Cluster ${c.idx}: ${sample}`;
	}).join("\n");

	try {
		const resp = await requestUrl({
			url: "https://openrouter.ai/api/v1/chat/completions",
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model,
				messages: [
					{
						role: "system",
						content: "You are naming regions on a knowledge map. For each cluster of note titles, produce a short evocative name (2-4 words) that captures the thematic essence. Respond with one name per line in the format: CLUSTER_NUM: Name",
					},
					{
						role: "user",
						content: `Name each knowledge region:\n\n${clusterDescs}`,
					},
				],
				temperature: 0.7,
				max_tokens: 300,
			}),
		});

		if (resp.status !== 200) return result;

		const text = resp.json?.choices?.[0]?.message?.content || "";
		for (const line of text.split("\n")) {
			const match = line.match(/(\d+)\s*:\s*(.+)/);
			if (match) {
				const idx = parseInt(match[1], 10);
				const name = match[2].trim();
				if (name) result.set(idx, name);
			}
		}
	} catch {
		// Fall back silently — auto-labels will be used
	}

	return result;
}

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}
