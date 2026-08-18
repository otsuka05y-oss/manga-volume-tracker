import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireApiAuth } from "@/lib/auth/api";
import { sendPush } from "@/lib/push/webpush";

export async function POST() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseAdmin();
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json(
      { error: "通知の購読が登録されていません" },
      { status: 400 }
    );
  }

  let sent = 0;
  const expiredIds: string[] = [];

  for (const sub of subscriptions) {
    const result = await sendPush(sub, {
      title: "漫画巻数トラッカー",
      body: "テスト通知です。これが届けば設定は正常です。",
      url: "/settings",
    });
    if (result === "sent") sent += 1;
    if (result === "expired") expiredIds.push(sub.id);
  }

  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  return NextResponse.json({ sent, expired: expiredIds.length });
}
