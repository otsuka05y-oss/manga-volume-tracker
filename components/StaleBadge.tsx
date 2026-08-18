import { daysSince } from "@/lib/date";
import { STALE_THRESHOLD_DAYS } from "@/lib/constants";

export function StaleBadge({ lastUpdatedAt }: { lastUpdatedAt: string }) {
  const days = daysSince(lastUpdatedAt);
  if (days < STALE_THRESHOLD_DAYS) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-medium px-2 py-0.5">
      更新が{days}日前です
    </span>
  );
}
