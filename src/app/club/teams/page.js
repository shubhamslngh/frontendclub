"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bebas_Neue } from "next/font/google";
import { clubService } from "@/services/clubService";
import { Badge } from "@/components/ui/badge";
import SquadCard from "@/components/ui/SquadCard";
import { AnimatePresence, motion } from "framer-motion";

const displayFont = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
});

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = file.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

export default function PublicTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [playerMap, setPlayerMap] = useState({});
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const [teamsRes, playersRes] = await Promise.all([
          clubService.getTeams(),
          clubService.getPlayers(),
        ]);

        setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);

        const pMap = {};
        (playersRes.data || []).forEach((player) => {
          const fullName = `${player.first_name || ""} ${player.last_name || ""}`.trim();
          pMap[player.id] = fullName || `Player #${player.id}`;
        });

        setPlayerMap(pMap);
      } catch (error) {
        console.error("Failed to load teams", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
  }, []);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }, [teams]);

  return (
    <div className="space-y-20 text-white">

      {/* Header */}
      <div className="text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.4em] text-orange-400">
          Official League
        </p>
        <h1 className={`text-6xl uppercase ${displayFont.className}`}>
          KK11 Teams
        </h1>
        <Link href="/" className="text-sm text-orange-400 hover:underline">
          Back to Home
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-white/60">
          Loading teams...
        </div>
      ) : (
        <div className="space-y-16 max-w-5xl mx-auto">

          {sortedTeams.map((team) => {
            const teamKey = String(team.id ?? "");
            const isExpanded = String(expandedTeamId) === teamKey;
            const captainName =
              team.captain_name ||
              playerMap[team.captain] ||
              `Player #${team.captain}`;

            return (
              <motion.div
                key={team.id}
                layout
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="border border-white/10 rounded-3xl overflow-hidden bg-white/5"
              >
                {/* TEAM HEADER */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedTeamId(isExpanded ? null : teamKey)
                  }
                  className="w-full py-12 px-8 text-center space-y-6 hover:bg-white/5 transition"
                >
                  {/* Logo */}
                  <div className="relative h-28 w-28 mx-auto rounded-full border border-white/20 bg-black/30 overflow-hidden">
                    {team.logo ? (
                      <Image
                        src={normalizeUrl(team.logo)}
                        alt={team.name}
                        fill
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-orange-400">
                        {(team.name || "T")[0]}
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h2 className={`text-4xl uppercase ${displayFont.className}`}>
                    {team.name}
                  </h2>

                  <p className="text-sm text-white/60">
                    Captain: {captainName}
                  </p>

                  <div className="flex justify-center gap-4">
                    <Badge variant="outline" className="border-white/20 text-white">
                      {team.players?.length || 0} Players
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-white/20 text-white"
                    >
                      {isExpanded ? "Hide Squad" : "View Squad"}
                    </Badge>
                  </div>
                </button>

                {/* EXPANDABLE SECTION */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="p-10">
                        <p className="text-xs uppercase tracking-[0.35em] text-orange-400 text-center mb-8">
                          Squad
                        </p>

                        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                          {team.players?.map((player) => (
                            <motion.div
                              key={player.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <SquadCard
                                player={player}
                                compact
                                href={`/players/${player.id}`}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
