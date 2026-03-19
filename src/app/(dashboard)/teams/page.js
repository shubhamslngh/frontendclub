"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Crown,
  Plus,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import TeamModal from "@/components/ui/TeamModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clubService } from "@/services/clubService";
import { normalizeMediaUrl } from "@/lib/utils";


const SORT_OPTIONS = [
  { id: "name", label: "Name A-Z" },
  { id: "squad_size", label: "Squad Size" },
  { id: "captain_name", label: "Captain Name" },
  { id: "active_members", label: "Most Active Members" },
];

const TEAM_LOGO_KEYS = ["logo", "image", "thumbnail", "photo"];
const PLAYER_IMAGE_KEYS = ["profile_picture", "image", "photo", "thumbnail"];

const getImageFromKeys = (source, keys) => {
  if (!source || typeof source !== "object") return null;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return normalizeMediaUrl(value);
    }
  }

  return null;
};

const getPlayerFullName = (player) =>
  [player?.first_name, player?.last_name].filter(Boolean).join(" ").trim() || "Unknown Player";

const getCaptainPlayer = (team) =>
  team?.players?.find((player) => String(player.id) === String(team.captain)) || null;

const getCaptainName = (team) => {
  const captain = getCaptainPlayer(team);
  return captain ? getPlayerFullName(captain) : "Captain unassigned";
};

const getActiveCount = (team) =>
  team.players?.filter((player) => Boolean(player.membership_active)).length || 0;

const getPendingCount = (team) =>
  team.players?.filter((player) => player.membership?.status === "pending").length || 0;

const getAverageAge = (team) => {
  const validAges = (team.players || [])
    .map((player) => Number(player.age))
    .filter((age) => Number.isFinite(age) && age > 0);

  if (validAges.length === 0) return null;
  const total = validAges.reduce((sum, age) => sum + age, 0);
  return Math.round((total / validAges.length) * 10) / 10;
};

const getRoleBreakdown = (team) => {
  const counts = {
    batsman: 0,
    bowler: 0,
    all_rounder: 0,
    wicket_keeper: 0,
    other: 0,
  };

  (team.players || []).forEach((player) => {
    const role = String(player.role || "").toLowerCase();

    if (role === "batsman") counts.batsman += 1;
    else if (role === "bowler") counts.bowler += 1;
    else if (role === "all_rounder") counts.all_rounder += 1;
    else if (role === "wicket_keeper" || role === "wicketkeeper") counts.wicket_keeper += 1;
    else counts.other += 1;
  });

  return counts;
};

const getTeamLogo = (team) => getImageFromKeys(team, TEAM_LOGO_KEYS);
const getPlayerImage = (player) => getImageFromKeys(player, PLAYER_IMAGE_KEYS);

const buildTeamSummary = (team) => {
  const captainPlayer = getCaptainPlayer(team);
  const roleBreakdown = getRoleBreakdown(team);
  const squadSize = team.players?.length || 0;
  const activeCount = getActiveCount(team);
  const pendingCount = getPendingCount(team);
  const averageAge = getAverageAge(team);
  const activeCaptain = Boolean(captainPlayer);

  return {
    ...team,
    captainPlayer,
    captainName: captainPlayer ? getPlayerFullName(captainPlayer) : "Captain unassigned",
    logoUrl: getTeamLogo(team),
    squadSize,
    activeCount,
    pendingCount,
    averageAge,
    roleBreakdown,
    playerPreview: (team.players || []).slice(0, 5),
    healthLabel: pendingCount > 0 ? "Membership Review" : activeCaptain ? "Squad Ready" : "Captain Needed",
    healthTone:
      pendingCount > 0
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : activeCaptain
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-700",
  };
};

const normalizeRole = (role) => {
  const value = String(role || "").toLowerCase();
  if (value === "wicketkeeper") return "wicket_keeper";
  if (["batsman", "bowler", "all_rounder", "wicket_keeper"].includes(value)) return value;
  return "other";
};

const matchesPlayerRoleFilter = (player, filter) => {
  if (filter === "all") return true;
  return normalizeRole(player.role) === filter;
};

const sortTeams = (teams, sortBy) => {
  const sorted = [...teams];

  if (sortBy === "squad_size") {
    return sorted.sort((a, b) => b.squadSize - a.squadSize || a.name.localeCompare(b.name));
  }

  if (sortBy === "captain_name") {
    return sorted.sort((a, b) => a.captainName.localeCompare(b.captainName));
  }

  if (sortBy === "active_members") {
    return sorted.sort((a, b) => b.activeCount - a.activeCount || b.squadSize - a.squadSize);
  }

  return sorted.sort((a, b) => a.name.localeCompare(b.name));
};

function TeamsHeader({ onAddTeam }) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e293b_100%)] shadow-sm">
      <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <Badge className="border-white/10 bg-white/10 text-slate-100">Club Squads Hub</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Teams
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Manage club squads, captains, and player composition in one unified sports hub.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="h-11 rounded-xl border-white/15 bg-white/5 px-5 text-slate-100 hover:bg-white/10 hover:text-white"
          >
            View Fixtures
          </Button>
          <Button
            onClick={onAddTeam}
            className="h-11 rounded-xl bg-white px-5 text-slate-950 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        </div>
      </div>
    </section>
  );
}

function TeamsStatCard({ icon: Icon, label, value, helper, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <div className={`rounded-2xl p-2.5 ${toneMap[tone] || toneMap.slate}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TeamsStats({ totalTeams, totalPlayers, activeMembers, captainsAssigned, pendingMemberships }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <TeamsStatCard
        icon={Shield}
        label="Total Teams"
        value={totalTeams}
        helper="Registered club squads"
        tone="slate"
      />
      <TeamsStatCard
        icon={Users}
        label="Total Players"
        value={totalPlayers}
        helper="Across all teams"
        tone="blue"
      />
      <TeamsStatCard
        icon={Sparkles}
        label="Active Members"
        value={activeMembers}
        helper="Membership active"
        tone="emerald"
      />
      {/* <TeamsStatCard
        icon={Crown}
        label="Captains Assigned"
        value={captainsAssigned}
        helper="Squads with leaders"
        tone="amber"
      />
      <TeamsStatCard
        icon={Trophy}
        label="Pending Memberships"
        value={pendingMemberships}
        helper="Awaiting activation"
        tone="rose"
      /> */}
    </section>
  );
}

function TeamsToolbar({
  searchTerm,
  onSearchChange,
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full max-w-xl">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by team, captain, player, or role"
            className="h-11 rounded-xl border-slate-200"
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/*  */}

          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

function TeamStatStrip({ summary }) {
  const items = [
    { label: "Players", value: summary.squadSize },
    { label: "Active", value: summary.activeCount },
    { label: "Pending", value: summary.pendingCount },
    { label: "Avg Age", value: summary.averageAge ?? "--" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {item.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function TeamRosterPreview({ players }) {
  if (!players.length) {
    return <p className="text-sm text-slate-500">No squad members assigned yet.</p>;
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex -space-x-3">
        {players.map((player) => {
          const image = getPlayerImage(player);
          return (
            <div
              key={player.id}
              className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-slate-200"
            >
              {image ? (
                <Image
                  src={image}
                  alt={getPlayerFullName(player)}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-300 text-xs font-semibold text-slate-700">
                  {getPlayerFullName(player)
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part.charAt(0))
                    .join("")}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">
        {players.length} player{players.length === 1 ? "" : "s"} in preview
      </p>
    </div>
  );
}

function RoleChips({ breakdown }) {
  const items = [
    { label: "Batsmen", value: breakdown.batsman },
    { label: "Bowlers", value: breakdown.bowler },
    { label: "All-Rounders", value: breakdown.all_rounder },
    { label: "Keepers", value: breakdown.wicket_keeper },
  ].filter((item) => item.value > 0);

  if (breakdown.other > 0) {
    items.push({ label: "Other", value: breakdown.other });
  }

  if (items.length === 0) {
    return <p className="text-xs text-slate-500">Role mix will appear once players are assigned.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item.label} variant="outline" className="rounded-full border-slate-200 bg-white">
          {item.label}: {item.value}
        </Badge>
      ))}
    </div>
  );
}

function ExpandedPlayerList({ players, captainId }) {
  if (!players.length) {
    return <p className="text-sm text-slate-500">No squad members assigned yet.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {players.map((player) => {
        const image = getPlayerImage(player);
        const isCaptain = String(player.id) === String(captainId);
        return (
          <div
            key={player.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-200">
              {image ? (
                <Image
                  src={image}
                  alt={getPlayerFullName(player)}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-300 text-xs font-semibold text-slate-700">
                  {getPlayerFullName(player)
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part.charAt(0))
                    .join("")}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-slate-950">
                  {getPlayerFullName(player)}
                </p>
                {isCaptain ? (
                  <Badge className="border-amber-200 bg-amber-50 text-amber-700">Captain</Badge>
                ) : null}
                {player.membership_active ? (
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    Active
                  </Badge>
                ) : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{formatRoleLabel(player.role)}</span>
                {player.age ? <span>Age {player.age}</span> : null}
                {player.membership?.status ? <span>{player.membership.status}</span> : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatRoleLabel(role) {
  return String(role || "other")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function TeamIdentityBlock({ summary, featured = false }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`relative shrink-0 overflow-hidden rounded-[24px] border border-white/10 ${
          featured ? "h-20 w-20 bg-white/10" : "h-16 w-16 bg-slate-100"
        }`}
      >
        {summary.logoUrl ? (
          <Image
            src={summary.logoUrl}
            alt={summary.name}
            fill
            className="object-contain p-3"
            sizes={featured ? "80px" : "64px"}
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center ${
              featured ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            <Shield className={featured ? "h-8 w-8" : "h-6 w-6"} />
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={featured ? "border-white/10 bg-white/10 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}>
            Squad
          </Badge>
          {summary.captainPlayer ? (
            <Badge className={featured ? "border-amber-300/30 bg-amber-400/15 text-amber-100" : "border-amber-200 bg-amber-50 text-amber-700"}>
              Captain Assigned
            </Badge>
          ) : null}
          <Badge className={summary.healthTone}>{summary.healthLabel}</Badge>
        </div>

        <div>
          <h3 className={`text-2xl font-semibold tracking-tight ${featured ? "text-white" : "text-slate-950"}`}>
            {summary.name}
          </h3>
          <p className={`mt-1 text-sm ${featured ? "text-slate-300" : "text-slate-500"}`}>
            Captain: {summary.captainName}
          </p>
        </div>
      </div>
    </div>
  );
}

function TeamActions({ onEdit, onManage, featured = false, expanded = false, onToggleExpand }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant={featured ? "secondary" : "default"}
        className={featured ? "rounded-xl bg-white text-slate-950 hover:bg-slate-100" : "rounded-xl bg-slate-950 text-white hover:bg-slate-800"}
        onClick={onToggleExpand}
      >
        {expanded ? "Hide Squad" : "View Squad"}
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        className={featured ? "rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" : "rounded-xl"}
        onClick={onEdit}
      >
        Edit Team
      </Button>
      <Button
        variant="outline"
        className={featured ? "rounded-xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" : "rounded-xl"}
        onClick={onManage}
      >
        Manage Squad
      </Button>
    </div>
  );
}

function TeamCard({ summary, compact = false, expanded = false, onToggleExpand, onEdit }) {
  return (
    <article className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="space-y-4">
        <TeamIdentityBlock summary={summary} />
        <TeamStatStrip summary={summary} />
      </div>

      <div className={`mt-4 space-y-4 ${compact ? "" : "flex-1"}`}>
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Captain
            </p>
            <p className="mt-1 font-medium text-slate-900">{summary.captainName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Squad Status
            </p>
            <p className="mt-1 font-medium text-slate-900">{summary.healthLabel}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Role Distribution
          </p>
          <div className="mt-2">
            <RoleChips breakdown={summary.roleBreakdown} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Squad Preview
          </p>
          <div className="mt-3">
            <TeamRosterPreview players={summary.playerPreview} />
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950">Full Squad</p>
            <Badge className="border-slate-200 bg-slate-50 text-slate-700">
              {summary.players.length} players
            </Badge>
          </div>
          <ExpandedPlayerList players={summary.players} captainId={summary.captain} />
        </div>
      ) : null}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <TeamActions
          onEdit={() => onEdit(summary)}
          onManage={() => onEdit(summary)}
          onToggleExpand={onToggleExpand}
          expanded={expanded}
        />
      </div>
    </article>
  );
}

function TeamEmptyState({ onAddTeam }) {
  return (
    <section className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <Shield className="h-7 w-7 text-slate-400" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-slate-950">No teams created yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Add your first squad to start building the club competition structure.
      </p>
      <Button
        onClick={onAddTeam}
        className="mt-6 h-11 rounded-xl bg-slate-950 px-5 text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Add Team
      </Button>
    </section>
  );
}

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [expandedTeams, setExpandedTeams] = useState({});

  async function loadTeams() {
    const res = await clubService.getTeams();
    setTeams(res.data || []);
  }

  useEffect(() => {
    const initializeTeams = async () => {
      await loadTeams();
    };

    initializeTeams();
  }, []);

  const teamSummaries = useMemo(() => teams.map(buildTeamSummary), [teams]);

  const stats = useMemo(() => {
    const totalTeams = teamSummaries.length;
    const totalPlayers = teamSummaries.reduce((sum, team) => sum + team.squadSize, 0);
    const activeMembers = teamSummaries.reduce((sum, team) => sum + team.activeCount, 0);
    const captainsAssigned = teamSummaries.filter((team) => Boolean(team.captainPlayer)).length;
    const pendingMemberships = teamSummaries.reduce((sum, team) => sum + team.pendingCount, 0);

    return {
      totalTeams,
      totalPlayers,
      activeMembers,
      captainsAssigned,
      pendingMemberships,
    };
  }, [teamSummaries]);

  const visibleTeams = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const filtered = teamSummaries.filter((team) => {
      const matchingPlayers = (team.players || []).filter((player) =>
        matchesPlayerRoleFilter(player, filterBy)
      );

      if (filterBy !== "all" && matchingPlayers.length === 0) {
        return false;
      }

      const haystack = [
        team.name,
        team.captainName,
        ...(team.players || []).flatMap((player) => [
          getPlayerFullName(player),
          player.role || "",
        ]),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      return matchesSearch;
    });

    return sortTeams(filtered, sortBy);
  }, [teamSummaries, searchTerm, filterBy, sortBy]);

  const handleOpenCreate = () => {
    setSelectedTeam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const toggleTeamExpand = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  return (
    <div className="space-y-6">
      <TeamsHeader onAddTeam={handleOpenCreate} />

      <TeamsStats
        totalTeams={stats.totalTeams}
        totalPlayers={stats.totalPlayers}
        activeMembers={stats.activeMembers}
        captainsAssigned={stats.captainsAssigned}
        pendingMemberships={stats.pendingMemberships}
      />

      <TeamsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {teamSummaries.length === 0 ? (
        <TeamEmptyState onAddTeam={handleOpenCreate} />
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">All Teams</h2>
              <p className="text-sm text-slate-500">
                Expand each squad card to review the full player list and roles.
              </p>
            </div>
            <Badge className="border-slate-200 bg-white text-slate-700">
              {visibleTeams.length} visible
            </Badge>
          </div>

          {visibleTeams.length === 0 ? (
            <TeamEmptyState onAddTeam={handleOpenCreate} />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  summary={team}
                  onEdit={handleOpenEdit}
                  compact={false}
                  expanded={Boolean(expandedTeams[team.id])}
                  onToggleExpand={() => toggleTeamExpand(team.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <TeamModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        team={selectedTeam}
        onSuccess={loadTeams}
      />
    </div>
  );
}
