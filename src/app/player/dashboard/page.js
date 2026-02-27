"use client";

import Image from "next/image";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import HomeHeaderActions from "@/components/ui/HomeHeaderActions";
import PlayerHome from "@/components/ui/PlayerHome";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function PlayerDashboardPage() {
  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-(--kk-sand) text-(--kk-ink)`}
      style={{
        "--kk-sand": "#f7f3e8",
        "--kk-ink": "#1f241a",
        "--kk-ember": "#d66b2d",
        "--kk-field": "#2f6b3f",
        "--kk-cream": "#fff7e8",
        "--kk-line": "#e4d8c4",
      }}
    >
      <header className="sticky top-0 z-20 border-b border-(--kk-line) bg-(--kk-sand)/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-900">
              <Image
                src="/KK11-logo.webp"
                alt="KK Cricket Club"
                width={62}
                height={62}
                className="object-cover"
                priority
              />
            </span>
            <div>
              <p className={`text-2xl uppercase tracking-[0.2em] ${displayFont.className}`}>
                KK11 Cricket Club
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-(--kk-field)">
                Fueling Passion, Building Champions
              </p>
            </div>
          </div>
          <HomeHeaderActions />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <PlayerHome />
      </main>
    </div>
  );
}
