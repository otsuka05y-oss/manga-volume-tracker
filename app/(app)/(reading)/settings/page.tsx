"use client";

import { useEffect, useState } from "react";

interface SubscriptionRow {
  id: string;
  user_agent: string | null;
  created_at: string;
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function SettingsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [enabling, setEnabling] = useState(false);
  const [testing, setTesting] = useState(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[] | null>(
    null
  );
  const [loadError, setLoadError] = useState(false);

  async function loadSubscriptions() {
    setLoadError(false);
    const res = await fetch("/api/push");
    if (res.ok) {
      const data = await res.json();
      setSubscriptions(data.subscriptions);
    } else {
      setLoadError(true);
    }
  }

  useEffect(() => {
    // setState only happens after the awaited fetch resolves, not
    // synchronously during this effect, so this doesn't cascade renders.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubscriptions();
  }, []);

  async function handleEnable() {
    setStatus(null);
    setEnabling(true);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("このブラウザは通知に対応していません");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("通知が許可されませんでした");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setStatus("VAPID公開鍵が設定されていません");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        setStatus("購読の登録に失敗しました");
        return;
      }

      setStatus("通知を有効にしました");
      await loadSubscriptions();
    } catch {
      setStatus("通知の設定中にエラーが発生しました");
    } finally {
      setEnabling(false);
    }
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/push/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSubscriptions((prev) => prev?.filter((s) => s.id !== id) ?? null);
    }
  }

  async function handleTest() {
    setTesting(true);
    setStatus(null);
    const res = await fetch("/api/push/test", { method: "POST" });
    const data = await res.json();
    setTesting(false);
    setStatus(
      res.ok
        ? `テスト通知を${data.sent}件の端末に送信しました`
        : (data.error ?? "送信に失敗しました")
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">設定</h1>

      <section className="space-y-3">
        <p className="text-sm opacity-80">
          新刊発売日の通知を受け取るには、この端末で通知を有効にしてください。
        </p>
        <button
          type="button"
          onClick={handleEnable}
          disabled={enabling}
          className="w-full rounded-md bg-foreground text-background py-2 font-medium disabled:opacity-50"
        >
          {enabling ? "設定中…" : "この端末で通知を有効にする"}
        </button>
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="w-full rounded-md border border-black/15 dark:border-white/15 py-2 text-sm disabled:opacity-50"
        >
          {testing ? "送信中…" : "テスト通知を送信"}
        </button>
        {status && <p className="text-sm opacity-80">{status}</p>}
      </section>

      <section className="space-y-2">
        <p className="text-sm opacity-80">登録済みの端末</p>
        {loadError ? (
          <p className="text-sm text-red-500">読み込みに失敗しました</p>
        ) : subscriptions === null ? (
          <p className="text-sm opacity-50">読み込み中…</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-sm opacity-50">登録されている端末はありません</p>
        ) : (
          <ul className="space-y-2">
            {subscriptions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-md border border-black/10 dark:border-white/10 p-3 text-sm"
              >
                <span className="truncate opacity-80">
                  {s.user_agent ?? "不明な端末"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(s.id)}
                  className="shrink-0 text-red-500"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
