"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Series } from "@/lib/supabase/types";
import { SPINE_CREAM_COLOR } from "@/lib/constants";

// Keep in sync with the spine width/gap constants in BookShelf.tsx.
export const SPINE_WIDTH = 96;
const SPINE_TEXT_COLOR = "#1c1512";

const MIN_TITLE_FONT = 8;
const MAX_TITLE_FONT = 20;
// Empirical vertical advance per CJK character (relative to font-size) for
// leading-tight vertical-rl text — tuned so the title always fits in a
// single column instead of wrapping into a second one.
const CHAR_HEIGHT_RATIO = 1.1;

// A left/right gradient over the cream background to fake the rounded,
// three-dimensional look of a book's spine standing on a shelf.
const SPINE_DEPTH_GRADIENT =
  "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, rgba(255,255,255,0.35) 10%, rgba(255,255,255,0.08) 22%, transparent 40%, transparent 78%, rgba(0,0,0,0.16) 100%)";

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
  const titleRef = useRef<HTMLSpanElement | null>(null);
  const [titleFontSize, setTitleFontSize] = useState(MAX_TITLE_FONT);

  // The title's flex-1 area shrinks depending on whether author/publisher
  // are shown below it, so the font size has to be computed from the
  // actual measured height rather than guessed from character count alone.
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const available = el.clientHeight;
    const chars = Math.max(series.title.length, 1);
    const size = Math.min(
      MAX_TITLE_FONT,
      Math.max(MIN_TITLE_FONT, available / (chars * CHAR_HEIGHT_RATIO))
    );
    setTitleFontSize(size);
  }, [series.title, series.author, series.publisher]);

  return (
    <button
      ref={registerRef}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${series.title}、所有${series.owned_volume}巻`}
      className={`relative snap-center shrink-0 w-24 h-80 rounded-sm flex flex-col items-center py-2 transition-all duration-200 ${
        active ? "scale-105 z-10" : "opacity-80 scale-95"
      }`}
      style={{
        backgroundColor: SPINE_CREAM_COLOR,
        backgroundImage: SPINE_DEPTH_GRADIENT,
        boxShadow: active
          ? `0 0 0 3px ${series.spine_color}, 2px 0 4px rgba(0,0,0,0.35), 0 8px 14px -4px rgba(0,0,0,0.25)`
          : "2px 0 4px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.15)",
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

      <div aria-hidden style={{ height: "0.5cm" }} />

      <span
        ref={titleRef}
        className="vertical-text flex-1 flex items-center justify-start overflow-hidden font-extrabold leading-tight px-1"
        style={{
          color: series.spine_color,
          WebkitTextStroke: `1.8px ${SPINE_TEXT_COLOR}`,
          fontSize: `${titleFontSize}px`,
          whiteSpace: "nowrap",
        }}
      >
        {series.title}
      </span>

      <div className="flex flex-col items-center gap-0.5">
        <span
          className="text-2xl font-black tracking-tight"
          style={{ color: SPINE_TEXT_COLOR, WebkitTextStroke: `0.4px ${SPINE_TEXT_COLOR}` }}
        >
          {series.owned_volume}
        </span>
        {series.author && (
          <span
            className="vertical-text text-[10px] font-medium text-black/70 max-h-16 overflow-hidden"
            style={{ whiteSpace: "nowrap" }}
          >
            {series.author}
          </span>
        )}
        {series.publisher && (
          <span className="text-[9px] text-black/45 truncate max-w-full">
            {series.publisher}
          </span>
        )}
      </div>
    </button>
  );
}
