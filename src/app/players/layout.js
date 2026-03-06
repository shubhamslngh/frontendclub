"use client";

import Image from "next/image";
import Link from "next/link";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import HomeHeaderActions from "@/components/ui/HomeHeaderActions";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export default function PlayersLayout({ children }) {
  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-[#0B0F1A] text-white`}
      style={{
        "--kk-ember": "#ff7a1a",
        "--kk-field": "#62e09c",
        "--kk-line": "rgba(255, 255, 255, 0.15)",
        "--kk-ink": "#f8fafc",
      }}
    >
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.22),transparent_60%)]" />
        <div className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.12),transparent_65%)] blur-2xl" />
        <div className="absolute left-1/3 top-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(46,204,113,0.16),transparent_65%)] blur-2xl" />
        <div className="absolute right-[-120px] top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_top,rgba(0,180,216,0.10),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.65))]" />
      </div>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F1A]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-black">
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
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-400">
                Player Profiles
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <Link className="hover:text-orange-400" href="/club/players">Players</Link>
            <Link className="hover:text-orange-400" href="/club/teams">Teams</Link>
            <Link className="hover:text-orange-400" href="/club/matches">Matches</Link>
            <Link className="hover:text-orange-400" href="/club/media">Media</Link>
          </nav>
          <HomeHeaderActions />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-white/10 bg-[#0B0F1A] py-10">
        <div className="mx-auto w-full max-w-5xl px-6 text-sm text-white/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} KK Cricket Club. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/" className="hover:text-orange-400">Home</Link>
              <Link href="/club/players" className="hover:text-orange-400">Players</Link>
              <Link href="/club/teams" className="hover:text-orange-400">Teams</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
