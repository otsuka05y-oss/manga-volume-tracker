import "server-only";

const ENDPOINT =
  "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404";

export interface RakutenBookItem {
  title: string;
  isbn: string;
  salesDate: string | null; // ISO yyyy-mm-dd, best-effort parse
  salesDateRaw: string;
  author: string | null;
  publisherName: string | null;
  volumeNumber: number | null;
}

// Rakuten doesn't return a clean volume-number field, so this is a
// best-effort heuristic over common Japanese manga title conventions.
export function parseVolumeNumber(title: string): number | null {
  const patterns = [/第\s*(\d+)\s*巻/, /\(\s*(\d+)\s*\)/, /vol\.?\s*(\d+)/i];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const n = Number(match[1]);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function parseSalesDate(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const match = raw.match(/(\d{4})年(\d{1,2})月(?:(\d{1,2})日)?/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${(day ?? "01").padStart(2, "0")}`;
}

interface RakutenApiItem {
  title?: string;
  isbn?: string;
  salesDate?: string;
  author?: string;
  publisherName?: string;
}

export async function searchRakutenBooks(
  keyword: string
): Promise<RakutenBookItem[]> {
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) throw new Error("Missing RAKUTEN_APP_ID env var");
  if (!keyword.trim()) return [];

  const url = new URL(ENDPOINT);
  url.searchParams.set("format", "json");
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("applicationId", appId);
  url.searchParams.set("hits", "30");
  url.searchParams.set("sort", "-releaseDate");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Rakuten API error: ${res.status}`);
  }
  const data = (await res.json()) as { Items?: Array<{ Item: RakutenApiItem }> };
  const items = data.Items ?? [];

  return items.map(({ Item }) => ({
    title: Item.title ?? "",
    isbn: Item.isbn ?? "",
    salesDateRaw: Item.salesDate ?? "",
    salesDate: parseSalesDate(Item.salesDate),
    author: Item.author || null,
    publisherName: Item.publisherName || null,
    volumeNumber: parseVolumeNumber(Item.title ?? ""),
  }));
}
