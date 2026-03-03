import { requestUrl, RequestUrlParam, RequestUrlResponse, Notice} from "obsidian";
import { encodeFloat32 } from "./cache";
import type { EmbedResult } from "./openai";

const DELAY_MS = 200;

export async function embedTextsAzureOpenAI(
	texts: { path: string; text: string }[],
	endpoint: string,
	model: string,
	apiKey: string,
	onProgress?: (done: number, total: number) => void,
	batchSize = 50
): Promise<EmbedResult[]> {
	if (!apiKey) throw new Error("OpenAI API key not set.");
	const step = Math.max(1, Math.floor(batchSize));
	const results: EmbedResult[] = [];
	const skipped: string[] = [];

	for (let i = 0; i < texts.length; i += step) {
		const batch = texts.slice(i, i + step);

		try {
			const batchResults = await embedBatchAzureOpenAI(batch, endpoint, model, apiKey);
			results.push(...batchResults);
		} catch (e: unknown) {
			const status = e instanceof Error ? (e as Error & { status?: number }).status : undefined;
			if (status === 400 && batch.length > 1) {
				// Batch failed — retry individually to isolate the bad note(s)
				for (const item of batch) {
					try {
						const single = await embedBatchAzureOpenAI([item], endpoint, model, apiKey);
						results.push(...single);
					} catch (e2: unknown) {
						const msg = e2 instanceof Error ? e2.message : String(e2);
						console.warn(`Chorographia: Skipping "${item.path}": ${msg}`);
						skipped.push(item.path);
					}
				}
			} else {
				throw e;
			}
		}

		onProgress?.(Math.min(i + step, texts.length), texts.length);

		// Rate-limit delay between batches
		if (i + step < texts.length) {
			await sleep(DELAY_MS);
		}
	}

	if (skipped.length > 0) {
		console.warn(`Chorographia: Skipped ${skipped.length} notes due to API errors:`, skipped);
	}

	return results;
}

async function embedBatchAzureOpenAI(
	batch: { path: string; text: string }[],
	endpoint: string,
	model: string,
	apiKey: string,
): Promise<EmbedResult[]> {
	const resp = await fetchWithExponentialBackoff({
		url: endpoint,
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
		const err = Object.assign(new Error(`Azure OpenAI API error: ${msg}`), { status: resp.status });
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

async function fetchWithExponentialBackoff(requestOptions: RequestUrlParam, maxRetries = 5)
: Promise<RequestUrlResponse> {
	const baseDelay = 2000;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const resp = await requestUrl(requestOptions);
			if (resp.status === 429) {
				if (attempt === maxRetries) {
					new Notice("Chorographia: Azure OpenAI Rate limited and max retries reached.");
					throw new Error("Chorographia: Azure OpenAI Rate limited and max retries reached.");
				}
				const retryAfter = resp.headers["retry-after"] || resp.headers["Retry-After"];
				let waitTime = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
				new Notice(`Chorographia: Azure Throttle hit. Retrying in ${Math.round(waitTime / 1000)}s... (Attempt ${attempt + 1} of ${maxRetries})`);
				await sleep(waitTime);
				continue; 
			}
			return resp;

		} catch (error) {
			if (attempt === maxRetries) throw error;
			const waitTime = (baseDelay * Math.pow(2, attempt));
			await sleep(waitTime);
		}
	}
	throw new Error("Chorographia: Azure OpenAI Rate limited and max retries reached.");
}


export async function generateZoneNamesAzureOpenAI(
	clusters: { idx: number; titles: string[] }[],
	endpoint: string,
	model: string,
	apiKey: string
): Promise<Map<number, string>> {
	const result = new Map<number, string>();
	if (!apiKey || clusters.length === 0) return result;

	// Build prompt with all clusters
	const clusterDescs = clusters.map((c) => {
		const sample = c.titles.slice(0, 15).join(", ");
		return `Cluster ${c.idx}: ${sample}`;
	}).join("\n");

	try {
		const resp = await fetchWithExponentialBackoff({
			url: endpoint,
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