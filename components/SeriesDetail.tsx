"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Series } from "@/lib/supabase/types";
import { VolumeStepper } from "@/components/VolumeStepper";
import { formatDate, formatRelativeDate } from "@/lib/date";
import { TITLE_FONT_OPTIONS } from "@/lib/fonts";

export function SeriesDetail({ series: initial }: { series: Series }) {
  const router = useRouter();
  const [series, setSeries] = useState(initial);
  const [spineColor, setSpineColor] = useState(series.spine_color);
  const [titleFont, setTitleFont] = useState(series.title_font);
  const [author, setAuthor] = useState(series.author ?? "");
  const [publisher, setPublisher] = useState(series.publisher ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/series/${series.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const { series: updated } = await res.json();
    setSeries(updated);
    return updated as Series;
  }

  async function handleAuthorPublisherSave() {
    setSaving(true);
    await patch({
      author: author.trim() || null,
      publisher: publisher.trim() || null,
    });
    setSaving(false);
  }

  async function handleToggleCompleted() {
    setSaving(true);
    await patch({ is_completed: !series.is_completed });
    setSaving(false);
  }

  async function handleVolumeChange(next: number) {
    if (next === series.owned_volume) return;
    setSaving(true);
    await patch({ owned_volume: next });
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`「${series.title}」を削除しますか?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/series/${series.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{series.title}</h1>
          {(series.author || series.publisher) && (
            <p className="text-sm opacity-60 mt-1">
              {[series.author, series.publisher].filter(Boolean).join(" ・ ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleToggleCompleted}
          disabled={saving}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border disabled:opacity-50 ${
            series.is_completed
              ? "border-black/15 dark:border-white/15 opacity-70"
              : "border-transparent bg-foreground text-background"
          }`}
        >
          {series.is_completed ? "完結を解除" : "完結済みにする"}
        </button>
      </div>

      <section className="space-y-2">
        <p className="text-sm opacity-80">作者・出版社</p>
        <div className="space-y-2">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="著者(任意)"
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="出版社(任意)"
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAuthorPublisherSave}
            disabled={saving}
            className="rounded-md border border-black/15 dark:border-white/15 px-3 py-2 text-sm disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm opacity-80">タイトル文字の色・フォント</p>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={spineColor}
            onChange={(e) => setSpineColor(e.target.value)}
            className="h-10 w-16 rounded-md border border-black/15 dark:border-white/15 bg-transparent p-1"
          />
          <select
            value={titleFont}
            onChange={(e) => setTitleFont(e.target.value)}
            className="h-10 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2"
          >
            {TITLE_FONT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => patch({ spine_color: spineColor, title_font: titleFont })}
            disabled={saving}
            className="rounded-md border border-black/15 dark:border-white/15 px-3 py-2 text-sm disabled:opacity-50"
          >
            保存
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm opacity-80">所持巻数</p>
        <VolumeStepper value={series.owned_volume} onChange={handleVolumeChange} />
        <p className="text-xs opacity-50">
          最終更新: {formatRelativeDate(series.last_updated_at)} (
          {formatDate(series.last_updated_at)})
        </p>
      </section>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="text-sm text-red-500 disabled:opacity-50"
      >
        この作品を削除
      </button>
    </div>
  );
}
