import { requestUrl } from "obsidian";

export async function generateZoneNames(
	clusters: { idx: number; titles: string[] }[],
	apiKey: string,
	model = "gpt-4o-mini"
): Promise<Map<number, string>> {
	const result = new Map<number, string>();
	if (!apiKey || clusters.length === 0) return result;

	// Build prompt with all clusters
	const clusterDescs = clusters.map((c) => {
		const sample = c.titles.slice(0, 15).join(", ");
		return `Cluster ${c.idx}: ${sample}`;
	}).join("\n");

	try {
		const resp = await requestUrl({
			url: "https://api.openai.com/v1/chat/completions",
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
