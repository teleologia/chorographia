import { Vault, TFile } from "obsidian";

export interface IndexedNote {
	path: string;
	title: string;
	folder: string;
	noteType: string;
	cat: string;
	embedText: string;
	sha256: string;
	links: string[]; // resolved vault-relative paths
}

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;

export function matchesGlob(path: string, pattern: string): boolean {
	// Simple glob matching: supports * and **
	const re = pattern
		.replace(/[.+^${}()|[\]\\]/g, "\\$&")
		.replace(/\*\*/g, "§§")
		.replace(/\*/g, "[^/]*")
		.replace(/§§/g, ".*");
	return new RegExp("^" + re + "$").test(path);
}

export async function indexVault(
	vault: Vault,
	globs: string[],
	excludeGlobs: string[],
	maxNotes: number
): Promise<IndexedNote[]> {
	const files = vault.getMarkdownFiles();

	// Build basename → path lookup for wikilink resolution
	const byBasename = new Map<string, string>();
	for (const f of files) {
		const bn = f.basename.toLowerCase();
		byBasename.set(bn, f.path);
	}

	// Filter by include globs, then remove exclude matches
	let matched: TFile[] = [];
	for (const f of files) {
		let included = false;
		for (const g of globs) {
			if (matchesGlob(f.path, g)) { included = true; break; }
		}
		if (!included) continue;
		let excluded = false;
		for (const g of excludeGlobs) {
			if (matchesGlob(f.path, g)) { excluded = true; break; }
		}
		if (!excluded) matched.push(f);
	}

	// Safety cap
	if (matched.length > maxNotes) {
		matched = matched.slice(0, maxNotes);
	}

	// Build set of matched paths for link resolution
	const matchedPaths = new Set(matched.map((f) => f.path));

	const results: IndexedNote[] = [];

	for (const file of matched) {
		const content = await vault.cachedRead(file);
		const fm = parseFrontmatter(content);

		const title = fm.title || file.basename;
		const type = fm.type || "";
		const cat = fm.cat || "";
		const topics = Array.isArray(fm.topics)
			? fm.topics.map(String).join(", ")
			: "";
		const body = stripFrontmatter(content).slice(0, 12000);

		const embedText = [
			title ? `title: ${title}` : null,
			type ? `type: ${type}` : null,
			cat ? `cat: ${cat}` : null,
			topics ? `topics: ${topics}` : null,
			"",
			body,
		]
			.filter((x) => x !== null)
			.join("\n");

		const sha256 = await sha256Hex(embedText);

		// Extract wikilinks
		const links: string[] = [];
		let m: RegExpExecArray | null;
		const linkRe = new RegExp(WIKILINK_RE.source, "g");
		while ((m = linkRe.exec(content)) !== null) {
			const target = m[1].trim().toLowerCase();
			const resolved = byBasename.get(target);
			if (resolved && matchedPaths.has(resolved)) {
				links.push(resolved);
			}
		}

		const folder = file.path.includes("/")
			? file.path.split("/")[0]
			: "";

		results.push({
			path: file.path,
			title,
			folder,
			noteType: type,
			cat,
			embedText,
			sha256,
			links: [...new Set(links)],
		});
	}

	return results;
}

function parseFrontmatter(content: string): Record<string, any> {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return {};
	const block = match[1];
	const result: Record<string, any> = {};
	for (const line of block.split("\n")) {
		const idx = line.indexOf(":");
		if (idx < 0) continue;
		const key = line.slice(0, idx).trim();
		let val: any = line.slice(idx + 1).trim();
		// Handle YAML arrays (simple single-line: [a, b, c])
		if (val.startsWith("[") && val.endsWith("]")) {
			val = val
				.slice(1, -1)
				.split(",")
				.map((s: string) => s.trim().replace(/^['"]|['"]$/g, ""));
		}
		result[key] = val;
	}
	return result;
}

function stripFrontmatter(content: string): string {
	return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

async function sha256Hex(text: string): Promise<string> {
	const data = new TextEncoder().encode(text);
	const hash = await crypto.subtle.digest("SHA-256", data);
	const bytes = new Uint8Array(hash);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
