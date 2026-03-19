"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bebas_Neue } from "next/font/google";
import { clubService } from "@/services/clubService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRoleLabel, getMembershipStatusClasses } from "@/lib/players";

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

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  const glassCard =
    "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.35)]";
  const membership = player?.membership;
  const leavePeriods = membership?.leave_periods || [];

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        const res = await clubService.getPlayer(params.id);
        setPlayer(res.data);
      } catch (error) {
        console.error("Failed to load player", error);
        setPlayer(null);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) loadPlayer();
  }, [params?.id]);

  return (
    <div className="space-y-12 text-white">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-orange-400">
            Official Player Profile
          </p>
          <h1 className={`text-4xl uppercase ${displayFont.className}`}>
            KK11 Squad
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
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
        <div className={`${glassCard} p-12 text-center text-white/60`}>
          Loading player profile...
        </div>
      ) : !player ? (
        <div className={`${glassCard} p-12 text-center text-white/60`}>
          Player not found.
        </div>
      ) : (
        <>
          {/*
            SAFE IMAGE RESOLUTION
          */}
          {(() => {
            const fullName = `${player.first_name || ""} ${player.last_name || ""}`.trim();
            const imageUrl =
              normalizeUrl(player.profile_picture) || "/Default.avif";

            return (
              <>
                {/* HERO SECTION */}
                <div className={`${glassCard} overflow-hidden`}>
                  <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

                    {/* Image */}
                    <div className="relative h-[380px] lg:h-[460px] ">
                      <Image
                        src={imageUrl}
                        alt={fullName || "Player"}
                        fill
                        className="object-cover opacity-90 transition duration-500 hover:grayscale-0 hover:opacity-100"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    </div>

                    {/* Details */}
                    <div className="p-10 flex flex-col justify-center space-y-6">
                      <div>
                        <h2 className={`text-5xl uppercase ${displayFont.className}`}>
                          {fullName || "Player"}
                        </h2>
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
                          {membership?.status || "Unknown"}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-white/70">
                        <p>📞 {player.phone_number || "-"}</p>
                        <p>📅 Joined: {membership?.join_date || "-"}</p>
                        <p>🧾 Fee Exempt: {membership?.fee_exempt ? "Yes" : "No"}</p>
                        {membership?.fee_exempt_reason ? (
                          <p>📝 Exemption Reason: {membership.fee_exempt_reason}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BELOW SECTIONS */}
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className={`${glassCard} p-8 space-y-6`}>
                    <h3 className={`text-3xl uppercase ${displayFont.className}`}>
                      Teams
                    </h3>

                    {player.teams?.length ? (
                      <div className="flex flex-wrap gap-3">
                        {player.teams.map((team) => (
                          <Badge
                            key={team.id}
                            variant="outline"
                            className="border-white/20 text-white"
                          >
                            {team.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">
                        No teams assigned.
                      </p>
                    )}
                  </div>

                  <div className={`${glassCard} p-8 space-y-6`}>
                    <h3 className={`text-3xl uppercase ${displayFont.className}`}>
                      Captain Of
                    </h3>

                    {player.captain_of?.length ? (
                      <div className="flex flex-wrap gap-3">
                        {player.captain_of.map((team) => (
                          <Badge
                            key={team.id}
                            className="bg-orange-500 text-white"
                          >
                            {team.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">
                        Not a captain currently.
                      </p>
                    )}
                  </div>

                  <div className={`${glassCard} p-8 space-y-6`}>
                    <h3 className={`text-3xl uppercase ${displayFont.className}`}>
                      Membership
                    </h3>

                    {membership ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                          <Badge
                            variant="outline"
                            className={cn("border-white/20 text-white", getMembershipStatusClasses(membership.status))}
                          >
                            {membership.status || "Unknown"}
                          </Badge>
                          {membership.fee_exempt ? (
                            <Badge variant="outline" className="border-blue-300/40 bg-blue-500/10 text-blue-100">
                              Fee Exempt
                            </Badge>
                          ) : null}
                        </div>

                        <div className="space-y-2 text-sm text-white/70">
                          <p>Join Date: {membership.join_date || "-"}</p>
                          <p>Leave Periods: {leavePeriods.length}</p>
                          {membership.fee_exempt_reason ? (
                            <p>Exemption Reason: {membership.fee_exempt_reason}</p>
                          ) : null}
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-[0.25em] text-white/45">Leave Periods</p>
                          {leavePeriods.length ? (
                            leavePeriods.map((leave) => (
                              <div
                                key={leave.id}
                                className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75"
                              >
                                <p>{leave.start_date} to {leave.end_date}</p>
                                <p className="mt-1 text-white/55">{leave.reason || "No reason provided"}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-white/60">No leave periods recorded.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-white/60">
                        Membership details unavailable.
                      </p>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
