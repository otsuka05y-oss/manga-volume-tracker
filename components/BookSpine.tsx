"use client";

import type { Series } from "@/lib/supabase/types";
import { getContrastTextColor } from "@/lib/color";

// Keep in sync with the spine width/gap constants in BookShelf.tsx.
export const SPINE_WIDTH = 96;
const MAX_TITLE_CHARS = 9;

function clampTitle(title: string) {
  return title.length > MAX_TITLE_CHARS
    ? title.slice(0, MAX_TITLE_CHARS - 1) + "…"
    : title;
}

export function BookSpine({
  series,
  active,
  stale,
  onSelect,
  registerRef,
}: {
  series: Series;
  active: boolean;
  stale: boolean;
  onSelect: () => void;
  registerRef: (el: HTMLButtonElement | null) => void;
}) {
  const textColor = getContrastTextColor(series.spine_color);

  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${series.title}、所有${series.owned_volume}巻`}
      className={`relative snap-center shrink-0 w-24 h-56 rounded-sm border border-black/10 dark:border-white/10 flex flex-col items-center justify-between py-3 transition-all duration-200 ${
        active ? "opacity-100 scale-105 shadow-lg z-10" : "opacity-60 scale-95"
      }`}
      style={{ backgroundColor: series.spine_color, color: textColor }}
    >
      {stale && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-black/20"
          aria-hidden
        />
      )}
      <span className="text-[10px] font-semibold">{series.owned_volume}巻</span>
      <span className="vertical-text flex-1 flex items-center justify-center text-sm font-semibold leading-tight px-1">
        {clampTitle(series.title)}
      </span>
      {series.author && (
        <span className="vertical-text text-[10px] opacity-80 max-h-10 overflow-hidden">
          {series.author}
        </span>
      )}
    </button>
  );
}
