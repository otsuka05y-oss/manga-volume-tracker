"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Series } from "@/lib/supabase/types";
import type { RakutenBookItem } from "@/lib/books/rakuten";
import { VolumeStepper } from "@/components/VolumeStepper";
import { formatDate, formatRelativeDate } from "@/lib/date";

export function SeriesDetail({ series: initial }: { series: Series }) {
  const router = useRouter();
  const [series, setSeries] = useState(initial);
  const [manualDate, setManualDate] = useState(
    series.next_volume_release_date ?? ""
  );

  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
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

  async function handleVolumeChange(next: number) {
    if (next === series.owned_volume) return;
    setSaving(true);
    await patch({ owned_volume: next });
    setManualDate("");
    setSaving(false);
  }

  async function handleManualDateSave() {
    setSaving(true);
    await patch({
      next_volume_release_date: manualDate || null,
      next_volume_number: series.owned_volume + 1,
    });
    setSaving(false);
  }

  async function handleResearch() {
    setSearching(true);
    setSearchMessage(null);

    const res = await fetch(
      `/api/books/search?keyword=${encodeURIComponent(series.title)}`
    );
    const data = await res.json();
    setSearching(false);

    if (!res.ok) {
      setSearchMessage(data.error ?? "検索に失敗しました");
      return;
    }

    const items = data.items as RakutenBookItem[];
    const target = series.owned_volume + 1;
    const match = items.find((item) => item.volumeNumber === target);

    if (!match || !match.salesDate) {
      setSearchMessage(
        `第${target}巻の発売日情報が見つかりませんでした。手動で入力してください。`
      );
      return;
    }

    const updated = await patch({
      next_volume_release_date: match.salesDate,
      next_volume_number: target,
    });
    if (updated) {
      setManualDate(updated.next_volume_release_date ?? "");
      setSearchMessage(`第${target}巻の発売日を設定しました`);
    }
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
      <div>
        <h1 className="text-lg font-semibold">{series.title}</h1>
        {(series.author || series.publisher) && (
          <p className="text-sm opacity-60 mt-1">
            {[series.author, series.publisher].filter(Boolean).join(" ・ ")}
          </p>
        )}
      </div>

      <section className="space-y-2">
        <p className="text-sm opacity-80">所持巻数</p>
        <VolumeStepper value={series.owned_volume} onChange={handleVolumeChange} />
        <p className="text-xs opacity-50">
          最終更新: {formatRelativeDate(series.last_updated_at)} (
          {formatDate(series.last_updated_at)})
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-black/10 dark:border-white/10 p-4">
        <p className="text-sm opacity-80">
          次巻(第{series.owned_volume + 1}巻)の発売日
        </p>

        {series.next_volume_release_date && (
          <p className="text-sm">
            {formatDate(series.next_volume_release_date)}
            <span className="ml-2 text-xs opacity-50">
              ({series.release_date_source === "api" ? "自動取得" : "手動"})
            </span>
          </p>
        )}

        <div className="flex gap-2">
          <input
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            className="flex-1 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleManualDateSave}
            disabled={saving}
            className="shrink-0 rounded-md border border-black/15 dark:border-white/15 px-3 py-2 text-sm disabled:opacity-50"
          >
            保存
          </button>
        </div>

        <button
          type="button"
          onClick={handleResearch}
          disabled={searching}
          className="w-full rounded-md border border-black/15 dark:border-white/15 py-2 text-sm disabled:opacity-50"
        >
          {searching ? "検索中…" : "楽天ブックスで再検索"}
        </button>
        {searchMessage && <p className="text-xs opacity-70">{searchMessage}</p>}
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
