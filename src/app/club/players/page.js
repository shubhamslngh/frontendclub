"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { clubService } from "@/services/clubService";
import SquadCard from "@/components/ui/SquadCard";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

export default function PublicPlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const glassCard = "shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const res = await clubService.getPlayers();
        setPlayers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load players", error);
      } finally {
        setLoading(false);
      }
    };
    loadPlayers();
  }, []);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) =>
      (a.first_name || "").localeCompare(b.first_name || "")
    );
  }, [players]);

  const categories = {
    Batsmen: sortedPlayers.filter((p) => p.role === "batsman"),
    Bowlers: sortedPlayers.filter((p) => p.role === "bowler"),
    "All Rounders": sortedPlayers.filter((p) => p.role === "all_rounder"),
  };

  return (
    <div className="space-y-16 text-white">

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">
            Official Squad
          </p>
          <h1 className={`text-5xl uppercase ${displayFont.className}`}>
            KK11 Players
          </h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-orange-400 hover:underline">
          Back to Home
        </Link>
      </div>

      {loading ? (
        <div className={`${glassCard} p-10 text-center text-white/60`}>
          Loading players...
        </div>
      ) : (
        Object.entries(categories).map(([title, list]) => (
          <div key={title} className="space-y-8">

            {/* Category Title */}
            <div>
              <h2 className={`text-4xl uppercase ${displayFont.className}`}>
                {title}
              </h2>
              <div className="mt-3 h-1 w-16 bg-orange-500 rounded-full" />
            </div>

            {/* Players Grid */}
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-5">
              {list.map((player) => (
                <SquadCard
                  key={player.id}
                  player={player}
                  href={`/players/${player.id}`}
                  className={glassCard}
                />
              ))}
            </div>

          </div>
        ))
      )}
    </div>
  );
}
