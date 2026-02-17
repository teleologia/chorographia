import { requestUrl } from "obsidian";
import { encodeFloat32 } from "./cache";

const BATCH_SIZE = 50;
const DELAY_MS = 200;

export interface EmbedResult {
	path: string;
	embedding: string; // base64 Float32Array
}

export async function embedTexts(
	texts: { path: string; text: string }[],
	apiKey: string,
	model: string,
	onProgress?: (done: number, total: number) => void
): Promise<EmbedResult[]> {
	if (!apiKey) throw new Error("OpenAI API key not set.");
	const results: EmbedResult[] = [];
	const skipped: string[] = [];

	for (let i = 0; i < texts.length; i += BATCH_SIZE) {
		const batch = texts.slice(i, i + BATCH_SIZE);

		try {
			const batchResults = await embedBatch(batch, apiKey, model);
			results.push(...batchResults);
		} catch (e: any) {
			if (e.status === 400 && batch.length > 1) {
				// Batch failed — retry individually to isolate the bad note(s)
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

		onProgress?.(Math.min(i + BATCH_SIZE, texts.length), texts.length);

		// Rate-limit delay between batches
		if (i + BATCH_SIZE < texts.length) {
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
		url: "https://api.openai.com/v1/embeddings",
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
		const err = new Error(`OpenAI API error: ${msg}`) as any;
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

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}
