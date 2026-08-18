"use client";

import Link from "next/link";
import type { Series } from "@/lib/supabase/types";
import { StaleBadge } from "@/components/StaleBadge";
import { formatRelativeDate } from "@/lib/date";

export function SeriesCard({
  series,
  onIncrement,
}: {
  series: Series;
  onIncrement: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 dark:border-white/10 p-4">
      <Link href={`/series/${series.id}`} className="min-w-0 flex-1">
        <p className="font-medium truncate">{series.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm opacity-70">
          <span>所有: {series.owned_volume}巻</span>
          <span>・更新: {formatRelativeDate(series.last_updated_at)}</span>
        </div>
        <div className="mt-2">
          <StaleBadge lastUpdatedAt={series.last_updated_at} />
        </div>
      </Link>
      <button
        type="button"
        onClick={() => onIncrement(series.id)}
        className="shrink-0 rounded-full w-10 h-10 flex items-center justify-center border border-black/15 dark:border-white/15 text-lg font-medium hover:bg-black/5 dark:hover:bg-white/10"
        aria-label={`${series.title}を1巻進める`}
      >
        +1
      </button>
    </div>
  );
}
