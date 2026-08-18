export function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function isStale(lastUpdatedAt: string, thresholdDays: number): boolean {
  return daysSince(lastUpdatedAt) >= thresholdDays;
}

export function formatRelativeDate(isoDate: string): string {
  const days = daysSince(isoDate);
  if (days <= 0) return "今日";
  if (days === 1) return "1日前";
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}ヶ月前`;
  return `${Math.floor(months / 12)}年前`;
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
