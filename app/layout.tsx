import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans_JP,
  Noto_Serif_JP,
  Yuji_Syuku,
  DotGothic16,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Selectable spine-title fonts (see lib/fonts.ts).
const titleSans = Noto_Sans_JP({
  variable: "--font-title-sans",
  subsets: ["latin"],
  weight: ["700", "900"],
});
const titleSerif = Noto_Serif_JP({
  variable: "--font-title-serif",
  subsets: ["latin"],
  weight: ["700", "900"],
});
const titleBrush = Yuji_Syuku({
  variable: "--font-title-brush",
  subsets: ["latin"],
  weight: "400",
});
const titleDot = DotGothic16({
  variable: "--font-title-dot",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "漫画巻数トラッカー",
  description: "所持している漫画の巻数を記録するアプリ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${titleSans.variable} ${titleSerif.variable} ${titleBrush.variable} ${titleDot.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
