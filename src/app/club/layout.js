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

export default function ClubLayout({ children }) {
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
      {/* Stadium Glow Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.22),transparent_60%)]" />
        <div className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.12),transparent_65%)] blur-2xl" />
        <div className="absolute left-1/3 top-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(46,204,113,0.16),transparent_65%)] blur-2xl" />
        <div className="absolute right-[-120px] top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_top,rgba(0,180,216,0.10),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.65))]" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0F1A]/80 border-b border-white/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">

          {/* Logo Section */}
          <Link
            href="/"

          >
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full bg-black flex items-center justify-center shadow-lg ring-2 ring-orange-500/40">
             
             <Image
                            src="/KK11.png"
                            alt="KK Cricket Club"
                            width={60}
                            height={60}
                            className="object-cover"
                            priority
                          />
            </div>

            <div>
              <p className={`text-3xl tracking-wide uppercase ${displayFont.className}`}>
                KK11
              </p>
              <p className="text-xs uppercase tracking-[0.4em] text-orange-400">
                Official League
              </p>
            </div>
          </div>
        </Link>


          {/* Navigation */}
          <nav className="hidden items-center gap-8 text-sm uppercase tracking-wider font-medium lg:flex">
            <Link className="hover:text-orange-400 transition" href="/club/players">
              Players
            </Link>
            <Link className="hover:text-orange-400 transition" href="/club/teams">
              Teams
            </Link>
            <Link className="hover:text-orange-400 transition" href="/club/matches">
              Matches
            </Link>
            <Link className="hover:text-orange-400 transition" href="/club/media">
              Media
            </Link>
          </nav>

          <HomeHeaderActions />
        </div>
      </header>

      {/* ===== MAIN ===== */}
      <main className="relative mx-auto w-full max-w-7xl px-6 py-16">
        {children}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 bg-[#0B0F1A] py-12">
        <div className="mx-auto w-full max-w-7xl px-6 text-sm text-white/60">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-lg font-semibold text-white">KK11 Cricket Club</p>
              <p className="text-xs uppercase tracking-widest text-orange-400 mt-1">
                Where Champions Rise
              </p>
            </div>

            <div className="flex flex-wrap gap-6 uppercase tracking-wide">
              <Link href="/club/players" className="hover:text-orange-400 transition">
                Players
              </Link>
              <Link href="/club/teams" className="hover:text-orange-400 transition">
                Teams
              </Link>
              <Link href="/club/matches" className="hover:text-orange-400 transition">
                Matches
              </Link>
              <Link href="/club/media" className="hover:text-orange-400 transition">
                Media
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center text-xs text-white/40">
            © {new Date().getFullYear()} KK11 Cricket Club. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
