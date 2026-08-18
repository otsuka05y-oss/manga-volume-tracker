import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

// For Server Components / pages: redirects to /login when unauthenticated.
export const verifySession = cache(async () => {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await decrypt(cookie);

  if (!session?.authenticated) {
    redirect("/login");
  }

  return { isAuth: true as const };
});

// For Route Handlers: returns a boolean instead of redirecting, so callers
// can return a JSON 401 response.
export const isAuthenticated = cache(async () => {
  const cookie = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await decrypt(cookie);
  return Boolean(session?.authenticated);
});
