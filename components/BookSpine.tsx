"use client";

import type { Series } from "@/lib/supabase/types";
import { SPINE_CREAM_COLOR } from "@/lib/constants";

// Keep in sync with the spine width/gap constants in BookShelf.tsx.
export const SPINE_WIDTH = 96;
const MAX_TITLE_CHARS = 7;
const SPINE_TEXT_COLOR = "#1c1512";

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
      className={`relative snap-center shrink-0 w-24 h-56 rounded-sm flex flex-col items-center py-3 transition-all duration-200 ${
        active ? "scale-105 shadow-lg z-10" : "opacity-80 scale-95 shadow"
      }`}
      style={{
        backgroundColor: SPINE_CREAM_COLOR,
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
        className="vertical-text flex-1 flex items-center justify-center text-lg font-extrabold leading-tight px-1 mt-4"
        style={{
          color: series.spine_color,
          WebkitTextStroke: `1.1px ${SPINE_TEXT_COLOR}`,
        }}
      >
        {clampTitle(series.title)}
      </span>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-extrabold" style={{ color: SPINE_TEXT_COLOR }}>
          {series.owned_volume}
        </span>
        {series.author && (
          <span className="vertical-text text-[9px] text-black/60 max-h-8 overflow-hidden">
            {series.author}
          </span>
        )}
        {series.publisher && (
          <span className="text-[8px] text-black/40 truncate max-w-full">
            {series.publisher}
          </span>
        )}
      </div>
    </button>
  );
}
