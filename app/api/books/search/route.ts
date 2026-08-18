import { NextRequest, NextResponse } from "next/server";
import { searchRakutenBooks } from "@/lib/books/rakuten";
import { requireApiAuth } from "@/lib/auth/api";

export async function GET(req: NextRequest) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const keyword = req.nextUrl.searchParams.get("keyword")?.trim();
  if (!keyword) {
    return NextResponse.json({ error: "keywordは必須です" }, { status: 400 });
  }

  try {
    const items = await searchRakutenBooks(keyword);
    return NextResponse.json({ items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "検索に失敗しました";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
