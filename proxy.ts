import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

const publicPaths = ["/login"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/api/cron")) {
    return NextResponse.next();
  }

  const isPublic = publicPaths.includes(path) || path.startsWith("/api/auth");
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decrypt(cookie);
  const authenticated = Boolean(session?.authenticated);

  if (!isPublic && !authenticated) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (path === "/login" && authenticated) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|icon.svg).*)",
  ],
};
