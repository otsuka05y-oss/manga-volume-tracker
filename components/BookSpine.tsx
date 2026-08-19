"use client";

import type { Series } from "@/lib/supabase/types";
import { SPINE_CREAM_COLOR } from "@/lib/constants";

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
  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${series.title}、所有${series.owned_volume}巻`}
      className={`relative snap-center shrink-0 w-24 h-56 rounded-sm flex flex-col items-center justify-between py-3 transition-all duration-200 ${
        active ? "scale-105 shadow-lg z-10" : "opacity-80 scale-95 shadow"
      }`}
      style={{
        backgroundColor: SPINE_CREAM_COLOR,
        color: "#1c1512",
        boxShadow: active ? `0 0 0 3px ${series.spine_color}` : undefined,
      }}
    >
      {series.is_completed ? (
        <span
          className="absolute top-1 left-1 rounded-sm px-1 text-[9px] font-bold text-white"
          style={{ backgroundColor: series.spine_color }}
        >
          完
        </span>
      ) : (
        stale && (
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-black/20"
            aria-hidden
          />
        )
      )}
      <span
        className="text-base font-extrabold"
        style={{ color: series.spine_color }}
      >
        {series.owned_volume}
      </span>
      <span className="vertical-text flex-1 flex items-center justify-center text-sm font-bold leading-tight px-1">
        {clampTitle(series.title)}
      </span>
      {series.author && (
        <span className="vertical-text text-[10px] text-black/60 max-h-10 overflow-hidden">
          {series.author}
        </span>
      )}
    </button>
  );
}
