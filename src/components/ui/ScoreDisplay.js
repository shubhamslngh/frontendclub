"use client";

import { getMatchScore } from "@/lib/matches";

export default function ScoreDisplay({
  match,
  teamMap = {},
  team1Label,
  team2Label,
  className = "",
}) {
  const firstLabel = team1Label || teamMap[match?.team1] || "Team 1";
  const secondLabel =
    team2Label ||
    match?.external_opponent ||
    teamMap[match?.team2] ||
    "Team 2";
  const team1Score = getMatchScore(match, 1);
  const team2Score = getMatchScore(match, 2);

  if (!team1Score && !team2Score) {
    return <p className={`text-sm text-muted-foreground ${className}`.trim()}>Score Pending</p>;
  }

  return (
    <div className={`space-y-2 text-sm ${className}`.trim()}>
      {team1Score && (
        <div className="min-w-0 rounded-xl bg-white/80 px-3 py-2">
          <p className="break-words font-medium text-foreground">
            <span className="text-foreground">{firstLabel}:</span>{" "}
            <span className="text-muted-foreground">{team1Score}</span>
          </p>
        </div>
      )}
      {team2Score && (
        <div className="min-w-0 rounded-xl bg-white/80 px-3 py-2">
          <p className="break-words font-medium text-foreground">
            <span className="text-foreground">{secondLabel}:</span>{" "}
            <span className="text-muted-foreground">{team2Score}</span>
          </p>
        </div>
      )}
    </div>
  );
}
