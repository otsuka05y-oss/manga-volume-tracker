"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Series } from "@/lib/supabase/types";
import { SearchBar } from "@/components/SearchBar";
import { SeriesCard } from "@/components/SeriesCard";
import { daysSince } from "@/lib/date";
import { STALE_THRESHOLD_DAYS } from "@/lib/constants";

export function SeriesList({ initialSeries }: { initialSeries: Series[] }) {
  const [series, setSeries] = useState(initialSeries);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? series.filter((s) => s.title.toLowerCase().includes(q))
      : series;

    return [...list].sort((a, b) => {
      const aStale = daysSince(a.last_updated_at) >= STALE_THRESHOLD_DAYS;
      const bStale = daysSince(b.last_updated_at) >= STALE_THRESHOLD_DAYS;
      if (aStale !== bStale) return aStale ? -1 : 1;
      return a.title.localeCompare(b.title, "ja");
    });
  }, [series, query]);

  async function handleIncrement(id: string) {
    const target = series.find((s) => s.id === id);
    if (!target) return;

    const res = await fetch(`/api/series/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owned_volume: target.owned_volume + 1 }),
    });
    if (!res.ok) return;
    const { series: updated } = await res.json();
    setSeries((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SearchBar value={query} onChange={setQuery} />
        <Link
          href="/series/new"
          className="shrink-0 rounded-md bg-foreground text-background px-4 py-2 font-medium"
        >
          追加
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="opacity-60 text-sm py-8 text-center">
          {series.length === 0
            ? "まだ作品が登録されていません"
            : "該当する作品がありません"}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <SeriesCard key={s.id} series={s} onIncrement={handleIncrement} />
          ))}
        </div>
      )}
    </div>
  );
}
