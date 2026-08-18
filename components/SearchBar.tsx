"use client";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="作品名で検索"
      className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2"
    />
  );
}
