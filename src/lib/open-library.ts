import type { LookupHit } from "./types";

const SEARCH = "https://openlibrary.org/search.json";

function isbnOf(query: string): string | null {
  const compact = query.replace(/[-\s]/g, "");
  if (/^\d{13}$/.test(compact)) return compact;
  if (/^\d{9}[\dXx]$/.test(compact)) return compact.toUpperCase();
  return null;
}

function authorsOf(value: unknown): string {
  if (!Array.isArray(value)) return "Unknown author";
  const names = value
    .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
    .map((name) => name.trim());
  if (names.length === 0) return "Unknown author";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} et al.`;
}

function pickIsbn(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const compact = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/[-\s]/g, "").toUpperCase())
    .filter((item) => /^\d{13}$/.test(item) || /^\d{9}[\dX]$/.test(item));
  return compact.find((item) => item.length === 13) ?? compact[0] ?? null;
}

function hitsFrom(payload: unknown): LookupHit[] {
  const docs = (payload as { docs?: unknown }).docs;
  if (!Array.isArray(docs)) return [];
  const hits: LookupHit[] = [];
  for (const doc of docs) {
    if (!doc || typeof doc !== "object") continue;
    const row = doc as {
      key?: unknown;
      title?: unknown;
      author_name?: unknown;
      isbn?: unknown;
      cover_i?: unknown;
      first_publish_year?: unknown;
    };
    if (typeof row.title !== "string" || !row.title.trim()) continue;
    const cover =
      typeof row.cover_i === "number"
        ? `https://covers.openlibrary.org/b/id/${row.cover_i}-L.jpg`
        : null;
    const year =
      typeof row.first_publish_year === "number" ? row.first_publish_year : null;
    hits.push({
      id: typeof row.key === "string" ? row.key : row.title,
      title: row.title.trim(),
      authors: authorsOf(row.author_name),
      isbn: pickIsbn(row.isbn),
      year,
      coverUrl: cover,
    });
    if (hits.length >= 8) break;
  }
  return hits;
}

async function search(params: URLSearchParams): Promise<LookupHit[]> {
  params.set("limit", "8");
  params.set("fields", "key,title,author_name,isbn,cover_i,first_publish_year");
  const response = await fetch(`${SEARCH}?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "BookLy/1.0 (personal bookshelf)",
    },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Open Library responded with ${response.status}.`);
  }
  return hitsFrom(await response.json());
}

export async function lookupBooks(query: string): Promise<LookupHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const isbn = isbnOf(trimmed);
  if (isbn) {
    const byIsbn = await search(new URLSearchParams({ isbn }));
    if (byIsbn.length > 0) return byIsbn;
  }
  return search(new URLSearchParams({ q: trimmed }));
}
