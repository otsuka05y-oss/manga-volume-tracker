export const TITLE_FONT_OPTIONS = [
  { value: "sans", label: "ゴシック" },
  { value: "serif", label: "明朝" },
  { value: "brush", label: "筆文字" },
  { value: "dot", label: "ドット" },
] as const;

export type TitleFont = (typeof TITLE_FONT_OPTIONS)[number]["value"];

const FONT_VAR_MAP: Record<TitleFont, string> = {
  sans: "var(--font-title-sans)",
  serif: "var(--font-title-serif)",
  brush: "var(--font-title-brush)",
  dot: "var(--font-title-dot)",
};

export const DEFAULT_TITLE_FONT: TitleFont = "sans";

export function isValidTitleFont(value: unknown): value is TitleFont {
  return (
    typeof value === "string" &&
    TITLE_FONT_OPTIONS.some((option) => option.value === value)
  );
}

export function getTitleFontFamily(font: string): string {
  return isValidTitleFont(font) ? FONT_VAR_MAP[font] : FONT_VAR_MAP.sans;
}
