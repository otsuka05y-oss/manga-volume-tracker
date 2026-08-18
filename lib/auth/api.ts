import "server-only";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/dal";

// Returns a 401 response if the caller isn't authenticated, otherwise null.
export async function requireApiAuth() {
  const ok = await isAuthenticated();
  if (!ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
