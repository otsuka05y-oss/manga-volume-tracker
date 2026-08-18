import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "サーバーにAPP_PASSWORDが設定されていません" },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || password !== appPassword) {
    return NextResponse.json(
      { error: "パスワードが違います" },
      { status: 401 }
    );
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
