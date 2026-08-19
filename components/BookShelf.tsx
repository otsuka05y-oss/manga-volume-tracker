"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Series } from "@/lib/supabase/types";
import { SearchBar } from "@/components/SearchBar";
import { BookSpine, SPINE_WIDTH } from "@/components/BookSpine";
import { BookShelfDetailPanel } from "@/components/BookShelfDetailPanel";
import { daysSince } from "@/lib/date";
import { STALE_THRESHOLD_DAYS } from "@/lib/constants";

// Keep in sync with the gap applied to the scroll row below.
const SPINE_GAP = 12;

function isSeriesStale(s: Series) {
  return !s.is_completed && daysSince(s.last_updated_at) >= STALE_THRESHOLD_DAYS;
}

export function BookShelf({ initialSeries }: { initialSeries: Series[] }) {
  const [series, setSeries] = useState(initialSeries);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [spacerWidth, setSpacerWidth] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const tickingRef = useRef(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? series.filter((s) => s.title.toLowerCase().includes(q))
      : series;

    return [...list].sort((a, b) => {
      const aStale = isSeriesStale(a);
      const bStale = isSeriesStale(b);
      if (aStale !== bStale) return aStale ? -1 : 1;
      return a.title.localeCompare(b.title, "ja");
    });
  }, [series, query]);

  // Spacers let the first/last spine reach the visual center of the shelf.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const compute = () =>
      setSpacerWidth(Math.max(0, (el.clientWidth - SPINE_WIDTH) / 2 - SPINE_GAP / 2));
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function updateActiveFromScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    let closestId: string | null = null;
    let closestDist = Infinity;
    itemRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      const dist = Math.abs(r.left + r.width / 2 - centerX);
      if (dist < closestDist) {
        closestDist = dist;
        closestId = id;
      }
    });
    if (closestId) setActiveId(closestId);
  }

  function handleScroll() {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      updateActiveFromScroll();
      tickingRef.current = false;
    });
  }

  // Let desktop mouse-wheel users scroll the shelf horizontally too.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el!.scrollLeft += e.deltaY;
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Recenter when the filtered set changes (e.g. the user is typing a search).
  useEffect(() => {
    if (filtered.length === 0) {
      requestAnimationFrame(() => setActiveId(null));
      return;
    }
    const targetId = filtered.some((s) => s.id === activeId)
      ? activeId!
      : filtered[0].id;
    requestAnimationFrame(() => {
      itemRefs.current
        .get(targetId)
        ?.scrollIntoView({ behavior: "auto", inline: "center", block: "nearest" });
      setActiveId(targetId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.map((s) => s.id).join(",")]);

  async function handleVolumeChange(id: string, next: number) {
    const target = series.find((s) => s.id === id);
    if (!target || next === target.owned_volume) return;

    const res = await fetch(`/api/series/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owned_volume: next }),
    });
    if (!res.ok) return;
    const { series: updated } = await res.json();
    setSeries((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  async function handleToggleCompleted(id: string, next: boolean) {
    const res = await fetch(`/api/series/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: next }),
    });
    if (!res.ok) return;
    const { series: updated } = await res.json();
    setSeries((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-4">
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
        <div className="mt-6 shelf-wood">
          <div className="h-2 bg-[#3d2410] shadow-[0_3px_5px_rgba(0,0,0,0.5)]" />
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex items-end overflow-x-auto overscroll-x-contain snap-x snap-mandatory px-2 pt-6 pb-3"
            style={{ gap: SPINE_GAP }}
          >
            <div aria-hidden className="shrink-0" style={{ width: spacerWidth }} />
            {filtered.map((s) => (
              <BookSpine
                key={s.id}
                series={s}
                active={s.id === activeId}
                stale={isSeriesStale(s)}
                onSelect={() =>
                  itemRefs.current
                    .get(s.id)
                    ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
                }
                registerRef={(el) => {
                  if (el) itemRefs.current.set(s.id, el);
                  else itemRefs.current.delete(s.id);
                }}
              />
            ))}
            <div aria-hidden className="shrink-0" style={{ width: spacerWidth }} />
          </div>
          <div
            className="h-5"
            style={{
              background: "linear-gradient(180deg, #7a4f2c 0%, #5a3a20 25%, #432911 100%)",
              boxShadow: "inset 0 4px 6px rgba(0,0,0,0.4), 0 3px 5px rgba(0,0,0,0.35)",
            }}
          />
        </div>
      )}

      <div className="pb-40" />

      <BookShelfDetailPanel
        series={filtered.find((s) => s.id === activeId) ?? null}
        onVolumeChange={handleVolumeChange}
        onToggleCompleted={handleToggleCompleted}
      />
    </div>
  );
}
