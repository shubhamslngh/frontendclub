"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import { clubService } from "@/services/clubService";
import { Badge } from "@/components/ui/badge";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const formatDate = (value, withTime = false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, withTime ? {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  } : {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PublicMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [teamMap, setTeamMap] = useState({});
  const [groundMap, setGroundMap] = useState({});
  const [loading, setLoading] = useState(true);
  const glassCard =
    "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const [matchesRes, teamsRes, groundsRes] = await Promise.all([
          clubService.getMatches(),
          clubService.getTeams(),
          clubService.getGrounds(),
        ]);
        setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
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
      } catch (error) {
        console.error("Failed to load matches", error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [matches]);

  return (
    <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">Club Matches</p>
            <h1 className={`text-4xl uppercase ${displayFont.className}`}>Fixtures</h1>
          </div>
          <Link href="/" className="text-sm font-semibold text-orange-400 hover:underline">
            Back to Home
          </Link>
        </div>

        {loading ? (
          <div className={`${glassCard} p-10 text-center text-white/60`}>
            Loading matches...
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMatches.map((match) => {
              const team1 = teamMap[match.team1] || `Team #${match.team1}`;
              const team2 = teamMap[match.team2] || `Team #${match.team2}`;
              const ground = groundMap[match.ground] || `Ground #${match.ground}`;
              return (
                <div
                  key={match.id}
                  className={`${glassCard} p-5 text-white transition hover:-translate-y-1 hover:border-orange-500/40 hover:bg-white/10`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className={`text-2xl uppercase ${displayFont.className}`}>
                        {match.external_opponent ? `vs ${match.external_opponent}` : `${team1} vs ${team2}`}
                      </div>
                      <p className="mt-2 text-sm text-white/60">
                        {formatDate(match.date, true)} • {ground}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white">
                      {match.result ? "Completed" : "Scheduled"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
