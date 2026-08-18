"use client";

import Link from "next/link";
import type { Series } from "@/lib/supabase/types";
import { VolumeStepper } from "@/components/VolumeStepper";

export function BookShelfDetailPanel({
  series,
  onVolumeChange,
}: {
  series: Series | null;
  onVolumeChange: (id: string, next: number) => void;
}) {
  if (!series) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-20 border-t border-black/10 dark:border-white/10 bg-background/95 backdrop-blur px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium truncate">{series.title}</p>
          <p className="text-xs opacity-60 truncate">
            {series.author ?? "著者不明"} ・ 所有{series.owned_volume}巻
          </p>
        </div>
        <VolumeStepper
          value={series.owned_volume}
          onChange={(n) => onVolumeChange(series.id, n)}
        />
      </div>
      <div className="max-w-2xl mx-auto mt-1 text-right">
        <Link href={`/series/${series.id}`} className="text-xs opacity-60 underline">
          詳細・発売日設定
        </Link>
      </div>
    </div>
  );
}
