"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import { CalendarDays, MapPin, Shield, Trophy } from "lucide-react";
import MediaGallery from "@/components/ui/MediaGallery";
import HomeHeaderActions from "@/components/ui/HomeHeaderActions";
import HomeKpis from "@/components/ui/HomeKpis";
import { clubService } from "@/services/clubService";
import {
  getBallTypeMeta,
  getComputedWinnerName,
  getMatchFormatMeta,
  getMatchResultText,
  getMatchScore,
  getMatchTitle,
  normalizeMatchStatus,
} from "@/lib/matches";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

const services = [
  {
    title: "Nets",
    description:
      "Sharpen your skills with our regular net practice sessions. Open to players of all levels, these sessions focus on batting, bowling, and fielding drills under expert guidance to help you perform at your best on match day.",
  },
  {
    title: "Grounds",
    description:
      "Book our well-maintained cricket ground for matches, tournaments, or practice sessions. Ideal for clubs, corporate events, and friendly games with all essential facilities available.",
  },
  {
    title: "Coaching",
    description:
      "Professional coaching sessions designed to develop technical skills, game strategy, and fitness. Led by experienced coaches, our program caters to all age groups and skill levels, helping players reach their full potential.",
  },
];

const photoSets = [
  { title: "Net Practice", tone: "from-[#f0b35a] to-[#e67f2d]" },
  { title: "Match Day", tone: "from-[#7dc38a] to-[#2f6b3f]" },
  { title: "Club Spirit", tone: "from-[#d97a6a] to-[#a63a2e]" },
  { title: "Grounds", tone: "from-[#7ab6e8] to-[#2a6fa1]" },
  { title: "Coaching", tone: "from-[#98c9b4] to-[#3c7d64]" },
  { title: "Community", tone: "from-[#f2d28c] to-[#c9892b]" },
];

const products = [
  { title: "Bats and Gloves", detail: "Match-ready gear built for power and control." },
  { title: "Balls and Kits", detail: "Consistent quality for training and game play." },
  { title: "Protective Gear", detail: "Helmets, pads, and guards for confidence at the crease." },
  { title: "Training Tools", detail: "Cones, targets, and fitness tools to level up." },
];

export default function Home() {
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [teamMap, setTeamMap] = useState({});
  const [groundMap, setGroundMap] = useState({});
  const [hasToken, setHasToken] = useState(false);

  // Reusable styles for IPL-style consistency
  const sectionWrap = "mx-auto w-full max-w-7xl px-6";
  const label = "text-xs font-semibold uppercase tracking-[0.4em] text-white/60";
  const heading = `mt-4 text-4xl uppercase ${displayFont.className}`;
  const glassCard =
    "rounded-3xl border border-black/10 bg-black/50 backdrop-blur-lg shadow-[0_10px_35px_rgba(0,0,0,0.35)]";
  const muted = "text-white/70";
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const getTeamName = (teamId) => {
    if (!teamId) return "TBD";
    return teamMap[teamId] || `Team #${teamId}`;
  };
  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("club_token")));
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const [matchesRes, teamsRes, groundsRes] = await Promise.all([
          clubService.getMatches(),
          clubService.getTeams(),
          clubService.getGrounds(),
        ]);
        const tMap = {};
        (teamsRes.data || []).forEach((team) => {
          if (!team?.id) return;
          tMap[team.id] = team.name || `Team #${team.id}`;
        });
        setTeamMap(tMap);
        const gMap = {};
        (groundsRes.data || []).forEach((ground) => {
          if (!ground?.id) return;
          gMap[ground.id] = ground.name || `Ground #${ground.id}`;
        });
        setGroundMap(gMap);
        const allMatches = Array.isArray(matchesRes.data) ? matchesRes.data : [];
        const completed = allMatches.filter((match) => normalizeMatchStatus(match) === "completed");
        const sorted = completed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setResults(sorted.slice(0, 8));
      } catch (error) {
        console.error("Failed to load results", error);
        setResults([]);
      } finally {
        setResultsLoading(false);
      }
    };
    loadResults();
  }, []);

  return (
    <div className={`${displayFont.variable} ${bodyFont.variable} min-h-screen bg-black/40 text-white`}>
      {/* Stadium glow background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/dayStadium.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.20),transparent_60%)]" />
        <div className="absolute -left-24 top-24 h-105 w-105 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.12),transparent_65%)] blur-2xl" />
        <div className="absolute -right-30 top-0 h-130 w-130 rounded-full bg-[radial-gradient(circle_at_top,rgba(0,180,216,0.10),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.65))]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F1A]/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          
          <div className="flex items-center gap-3">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-black ring-2 ring-orange-500/40 shadow-lg">
              <Image
                src="/KK11.png"
                alt="KK Cricket Club"
                width={80}
                height={80}
                className="object-cover"
                priority
              />
            </span>
            <div>
              <p className={`text-2xl uppercase tracking-[0.18em] ${displayFont.className}`}>
                KK11 Cricket Club
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-orange-400">
                Fueling Passion, Building Champions
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium uppercase tracking-widest lg:flex">
            <a className="text-white/70 hover:text-orange-400 transition" href="#services">Services</a>
            <a className="text-white/70 hover:text-orange-400 transition" href="#photos">Photos</a>
            <a className="text-white/70 hover:text-orange-400 transition" href="#products">Products</a>
            <a className="text-white/70 hover:text-orange-400 transition" href="#news">News</a>
            <a className="text-white/70 hover:text-orange-400 transition" href="#contact">Contact</a>
          </nav>

          <HomeHeaderActions />
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className={`${sectionWrap} py-16 lg:py-20`}>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="space-y-6">
                
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">
                  Official League • KK11
                </p>

                <h1 className={`text-5xl font-semibold uppercase leading-none sm:text-6xl lg:text-7xl ${displayFont.className}`}>
                  Fueling Passion,
                  <span className="block text-orange-400">Building Champions.</span>
                </h1>

                <p className={`max-w-xl text-lg ${muted}`}>
                  KK Cricket Club is a home for players, learners, and the community. From structured coaching to match-ready
                  facilities, we build skills, confidence, and team spirit every day.
                </p>

                {!hasToken && (
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="#contact"
                      className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
                    >
                      Join Us Now
                    </Link>
                    <Link
                      href="#services"
                      className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                    >
                      View Services
                    </Link>
                  </div>
                )}
              </div>

              {/* Right-side feature cards (glass, not white) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={`${glassCard} p-6`}>
                  <p className={label}>Training</p>
                  <p className={`mt-3 text-3xl uppercase ${displayFont.className}`}>Net Sessions</p>
                  <p className={`mt-4 text-sm ${muted}`}>
                    Weekly drills focused on fundamentals, reflexes, and match readiness.
                  </p>
                  <div className="mt-6 h-1 w-12 rounded-full bg-orange-500" />
                </div>

                <div className={`${glassCard} p-6`}>
                  <p className={label}>Facilities</p>
                  <p className={`mt-3 text-3xl uppercase ${displayFont.className}`}>Ground Booking</p>
                  <p className={`mt-4 text-sm ${muted}`}>
                    Book our ground for matches, tournaments, or corporate events.
                  </p>
                  <div className="mt-6 h-1 w-12 rounded-full bg-orange-500" />
                </div>

                <div className={`${glassCard} p-6 sm:col-span-2`}>
                  <p className={label}>Club Promise</p>
                  <p className={`mt-3 text-3xl uppercase ${displayFont.className}`}>
                    Community and Competition
                  </p>
                  <p className={`mt-4 max-w-xl text-sm ${muted}`}>
                    We create a space where beginners find guidance and experienced players sharpen their edge.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keep your KPI section */}
          <HomeKpis />
        </section>

        {/* RESULTS */}
        <section id="results" className={`${sectionWrap} py-16`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={label}>Results</p>
              <h2 className={heading}>Latest Match Results</h2>
            </div>
            <p className={`max-w-md text-sm ${muted}`}>
              Recent match outcomes across the league.
            </p>
          </div>

          {resultsLoading ? (
            <div className={`${glassCard} mt-10 p-10 text-center text-white/60`}>
              Loading results...
            </div>
          ) : results.length === 0 ? (
            <div className={`${glassCard} mt-10 p-10 text-center text-white/60`}>
              No results available yet.
            </div>
          ) : (
            <div className="mt-10 flex gap-6 overflow-x-auto pb-4">
              {results.map((match) => {
                const ground = groundMap[match.ground] || `Ground #${match.ground}`;
                const winnerName = getComputedWinnerName(match, teamMap);
                const ballMeta = getBallTypeMeta(match.ball_type);
                const matchTitle = getMatchTitle(match, teamMap);
                const resultText = getMatchResultText(match, teamMap);
                const formatMeta = getMatchFormatMeta(match);
                const team1Score = getMatchScore(match, 1);
                const team2Score = getMatchScore(match, 2);
                return (
                  <div
                    key={match.id}
                    className={`${glassCard} min-w-[280px] overflow-hidden border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.34))] p-0 sm:min-w-[340px]`}
                  >
                    <div className="border-b border-white/10 bg-black/20 px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
                           Result
                        </p>
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                          Final
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5 p-6">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className={`text-3xl uppercase leading-none ${displayFont.className}`}>
                              {matchTitle}
                            </h3>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-orange-300" />
                                {formatDate(match.date)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-sky-300" />
                                {ground}
                              </span>
                              {formatMeta && (
                                <span className="inline-flex items-center gap-1.5 text-orange-200">
                                  <Shield className="h-3.5 w-3.5 text-orange-300" />
                                  {formatMeta}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                            <Image
                              src={ballMeta.image}
                              alt={ballMeta.label}
                              width={18}
                              height={18}
                              className="h-[18px] w-[18px] rounded-full object-cover"
                            />
                            {ballMeta.label}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-orange-500/15 p-2">
                            <Trophy className="h-4 w-4 text-orange-300" />
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
                              Match Summary
                            </p>
                            <p className="mt-2 text-sm leading-6 text-white/85">
                              {resultText}
                            </p>
                            {(team1Score || team2Score) && (
                              <div className="mt-3 space-y-1 text-xs text-white/70">
                                {team1Score && <p>{getTeamName(match.team1)}: {team1Score}</p>}
                                {team2Score && (
                                  <p>{match.external_opponent || getTeamName(match.team2)}: {team2Score}</p>
                                )}
                              </div>
                            )}
                            {winnerName && (
                              <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-emerald-300">
                                <Shield className="h-3.5 w-3.5" />
                                Winner: {winnerName}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-white/60">
                        <span className="truncate">{match.team_dress || "Official Club Kit"}</span>
                        <span className="font-medium text-orange-200">{match.external_opponent ? "External Fixture" : "Club Fixture"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CLUB VIBE */}
        <section className={`${sectionWrap} py-14`}>
          <div className={`${glassCard} grid gap-8 p-8 md:grid-cols-[0.9fr_1.1fr] md:items-center`}>
            <div className="space-y-4">
              <p className={label}>Club Heritage</p>
              <h2 className={`text-4xl uppercase ${displayFont.className}`}>
                Cricket Lives Here
              </h2>
              <p className={muted}>
                From sunrise nets to floodlit match nights, KK11 is built on technique, discipline,
                and the love of the game. Join a club that feels like home and plays like a team.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Practice Nets", "Match Day Vibes", "Community First"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative h-64 overflow-hidden rounded-3xl border border-white/10 sm:h-72">
              <Image
                src="/bat ball.jpg"
                alt="Cricket bat and ball"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                KK11 Cricket Club
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className={`${sectionWrap} py-16`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={label}>Services</p>
              <h2 className={heading}>Built for Every Player</h2>
            </div>
            <p className={`max-w-md text-sm ${muted}`}>
              Structured sessions, professional coaching, and match-ready facilities designed to help you grow.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className={`${glassCard} group p-6 transition hover:-translate-y-1`}
              >
                <p className={`text-2xl uppercase ${displayFont.className}`}>{service.title}</p>
                <p className={`mt-4 text-sm ${muted}`}>{service.description}</p>
                <div className="mt-6 h-1 w-12 rounded-full bg-orange-500 transition group-hover:w-20" />
              </div>
            ))}
          </div>
        </section>

        {/* PHOTOS */}
        <section id="photos" className={`${sectionWrap} py-16`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={label}>Photos</p>
              <h2 className={heading}>Moments at the Club</h2>
            </div>
            <Link href="#contact" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition">
              View All Photos
            </Link>
          </div>

          <div className="mt-10">
            <MediaGallery fallback={photoSets} />
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className={`${sectionWrap} py-16`}>
          <div className={`${glassCard} p-10`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className={label}>Products We Use</p>
                <h2 className={heading}>Trusted Gear</h2>
              </div>
              <p className={`max-w-md text-sm ${muted}`}>
                We use top-quality cricket gear and equipment from trusted brands to ensure the best performance and safety.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className={`text-2xl uppercase ${displayFont.className}`}>{product.title}</p>
                  <p className={`mt-3 text-sm ${muted}`}>{product.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEWS */}
        <section id="news" className={`${sectionWrap} py-16`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={label}>News</p>
              <h2 className={heading}>Club Updates</h2>
            </div>
            <Link href="#contact" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition">
              View All News
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {["Match Fixtures", "Coaching Batches", "Ground Availability"].map((title) => (
              <div key={title} className={`${glassCard} p-6`}>
                <p className={`text-xl uppercase ${displayFont.className}`}>{title}</p>
                <p className={`mt-3 text-sm ${muted}`}>
                  Fresh updates are posted here. Stay tuned for schedules, registrations, and announcements.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className={`${sectionWrap} pb-20`}>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-orange-500 to-amber-400 p-10 text-white shadow-[0_20px_60px_rgba(255,107,0,0.25)]">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em]">Join Us Now</p>
                <h2 className={`mt-4 text-4xl uppercase ${displayFont.className}`}>
                  Become Part of the KK Cricket Club
                </h2>
                <p className="mt-4 text-sm text-white/85">
                  Looking for coaching, ground bookings, or a competitive team environment? Share your details and
                  we will reach out with the next steps.
                </p>

                <div className="mt-6 flex flex-wrap gap-4">
                  <Link href="/login" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600">
                    Member Login
                  </Link>
                  <Link href="/register" className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white">
                    Register Interest
                  </Link>
                </div>
              </div>

              <form className="rounded-2xl bg-white/15 p-6 backdrop-blur">
                <div className="grid gap-4">
                  <input
                    className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70 outline-none focus:border-white/60"
                    placeholder="Full name"
                    type="text"
                  />
                  <input
                    className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70 outline-none focus:border-white/60"
                    placeholder="Email address"
                    type="email"
                  />
                  <input
                    className="w-full rounded-full border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70 outline-none focus:border-white/60"
                    placeholder="Tell us what you are looking for"
                    type="text"
                  />
                  <button
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-600 hover:bg-white/90 transition"
                    type="button"
                  >
                    Send Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
