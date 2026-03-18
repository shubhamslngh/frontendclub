"use client";

import { useEffect, useState } from "react";
import { format, isValid } from "date-fns";
import { CalendarDays, MapPin, Shield, Sparkles } from "lucide-react";
import MatchResultSummary from "@/components/ui/MatchResultSummary";
import MatchStatusBadge from "@/components/ui/MatchStatusBadge";
import ScoreDisplay from "@/components/ui/ScoreDisplay";
import { clubService } from "@/services/clubService";
import { getMatchFormatMeta, getMatchTitle } from "@/lib/matches";

export default function MatchDetailsView({ matchId, publicView = false }) {
  const [match, setMatch] = useState(null);
  const [teamMap, setTeamMap] = useState({});
  const [groundMap, setGroundMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const [matchRes, teamsRes, groundsRes] = await Promise.all([
          clubService.getMatch(matchId),
          clubService.getTeams(),
          clubService.getGrounds(),
        ]);

        const nextTeamMap = {};
        const nextGroundMap = {};

        (teamsRes.data || []).forEach((team) => {
          if (!team?.id) return;
          nextTeamMap[team.id] = team.name || `Team #${team.id}`;
        });

        (groundsRes.data || []).forEach((ground) => {
          if (!ground?.id) return;
          nextGroundMap[ground.id] = ground.name || `Ground #${ground.id}`;
        });

        setMatch(matchRes.data || null);
        setTeamMap(nextTeamMap);
        setGroundMap(nextGroundMap);
      } catch (error) {
        console.error("Failed to load match details", error);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  if (loading) {
    return <div className="rounded-2xl border p-8 text-center text-muted-foreground">Loading match details...</div>;
  }

  if (!match) {
    return <div className="rounded-2xl border p-8 text-center text-muted-foreground">Match not found.</div>;
  }

  const matchDate = new Date(match.date);
  const ground = match.ground_name || groundMap[match.ground] || (match.ground ? `Ground #${match.ground}` : "Venue TBD");
  const formatMeta = getMatchFormatMeta(match);
  const title = getMatchTitle(match, teamMap);

  return (
    <div className={`space-y-6 ${publicView ? "text-white" : ""}`}>
      <div className={`rounded-3xl border p-6 ${publicView ? "border-white/10 bg-white/5" : "bg-white"}`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${publicView ? "text-orange-300" : "text-orange-600"}`}>
              Match Details
            </p>
            <h1 className={`mt-3 text-3xl font-bold ${publicView ? "text-white" : "text-slate-900"}`}>{title}</h1>
            <div className={`mt-3 flex flex-wrap items-center gap-3 text-sm ${publicView ? "text-white/70" : "text-slate-600"}`}>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {isValid(matchDate) ? format(matchDate, "PPP p") : "Invalid date"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {ground}
              </span>
              {formatMeta && (
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  {formatMeta}
                </span>
              )}
            </div>
          </div>
          <MatchStatusBadge match={match} className={publicView ? "border-white/20 bg-white/10 text-white" : ""} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className={`space-y-6 rounded-3xl border p-6 ${publicView ? "border-white/10 bg-white/5" : "bg-white"}`}>
          <div>
            <p className={`text-sm font-semibold ${publicView ? "text-white" : "text-slate-900"}`}>Score Summary</p>
            <ScoreDisplay match={match} teamMap={teamMap} className={publicView ? "text-white" : ""} />
          </div>

          <MatchResultSummary match={match} teamMap={teamMap} />

          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock label="Toss Winner" value={match.toss_winner_name || teamMap[match.toss_winner] || "Not recorded"} publicView={publicView} />
            <InfoBlock label="Toss Decision" value={match.toss_decision || "Not recorded"} publicView={publicView} />
            <InfoBlock label="Notes" value={match.notes || "No notes"} publicView={publicView} />
            <InfoBlock label="Highlights" value={match.highlights || "Highlights can be added later"} publicView={publicView} />
          </div>
        </div>

        <div className={`space-y-4 rounded-3xl border p-6 ${publicView ? "border-white/10 bg-white/5" : "bg-white"}`}>
          <p className={`text-sm font-semibold ${publicView ? "text-white" : "text-slate-900"}`}>Fixture Summary</p>
          <InfoBlock label="Series" value={match.series || match.tournament || "Club Fixture"} publicView={publicView} />
          <InfoBlock label="Match Type" value={match.match_format || match.match_type || "Friendly"} publicView={publicView} />
          <InfoBlock label="Overs Limit" value={match.overs_per_side || match.overs_limit || "Not set"} publicView={publicView} />
          <InfoBlock label="Start Time" value={match.reporting_time || (isValid(matchDate) ? format(matchDate, "p") : "Not set")} publicView={publicView} />
          <InfoBlock label="Player of the Match" value={match.player_of_the_match || "Add after final review"} publicView={publicView} />
          <div className={`rounded-2xl border border-dashed p-4 text-sm ${publicView ? "border-white/15 text-white/70" : "border-slate-200 text-slate-600"}`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Result text, winner, and final outcome stay backend-derived after every save.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, publicView }) {
  return (
    <div className={`rounded-2xl border p-4 ${publicView ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${publicView ? "text-white/50" : "text-slate-500"}`}>
        {label}
      </p>
      <p className={`mt-2 text-sm ${publicView ? "text-white" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
