"use client";

import Image from "next/image";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { CalendarDays, Clock, Edit, MapPin, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MatchStatusBadge from "@/components/ui/MatchStatusBadge";
import { getBallTypeMeta, getMatchFormatMeta, getMatchResultText, getMatchScore, getMatchSurfaceMeta, normalizeMatchStatus } from "@/lib/matches";

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = file.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

export default function MatchCard({
  match,
  teamMap = {},
  teamDetails = {},
  groundMap = {},
  onEdit,
  admin = false,
  href,
}) {
  const matchDate = new Date(match?.date);
  const isValidDate = isValid(matchDate);
  const status = normalizeMatchStatus(match);
  const ballType = getBallTypeMeta(match?.ball_type);
  const surfaceMeta = getMatchSurfaceMeta(match);
  const formatMeta = getMatchFormatMeta(match);
  const team1Score = getMatchScore(match, 1);
  const team2Score = getMatchScore(match, 2);
  const team1 = teamDetails[match.team1] || null;
  const team2 = teamDetails[match.team2] || null;
  const team1Name = teamMap[match.team1] || match.team1_name || "Team 1";
  const team2Name = match.external_opponent || teamMap[match.team2] || match.team2_name || "Team 2";
  const ground = match?.ground_name || groundMap[match?.ground] || (match?.ground ? `Ground #${match.ground}` : "Venue TBD");

  return (
    <Card className={`overflow-hidden border-l-4 ${surfaceMeta.cardAccent} ${surfaceMeta.cardShell} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {isValidDate ? format(matchDate, "EEE, MMM d") : "Invalid date"}
              </span>
              {isValidDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {format(matchDate, "h:mm a")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-red-500" />
                {ground}
              </span>
              {formatMeta && (
                <span className={`rounded-full border px-2 py-0.5 font-medium ${surfaceMeta.badge}`}>
                  {formatMeta}
                </span>
              )}
              <span className={`rounded-full border px-2 py-0.5 font-semibold capitalize ${surfaceMeta.typePill}`}>
                {match.match_type || "friendly"}
              </span>
            </div>
          </div>
          <MatchStatusBadge match={match} status={status} />
        </div>

        <div className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white/90 via-orange-50/40 to-white/80 p-3 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_150px_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_180px_minmax(0,1fr)]">

            {/* LEFT TEAM */}
            <div className="min-w-0">
              <TeamFace
                name={team1Name}
                logo={team1?.logo}
                score={team1Score}
                align="left"
              />
            </div>

            {/* CENTER BALL */}
            <div className="flex flex-col items-center justify-center gap-2">

              {/* BALL CONTAINER */}
              <div className="relative flex items-center justify-center">

                {/* glow */}
                <div className="absolute inset-0 rounded-full bg-orange-200/40 blur-xl" />

                {/* main circle */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-orange-200/70 bg-gradient-to-br from-green-100 via-green-500 to-green-600 shadow-[0_18px_40px_rgba(15,23,42,0.16)]
                        sm:h-28 sm:w-28 
                        lg:h-32 lg:w-32">

                  <Image
                    src={ballType.image}
                    alt={ballType.label}
                    fill
                    className="object-cover p-2"
                  />
                </div>

                {/* FLOATING LABEL */}
                <span className="absolute -bottom-2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 shadow-md border border-slate-200">
                  {ballType.label}
                </span>
              </div>

              {/* VS TEXT */}
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
                VS
              </span>
            </div>

            {/* RIGHT TEAM */}
            <div className="min-w-0">
              <TeamFace
                name={team2Name}
                logo={match.external_opponent ? null : team2?.logo}
                score={team2Score}
                align="right"
                external={Boolean(match.external_opponent)}
              />
            </div>

          </div>
        </div>
        <div className={`rounded-3xl border p-4 ${surfaceMeta.detailShell}`}>
            <div className="flex items-start gap-3">
           
              <div className="min-w-0 flex-1 space-y-3">

                {status === "completed" || status === "abandoned" || status === "no_result" || status === "cancelled" ? (
                <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2">
                  <span className="min-w-0 flex-1 text-xs font-light text-slate-900">
                    {getMatchResultText(match, teamMap)}
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
                  {status === "live" ? "Score update in progress" : "Upcoming fixture"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {href ? (
            <Button asChild variant="ghost" className="px-0 text-sm text-orange-600 hover:text-orange-700">
              <Link href={href}>View details</Link>
            </Button>
          ) : (
            <span />
          )}

          {admin && onEdit && (
            <Button size="sm" variant="outline" onClick={() => onEdit(match)}>
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              {status === "scheduled" ? "Edit Fixture" : "Update Score"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamFace({ name, logo, score, align = "left", external = false }) {
  const textAlign = align === "right" ? "text-right items-end" : "text-left items-start";

  return (
    <div className={`min-w-0 flex flex-col gap-2 ${textAlign}`}>
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-50 shadow-sm">
        {logo ? (
          <Image
            src={normalizeUrl(logo)}
            alt={name}
            fill
            className="object-contain p-1.5"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-orange-500">
            {(name || "T").charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{name}</p>
        {score && <p className="mt-1 text-sm font-medium text-slate-600">{score}</p>}
        {external && <p className="text-[11px] text-slate-500">Opponent</p>}
      </div>
    </div>
  );
}
