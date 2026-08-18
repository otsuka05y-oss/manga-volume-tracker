"use client";

export function VolumeStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-10 h-10 rounded-full border border-black/15 dark:border-white/15 text-lg font-medium hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="1巻減らす"
      >
        −
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(Math.max(0, Math.trunc(n)));
        }}
        className="w-20 text-center rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-2"
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-10 h-10 rounded-full border border-black/15 dark:border-white/15 text-lg font-medium hover:bg-black/5 dark:hover:bg-white/10"
        aria-label="1巻増やす"
      >
        +
      </button>
    </div>
  );
}
