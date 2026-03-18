"use client";

import MatchStatusBadge from "@/components/ui/MatchStatusBadge";
import { getComputedWinnerName, getMatchResultText, normalizeMatchStatus } from "@/lib/matches";

export default function MatchResultSummary({ match, teamMap = {}, compact = false, className = "" }) {
  const status = normalizeMatchStatus(match);
  const resultText = getMatchResultText(match, teamMap);
  const winnerName = getComputedWinnerName(match, teamMap);

  return (
    <div className={`rounded-xl border bg-slate-50/80 p-4 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Result
          </p>
          <p className={`mt-1 ${compact ? "text-sm" : "text-base"} font-semibold text-slate-900`}>
            {resultText}
          </p>
        </div>
        <MatchStatusBadge match={match} status={status} />
      </div>
      {winnerName && (
        <p className="mt-2 text-xs text-slate-600">
          Winner: <span className="font-semibold text-slate-900">{winnerName}</span>
        </p>
      )}
    </div>
  );
}
