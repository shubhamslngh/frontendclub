"use client";

import React, { useEffect, useMemo, useState } from "react";
import MatchModal from "@/components/ui/MatchModal";
import MatchCard from "@/components/ui/MatchCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus } from "lucide-react";
import { clubService } from "@/services/clubService";
import { normalizeMatchStatus } from "@/lib/matches";

const TAB_CONFIG = [
  { value: "all", label: "All Matches" },
  { value: "scheduled", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "other", label: "Other Outcomes" },
];

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [teamMap, setTeamMap] = useState({});
  const [teamDetails, setTeamDetails] = useState({});
  const [groundMap, setGroundMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchRes, teamRes, groundRes] = await Promise.all([
        clubService.getMatches(),
        clubService.getTeams(),
        clubService.getGrounds(),
      ]);

      const matchData = Array.isArray(matchRes.data) ? matchRes.data : [];
      const nextTeamMap = {};
      const nextTeamDetails = {};
      const nextGroundMap = {};

      (teamRes.data || []).forEach((team) => {
        if (!team?.id) return;
        nextTeamMap[team.id] = team.name || `Team #${team.id}`;
        nextTeamDetails[team.id] = team;
      });

      (groundRes.data || []).forEach((ground) => {
        if (!ground?.id) return;
        nextGroundMap[ground.id] = ground.name || `Ground #${ground.id}`;
      });

      setMatches(matchData);
      setTeamMap(nextTeamMap);
      setTeamDetails(nextTeamDetails);
      setGroundMap(nextGroundMap);
    } catch (error) {
      console.error("Failed to load match data", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categorizedMatches = useMemo(() => {
    const sorted = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
    return {
      all: sorted,
      scheduled: sorted.filter((match) => normalizeMatchStatus(match) === "scheduled"),
      live: sorted.filter((match) => normalizeMatchStatus(match) === "live"),
      completed: sorted.filter((match) => normalizeMatchStatus(match) === "completed"),
      other: sorted.filter((match) => ["abandoned", "no_result", "cancelled"].includes(normalizeMatchStatus(match))),
    };
  }, [matches]);

  const handleEdit = (match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedMatch(null);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Management</h1>
          <p className="text-muted-foreground">
            Create fixtures, update scores, and rely on backend-computed results across every match state.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Fixture
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <AdminStat label="All Matches" value={categorizedMatches.all.length} helper="Every fixture and result" />
        <AdminStat label="Upcoming" value={categorizedMatches.scheduled.length} helper="Ready to be played" />
        <AdminStat label="Live" value={categorizedMatches.live.length} helper="Score entry started" />
        <AdminStat label="Completed" value={categorizedMatches.completed.length} helper="Backend result available" />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2 sm:grid-cols-5">
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label} ({categorizedMatches[tab.value].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_CONFIG.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((index) => (
                  <MatchSkeleton key={index} />
                ))}
              </div>
            ) : categorizedMatches[tab.value].length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {categorizedMatches[tab.value].map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teamMap={teamMap}
                    teamDetails={teamDetails}
                    groundMap={groundMap}
                    onEdit={handleEdit}
                    admin
                    href={`/matches/${match.id}`}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text={`No ${tab.label.toLowerCase()} found.`} />
            )}
          </TabsContent>
        ))}
      </Tabs>

      <MatchModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        match={selectedMatch}
        onSuccess={loadData}
        teamMap={teamMap}
      />
    </div>
  );
}

function AdminStat({ label, value, helper }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 py-16 text-muted-foreground">
      <AlertCircle className="mb-3 h-10 w-10 opacity-20" />
      <p>{text}</p>
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div className="space-y-4 rounded-xl border p-5">
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-16 animate-pulse rounded bg-muted" />
      <div className="h-12 animate-pulse rounded bg-muted" />
    </div>
  );
}
