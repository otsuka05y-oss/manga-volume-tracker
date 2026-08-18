"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RakutenBookItem } from "@/lib/books/rakuten";
import { DEFAULT_SPINE_COLOR } from "@/lib/constants";

export default function NewSeriesPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [ownedVolume, setOwnedVolume] = useState(0);
  const [spineColor, setSpineColor] = useState(DEFAULT_SPINE_COLOR);

  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [results, setResults] = useState<RakutenBookItem[] | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSearch() {
    if (!title.trim()) return;
    setSearching(true);
    setSearchError(null);
    setResults(null);

    const res = await fetch(
      `/api/books/search?keyword=${encodeURIComponent(title.trim())}`
    );
    const data = await res.json();
    setSearching(false);

    if (!res.ok) {
      setSearchError(data.error ?? "検索に失敗しました");
      return;
    }
    setResults(data.items);
  }

  function applyResult(item: RakutenBookItem) {
    if (item.author) setAuthor(item.author);
    if (item.publisherName) setPublisher(item.publisherName);
    setResults(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setSaveError(null);

    const res = await fetch("/api/series", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        author: author.trim() || null,
        publisher: publisher.trim() || null,
        owned_volume: ownedVolume,
        spine_color: spineColor,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setSaveError(data.error ?? "保存に失敗しました");
      return;
    }
    router.push(`/series/${data.series.id}`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">作品を追加</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="title" className="text-sm opacity-80">
            作品名
          </label>
          <div className="flex gap-2">
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="flex-1 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !title.trim()}
              className="shrink-0 rounded-md border border-black/15 dark:border-white/15 px-3 py-2 text-sm disabled:opacity-50"
            >
              {searching ? "検索中…" : "楽天で検索"}
            </button>
          </div>
          <p className="text-xs opacity-50">
            検索すると著者・出版社の入力を補助します(任意)
          </p>
        </div>

        {searchError && <p className="text-sm text-red-500">{searchError}</p>}

        {results && (
          <div className="space-y-2 rounded-md border border-black/10 dark:border-white/10 p-2 max-h-64 overflow-y-auto">
            {results.length === 0 && (
              <p className="text-sm opacity-60 p-2">
                見つかりませんでした。手動で入力してください。
              </p>
            )}
            {results.map((item) => (
              <button
                key={item.isbn || item.title}
                type="button"
                onClick={() => applyResult(item)}
                className="w-full text-left text-sm rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <p className="truncate">{item.title}</p>
                <p className="opacity-60 text-xs">
                  {item.author ?? "著者不明"} ・ {item.publisherName ?? "出版社不明"}
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="author" className="text-sm opacity-80">
            著者(任意)
          </label>
          <input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="publisher" className="text-sm opacity-80">
            出版社(任意)
          </label>
          <input
            id="publisher"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
          />
        </div>

        <div className="flex gap-6">
          <div className="space-y-1">
            <label htmlFor="owned_volume" className="text-sm opacity-80">
              所持している最新巻
            </label>
            <input
              id="owned_volume"
              type="number"
              min={0}
              value={ownedVolume}
              onChange={(e) => setOwnedVolume(Math.max(0, Number(e.target.value) || 0))}
              className="w-24 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="spine_color" className="text-sm opacity-80">
              背表紙の色
            </label>
            <input
              id="spine_color"
              type="color"
              value={spineColor}
              onChange={(e) => setSpineColor(e.target.value)}
              className="h-10 w-16 rounded-md border border-black/15 dark:border-white/15 bg-transparent p-1"
            />
          </div>
        </div>

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="w-full rounded-md bg-foreground text-background py-2 font-medium disabled:opacity-50"
        >
          {saving ? "保存中…" : "追加"}
        </button>
      </form>
    </div>
  );
}
