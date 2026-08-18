import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireApiAuth } from "@/lib/auth/api";
import type { Series } from "@/lib/supabase/types";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Context) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ series: data });
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const update: Partial<Series> = {};

  if (typeof body.title === "string" && body.title.trim()) {
    update.title = body.title.trim();
  }
  if (typeof body.author === "string" || body.author === null) {
    update.author = body.author;
  }
  if (typeof body.publisher === "string" || body.publisher === null) {
    update.publisher = body.publisher;
  }

  if (Number.isFinite(body.owned_volume)) {
    update.owned_volume = Math.max(0, Math.trunc(body.owned_volume));
    update.last_updated_at = new Date().toISOString();
    // A new volume is now owned, so the previously-tracked "next volume"
    // info is stale — clear it so the cron job re-resolves it fresh.
    update.next_volume_number = null;
    update.next_volume_release_date = null;
    update.next_volume_isbn = null;
    update.release_date_source = null;
    update.release_date_checked_at = null;
    update.notified_for_volume = null;
    update.notified_at = null;
  }

  if (
    typeof body.next_volume_release_date === "string" ||
    body.next_volume_release_date === null
  ) {
    update.next_volume_release_date = body.next_volume_release_date;
    update.release_date_source = body.next_volume_release_date
      ? "manual"
      : null;
    update.release_date_checked_at = new Date().toISOString();
    if (Number.isFinite(body.next_volume_number)) {
      update.next_volume_number = Math.trunc(body.next_volume_number);
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "更新項目がありません" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("series")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ series: data });
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("series").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
