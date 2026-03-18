"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bebas_Neue } from "next/font/google";
import MatchCard from "@/components/ui/MatchCard";
import { clubService } from "@/services/clubService";
import { normalizeMatchStatus } from "@/lib/matches";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function PublicMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [teamMap, setTeamMap] = useState({});
  const [teamDetails, setTeamDetails] = useState({});
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

        const tMap = {};
        const tDetails = {};
        const gMap = {};

        (teamsRes.data || []).forEach((team) => {
          if (!team?.id) return;
          tMap[team.id] = team.name || `Team #${team.id}`;
          tDetails[team.id] = team;
        });
        (groundsRes.data || []).forEach((ground) => {
          if (!ground?.id) return;
          gMap[ground.id] = ground.name || `Ground #${ground.id}`;
        });

        setMatches(Array.isArray(matchesRes.data) ? matchesRes.data : []);
        setTeamMap(tMap);
        setTeamDetails(tDetails);
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

  const grouped = useMemo(() => {
    const sorted = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));
    return {
      upcoming: sorted.filter((match) => normalizeMatchStatus(match) === "scheduled"),
      live: sorted.filter((match) => normalizeMatchStatus(match) === "live"),
      completed: sorted.filter((match) => normalizeMatchStatus(match) === "completed"),
      other: sorted.filter((match) => ["abandoned", "no_result", "cancelled"].includes(normalizeMatchStatus(match))),
    };
  }, [matches]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">Club Matches</p>
          <h1 className={`text-4xl uppercase ${displayFont.className}`}>Fixtures And Results</h1>
        </div>
        <Link href="/" className="text-sm font-semibold text-orange-400 hover:underline">
          Back to Home
        </Link>
      </div>

      {loading ? (
        <div className={`${glassCard} p-10 text-center text-white/60`}>Loading matches...</div>
      ) : (
        <div className="space-y-8">
          <PublicSection
            title="Upcoming Fixtures"
            text="Scheduled club fixtures awaiting first ball."
            matches={grouped.upcoming}
            teamMap={teamMap}
            teamDetails={teamDetails}
            groundMap={groundMap}
          />
          <PublicSection
            title="Live Matches"
            text="Matches where score entry has started."
            matches={grouped.live}
            teamMap={teamMap}
            teamDetails={teamDetails}
            groundMap={groundMap}
          />
          <PublicSection
            title="Recent Results"
            text="Completed matches using backend-computed results."
            matches={grouped.completed}
            teamMap={teamMap}
            teamDetails={teamDetails}
            groundMap={groundMap}
          />
          <PublicSection
            title="Other Outcomes"
            text="Abandoned, no result, or cancelled matches."
            matches={grouped.other}
            teamMap={teamMap}
            teamDetails={teamDetails}
            groundMap={groundMap}
          />
        </div>
      )}
    </div>
  );
}

function PublicSection({ title, text, matches, teamMap, teamDetails, groundMap }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/60">{text}</p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          No matches in this section.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              teamMap={teamMap}
              teamDetails={teamDetails}
              groundMap={groundMap}
              href={`/club/matches/${match.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
