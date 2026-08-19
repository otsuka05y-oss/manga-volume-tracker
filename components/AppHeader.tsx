"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-4 py-3">
      <Link href="/" className="font-semibold">
        漫画巻数トラッカー
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <button type="button" onClick={handleLogout} className="opacity-70">
          ログアウト
        </button>
      </nav>
    </header>
  );
}
