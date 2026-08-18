import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { searchRakutenBooks } from "@/lib/books/rakuten";
import { sendPush } from "@/lib/push/webpush";
import type { Series } from "@/lib/supabase/types";
import {
  RELEASE_CHECK_BATCH_SIZE,
  NOTIFY_LAG_DAYS,
} from "@/lib/constants";

export const maxDuration = 60;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Pass A: refresh next-volume release dates via the Rakuten API for series
// that have never been checked, or haven't been checked in a while.
async function refreshReleaseDates(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data: candidates, error } = await supabase
    .from("series")
    .select("*")
    .order("release_date_checked_at", { ascending: true, nullsFirst: true })
    .limit(RELEASE_CHECK_BATCH_SIZE);

  if (error) throw new Error(error.message);

  let checked = 0;
  let updated = 0;

  for (const series of candidates ?? []) {
    checked += 1;
    const targetVolume = series.owned_volume + 1;

    try {
      const items = await searchRakutenBooks(series.title);
      const match = items.find((item) => item.volumeNumber === targetVolume);

      if (match?.salesDate) {
        await supabase
          .from("series")
          .update({
            next_volume_number: targetVolume,
            next_volume_release_date: match.salesDate,
            next_volume_isbn: match.isbn || null,
            release_date_source: "api",
            release_date_checked_at: new Date().toISOString(),
          })
          .eq("id", series.id);
        updated += 1;
      } else {
        await supabase
          .from("series")
          .update({ release_date_checked_at: new Date().toISOString() })
          .eq("id", series.id);
      }
    } catch {
      // Leave release_date_checked_at untouched so a transient API failure
      // gets retried on the next run instead of being pushed to the back
      // of the queue.
    }

    // Respect Rakuten's ~1 req/sec fair-use limit.
    await sleep(1100);
  }

  return { checked, updated };
}

// Pass B: send "did you buy it?" pushes for series whose next volume has
// released and hasn't been notified about yet.
async function sendDueNotifications(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - NOTIFY_LAG_DAYS);

  const { data: dueCandidates, error } = await supabase
    .from("series")
    .select("*")
    .not("next_volume_release_date", "is", null)
    .lte("next_volume_release_date", isoDate(today))
    .gte("next_volume_release_date", isoDate(windowStart));

  if (error) throw new Error(error.message);

  const due = (dueCandidates ?? []).filter(
    (s: Series) =>
      s.next_volume_number != null &&
      (s.notified_for_volume == null || s.notified_for_volume < s.next_volume_number)
  );

  if (due.length === 0) {
    return { notified: 0 };
  }

  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");
  if (subError) throw new Error(subError.message);

  let notified = 0;
  const expiredIds = new Set<string>();

  for (const series of due) {
    let anySent = subscriptions?.length ? false : true; // no subscribers = nothing to send, still mark notified

    for (const sub of subscriptions ?? []) {
      if (expiredIds.has(sub.id)) continue;
      const result = await sendPush(sub, {
        title: series.title,
        body: `第${series.next_volume_number}巻、買いましたか?`,
        url: `/series/${series.id}`,
      });
      if (result === "sent") anySent = true;
      if (result === "expired") expiredIds.add(sub.id);
    }

    if (anySent) {
      await supabase
        .from("series")
        .update({
          notified_for_volume: series.next_volume_number,
          notified_at: new Date().toISOString(),
        })
        .eq("id", series.id);
      notified += 1;
    }
  }

  if (expiredIds.size > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", Array.from(expiredIds));
  }

  return { notified };
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  try {
    const refreshResult = await refreshReleaseDates(supabase);
    const notifyResult = await sendDueNotifications(supabase);
    return NextResponse.json({ ...refreshResult, ...notifyResult });
  } catch (err) {
    const message = err instanceof Error ? err.message : "cron failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
