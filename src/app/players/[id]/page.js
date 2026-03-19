"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bebas_Neue } from "next/font/google";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clubService } from "@/services/clubService";
import { formatLeaveRange, formatMembershipStatus } from "@/lib/membership";
import { formatRoleLabel, getMembershipStatusClasses } from "@/lib/players";
import { cn } from "@/lib/utils";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return null;
  if (file.startsWith("http")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = file.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  const glassCard =
    "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

  const loadPlayer = useCallback(async () => {
    if (!params?.id) return;

    try {
      const res = await clubService.getPlayer(params.id);
      setPlayer(res.data);
    } catch (error) {
      console.error("Failed to load player", error);
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const membership = player?.membership || null;
  const leavePeriods = membership?.leave_periods || [];
  const fullName = useMemo(
    () => `${player?.first_name || ""} ${player?.last_name || ""}`.trim(),
    [player?.first_name, player?.last_name]
  );
  const imageUrl = normalizeUrl(player?.profile_picture) || "/Default.avif";

  return (
    <div className="space-y-12 text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-400">Official Player Profile</p>
          <h1 className={`text-4xl uppercase ${displayFont.className}`}>KK11 Squad</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
            <Link href="/club/players">Back to Players</Link>
          </Button>

          <Button
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>

      {loading ? (
        <div className={`${glassCard} p-12 text-center text-white/60`}>Loading player profile...</div>
      ) : !player ? (
        <div className={`${glassCard} p-12 text-center text-white/60`}>Player not found.</div>
      ) : (
        <>
          <div className={`${glassCard} overflow-hidden`}>
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative h-[380px] lg:h-[460px]">
                <Image
                  src={imageUrl}
                  alt={fullName || "Player"}
                  fill
                  className="object-cover opacity-90 transition duration-500 hover:opacity-100"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              <div className="flex flex-col justify-center space-y-6 p-10">
                <div>
                  <h2 className={`text-5xl uppercase ${displayFont.className}`}>{fullName || "Player"}</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-white/20 text-white">
                    {formatRoleLabel(player.role || "none")}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white">
                    Age: {player.age || "-"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("border-white/20 text-white", getMembershipStatusClasses(membership?.status))}
                  >
                    {formatMembershipStatus(membership?.status)}
                  </Badge>
                  {membership?.fee_exempt ? (
                    <Badge variant="outline" className="border-sky-300/40 bg-sky-500/10 text-sky-100">
                      Fee Exempt
                    </Badge>
                  ) : null}
                </div>

                <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
                  <p>Phone: {player.phone_number || "-"}</p>
                  <p>Join Date: {formatDate(membership?.join_date)}</p>
                  <p>Status: {formatMembershipStatus(membership?.status)}</p>
                  <p>Leave Periods: {leavePeriods.length}</p>
                </div>

                {membership?.fee_exempt_reason ? (
                  <div className="rounded-2xl border border-sky-300/20 bg-sky-500/10 p-4 text-sm text-sky-50">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-200/75">Fee Exemption Reason</p>
                    <p className="mt-2">{membership.fee_exempt_reason}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className={`${glassCard} space-y-6 p-8`}>
              <h3 className={`text-3xl uppercase ${displayFont.className}`}>Teams</h3>

              {player.teams?.length ? (
                <div className="flex flex-wrap gap-3">
                  {player.teams.map((team) => (
                    <Badge key={team.id} variant="outline" className="border-white/20 text-white">
                      {team.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">No teams assigned.</p>
              )}
            </div>

            <div className={`${glassCard} space-y-6 p-8`}>
              <h3 className={`text-3xl uppercase ${displayFont.className}`}>Captain Of</h3>

              {player.captain_of?.length ? (
                <div className="flex flex-wrap gap-3">
                  {player.captain_of.map((team) => (
                    <Badge key={team.id} className="bg-orange-500 text-white">
                      {team.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60">Not a captain currently.</p>
              )}
            </div>

            <div className={`${glassCard} space-y-6 p-8`}>
              <h3 className={`text-3xl uppercase ${displayFont.className}`}>Membership</h3>

              {membership ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-3">
                    <Badge
                      variant="outline"
                      className={cn("border-white/20 text-white", getMembershipStatusClasses(membership.status))}
                    >
                      {formatMembershipStatus(membership.status)}
                    </Badge>
                    <Badge variant="outline" className="border-white/20 text-white">
                      Joined {formatDate(membership.join_date)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        membership.fee_exempt
                          ? "border-sky-300/40 bg-sky-500/10 text-sky-100"
                          : "border-white/20 text-white/70"
                      }
                    >
                      {membership.fee_exempt ? "Fee Exempt" : "Standard Billing"}
                    </Badge>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">Membership Summary</p>
                    <div className="mt-3 space-y-2">
                      <p>Join Date: {formatDate(membership.join_date)}</p>
                      <p>Status: {formatMembershipStatus(membership.status)}</p>
                      <p>Fee Exempt: {membership.fee_exempt ? "Yes" : "No"}</p>
                      <p>Leave Periods Recorded: {leavePeriods.length}</p>
                      {membership.fee_exempt_reason ? <p>Reason: {membership.fee_exempt_reason}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-white/45">Leave Periods</p>
                    {leavePeriods.length ? (
                      leavePeriods.map((leave) => (
                        <div
                          key={leave.id}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75"
                        >
                          <p className="font-medium text-white">
                            {formatLeaveRange(leave, formatDate)}
                          </p>
                          <p className="mt-1 text-white/55">{leave.reason || "No reason provided"}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/60">
                        No leave periods recorded.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/60">Membership details unavailable.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
