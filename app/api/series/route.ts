import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireApiAuth } from "@/lib/auth/api";
import { isValidHexColor } from "@/lib/color";
import { DEFAULT_SPINE_COLOR } from "@/lib/constants";
import { isValidTitleFont, DEFAULT_TITLE_FONT } from "@/lib/fonts";

export async function GET(req: NextRequest) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("series")
    .select("*")
    .order("title", { ascending: true });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ series: data });
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const ownedVolume = Number.isFinite(body.owned_volume)
    ? Math.max(0, Math.trunc(body.owned_volume))
    : 0;
  const spineColor = isValidHexColor(body.spine_color)
    ? body.spine_color
    : DEFAULT_SPINE_COLOR;
  const titleFont = isValidTitleFont(body.title_font)
    ? body.title_font
    : DEFAULT_TITLE_FONT;

  if (!title) {
    return NextResponse.json({ error: "titleは必須です" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("series")
    .insert({
      title,
      author: typeof body.author === "string" ? body.author : null,
      publisher: typeof body.publisher === "string" ? body.publisher : null,
      spine_color: spineColor,
      title_font: titleFont,
      owned_volume: ownedVolume,
      last_updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ series: data }, { status: 201 });
}
