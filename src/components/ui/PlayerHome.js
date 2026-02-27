"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  Image as ImageIcon,
  LogOut,
  MapPin,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { clubService } from "@/services/clubService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

const normalizeUrl = (file) => {
  if (!file) return "";
  if (file.startsWith("http://") || file.startsWith("https://")) return file;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
  const needsSlash = file.startsWith("/") ? "" : "/";
  return `${base}${needsSlash}${file}`;
};

const formatDate = (value, withTime = false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, withTime ? {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  } : {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getMatchTitle = (match, teamNames = {}) => {
  if (!match) return "Match";
  if (match.external_opponent) return `vs ${match.external_opponent}`;
  const team1 = match.team1 || match.team1_id || match.team_1 || null;
  const team2 = match.team2 || match.team2_id || match.team_2 || null;
  const team1Name = match.team1_name || (team1 ? teamNames[team1] : null);
  const team2Name = match.team2_name || (team2 ? teamNames[team2] : null);
  if (team1Name && team2Name) return `${team1Name} vs ${team2Name}`;
  if (team1 && team2) return `Team #${team1} vs Team #${team2}`;
  return match.title || "Match";
};

export default function PlayerHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({});
  const [activeTab, setActiveTab] = useState("home");
  const [uploading, setUploading] = useState(false);
  const [lineups, setLineups] = useState([]);
  const [lineupsLoading, setLineupsLoading] = useState(false);
  const [playerMap, setPlayerMap] = useState({});
  const [groundMap, setGroundMap] = useState({});
  const [playerList, setPlayerList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showOtherTeams, setShowOtherTeams] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    media_type: "photo",
    file: null,
  });

  const loadDashboard = async () => {
    try {
      const res = await clubService.getPlayerDashboard();
      setDashboard(res.data || {});
    } catch (error) {
      console.error("Failed to load player dashboard", error);
      toast.error("Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("club_token");
    if (!token) {
      router.replace("/");
      return;
    }
    loadDashboard();
  }, []);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [playersRes, groundsRes] = await Promise.all([
          clubService.getPlayers(),
          clubService.getGrounds(),
        ]);
        const playersData = playersRes.data || [];
        setPlayerList(playersData);
        const pMap = {};
        playersData.forEach((player) => {
          if (!player?.id) return;
          const fullName = `${player.first_name || ""} ${player.last_name || ""}`.trim();
          pMap[player.id] = fullName || `Player #${player.id}`;
        });
        setPlayerMap(pMap);
        const gMap = {};
        (groundsRes.data || []).forEach((ground) => {
          if (!ground?.id) return;
          gMap[ground.id] = ground.name || `Ground #${ground.id}`;
        });
        setGroundMap(gMap);
      } catch (error) {
        console.error("Failed to load lookup data", error);
      }
    };
    loadLookups();
  }, []);

  const player = dashboard.player || {};
  const myTeams = dashboard.teams || dashboard.my_teams || [];
  const upcomingMatches = dashboard.upcoming_matches || dashboard.upcomingMatches || [];
  const lastTransaction = dashboard.last_transaction || dashboard.lastTransaction || null;
  const membership = dashboard?.player?.membership || dashboard.membership || {};
  const membershipPayment = dashboard.membership_payment || {};
  const recentMedia = dashboard.recent_media || dashboard.recentMedia || [];
  const otherTeams = dashboard.other_teams || [];
  const playerId = player.id || dashboard.player_id || null;

  const pendingTransaction = useMemo(() => {
    const unpaid = transactions.filter((tx) => tx && tx.paid === false);
    if (unpaid.length === 0) return null;
    return unpaid.sort((a, b) => {
      const aDate = new Date(a.due_date || a.payment_date || 0).getTime();
      const bDate = new Date(b.due_date || b.payment_date || 0).getTime();
      return aDate - bDate;
    })[0];
  }, [transactions]);

  const pendingTransactionId =
    pendingTransaction?.id ||
    membershipPayment.transaction?.id ||
    membershipPayment.transaction ||
    membership.pending_transaction_id ||
    membership.transaction_id ||
    membership.payment_transaction_id ||
    null;
  const hasPendingPayment = Boolean(pendingTransactionId || membershipPayment.required);
  const nextDueDate =
    pendingTransaction?.due_date ||
    lastTransaction?.due_date ||
    membership.next_due_date ||
    null;

  const membershipStatus =
    membership.status ||
    (player.membership_active ? "Active" : membership.is_active ? "Active" : "Inactive");
  const displayName =
    [player.first_name, player.last_name].filter(Boolean).join(" ").trim() ||
    localStorage.getItem("club_user_name") ||
    "Player";
  const avatarSrc = dashboard.profile_picture ? normalizeUrl(dashboard.profile_picture) : "";

  const grounds = useMemo(() => {
    const seen = new Map();
    upcomingMatches.forEach((match) => {
      const label =
        match.ground_name ||
        (match.ground ? groundMap[match.ground] || `Ground #${match.ground}` : "");
      if (!label) return;
      if (!seen.has(label)) {
        seen.set(label, {
          id: match.ground || label,
          name: label,
          nextMatch: match.date || null,
        });
      }
    });
    return Array.from(seen.values());
  }, [groundMap, upcomingMatches]);

  const matchesKey = useMemo(() => {
    return upcomingMatches.map((match) => match.id).sort().join("|");
  }, [upcomingMatches]);

  const teamsKey = useMemo(() => {
    return myTeams.map((team) => team.id).sort().join("|");
  }, [myTeams]);

  const teamMap = useMemo(() => {
    if (dashboard.team_map && typeof dashboard.team_map === "object") {
      return dashboard.team_map;
    }
    const map = {};
    const list = [
      ...(Array.isArray(dashboard.teams) ? dashboard.teams : []),
      ...(Array.isArray(dashboard.other_teams) ? dashboard.other_teams : []),
      ...myTeams,
    ];
    list.forEach((team) => {
      if (!team?.id) return;
      map[team.id] = team.name || `Team #${team.id}`;
    });
    return map;
  }, [dashboard, myTeams]);

  const playerNameMap = useMemo(() => {
    if (dashboard.player_map && typeof dashboard.player_map === "object") {
      return dashboard.player_map;
    }
    const map = {};
    const list = [];
    if (dashboard.player) list.push(dashboard.player);
    if (Array.isArray(dashboard.players)) list.push(...dashboard.players);
    if (Array.isArray(dashboard.other_teams)) {
      dashboard.other_teams.forEach((team) => {
        if (Array.isArray(team.players)) list.push(...team.players);
      });
    }
    list.forEach((player) => {
      if (!player?.id) return;
      const fullName = `${player.first_name || ""} ${player.last_name || ""}`.trim();
      map[player.id] = fullName || `Player #${player.id}`;
    });
    Object.keys(playerMap).forEach((key) => {
      if (!map[key]) {
        map[key] = playerMap[key];
      }
    });
    return map;
  }, [dashboard, playerMap]);

  const getMatchTeams = (match) => {
    const team1 = match.team1 || match.team1_id || match.team_1 || null;
    const team2 = match.team2 || match.team2_id || match.team_2 || null;
    return [team1, team2].filter(Boolean);
  };

  const getEntryName = (entry) => {
    if (entry.player_detail) {
      const fullName = `${entry.player_detail.first_name || ""} ${entry.player_detail.last_name || ""}`.trim();
      if (fullName) return fullName;
    }
    if (entry.player_full_name) return entry.player_full_name;
    if (entry.player_name) return entry.player_name;
    if (entry.player_info?.name) return entry.player_info.name;
    if (entry.player && playerNameMap[entry.player]) return playerNameMap[entry.player];
    if (entry.player) return `Player #${entry.player}`;
    return "Player";
  };

  const loadLineups = async () => {
    if (!upcomingMatches.length || !myTeams.length) {
      setLineups([]);
      return;
    }
    setLineupsLoading(true);
    try {
      const myTeamIds = new Set(myTeams.map((team) => team.id));
      const lineupRequests = [];
      upcomingMatches.forEach((match) => {
        getMatchTeams(match).forEach((teamId) => {
          if (myTeamIds.has(teamId)) {
            lineupRequests.push(
              clubService.getLineups({ match: match.id, team: teamId }).then((res) => ({
                match,
                teamId,
                data: Array.isArray(res.data) ? res.data[0] : res.data,
              }))
            );
          }
        });
      });
      const results = await Promise.allSettled(lineupRequests);
      const resolved = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .filter((item) => item.data);
      setLineups(resolved);
    } catch (error) {
      console.error("Failed to load lineups", error);
      setLineups([]);
    } finally {
      setLineupsLoading(false);
    }
  };

  useEffect(() => {
    loadLineups();
  }, [matchesKey, teamsKey]);

  useEffect(() => {
    const loadTransactions = async () => {
      if (!playerId) return;
      setTransactionsLoading(true);
      try {
        const res = await clubService.getTransactions();
        const all = Array.isArray(res.data) ? res.data : [];
        const mine = all.filter((tx) => tx.player === playerId);
        setTransactions(mine);
      } catch (error) {
        console.error("Failed to load transactions", error);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };
    loadTransactions();
  }, [playerId]);

  const handlePayNow = async () => {
    if (!pendingTransactionId) return;
    const toastId = toast.loading("Starting payment...");
    try {
      const res = await clubService.initiatePayment(pendingTransactionId);
      const { payment_url, merchant_transaction_id } = res.data || {};
      if (payment_url) {
        toast.success("Redirecting to payment gateway...", { id: toastId });
        if (merchant_transaction_id) {
          sessionStorage.setItem("current_transaction_id", merchant_transaction_id);
        }
        window.location.href = payment_url;
      } else {
        toast.error("Payment initiated but no URL returned.", { id: toastId });
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Payment initiation failed. Please try again.", { id: toastId });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("club_token");
    localStorage.removeItem("club_refresh_token");
    localStorage.removeItem("club_user_name");
    localStorage.removeItem("club_user_role");
    localStorage.removeItem("club_dashboard_url");
    localStorage.removeItem("club_player_id");
    localStorage.removeItem("club_player_role");
    router.push("/login");
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!uploadForm.file) {
      toast.error("Please select a file to upload.");
      return;
    }

    const payload = new FormData();
    payload.append("file", uploadForm.file);
    payload.append("media_type", uploadForm.media_type);
    if (uploadForm.title) payload.append("title", uploadForm.title);

    try {
      setUploading(true);
      await clubService.uploadMedia(payload);
      toast.success("Media uploaded.");
      setUploadForm({ title: "", media_type: "photo", file: null });
      await loadDashboard();
    } catch (error) {
      console.error("Failed to upload media", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading your club home...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-(--kk-line) bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-(--kk-line) bg-(--kk-cream)">
              {avatarSrc ? (
                <img src={avatarSrc} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-(--kk-field)">
                  {displayName[0] || "P"}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--kk-field)">KK Cricket Club</p>
              <h1 className="mt-2 text-2xl font-semibold text-(--kk-ink) md:text-3xl">
                Welcome, {displayName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-(--kk-line) text-(--kk-ink)">
                  Membership: {membershipStatus || "Unknown"}
                </Badge>
                {nextDueDate && (
                  <span className="text-xs text-(--kk-ink)/60">
                    Next due: {formatDate(nextDueDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-(--kk-ember) text-white hover:opacity-90">
              <Link href="/player/transactions">Check Transactions</Link>
            </Button>
            <Button variant="outline" onClick={handleLogout} className="border-(--kk-line) text-(--kk-ink)">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </section>

      {hasPendingPayment && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-600">Payment Pending</p>
              <h2 className="mt-2 text-lg font-semibold text-red-800">Membership fee is due</h2>
              <p className="text-sm text-red-700/80">Clear your pending payment to keep your membership active.</p>
            </div>
            <div className="flex flex-wrap gap-3">
            <Button onClick={handlePayNow} disabled={!pendingTransactionId} className="bg-red-600 text-white hover:bg-red-700">
              Pay Now
            </Button>
            <Button asChild variant="outline" className="border-red-200 text-red-700">
              <Link href="/payment/status">Check Status</Link>
            </Button>
            </div>
          </div>
        </section>
      )}

      {activeTab === "home" && (
        <>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-(--kk-line) text-(--kk-ink)"
              onClick={() => setShowPlayers((prev) => !prev)}
            >
              {showPlayers ? "Hide Players" : "View All Players"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-(--kk-line) text-(--kk-ink)"
              onClick={() => setShowOtherTeams((prev) => !prev)}
            >
              {showOtherTeams ? "Hide Other Teams" : "View Other Teams"}
            </Button>
          </div>
          {showPlayers && (
            <Card className="border-(--kk-line) bg-white">
              <CardHeader>
                <CardTitle>All Players</CardTitle>
                <CardDescription>Club roster at a glance.</CardDescription>
              </CardHeader>
              <CardContent>
                {playerList.length === 0 ? (
                  <div className="text-sm text-(--kk-ink)/60">No players to show.</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {playerList.map((playerItem) => {
                      const fullName = `${playerItem.first_name || ""} ${playerItem.last_name || ""}`.trim();
                      return (
                        <div key={playerItem.id} className="rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4">
                          <div className="text-sm font-semibold text-(--kk-ink)">
                            {fullName || `Player #${playerItem.id}`}
                          </div>
                          <div className="mt-1 text-xs text-(--kk-ink)/60">
                            {playerItem.role || "Player"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {showOtherTeams && (
            <Card className="border-(--kk-line) bg-white">
              <CardHeader>
                <CardTitle>Other Teams</CardTitle>
                <CardDescription>Teams across the club.</CardDescription>
              </CardHeader>
              <CardContent>
                {otherTeams.length === 0 ? (
                  <div className="text-sm text-(--kk-ink)/60">No other teams to show.</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {otherTeams.map((team) => (
                      <div key={team.id} className="rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4">
                        <div className="text-sm font-semibold text-(--kk-ink)">{team.name || `Team #${team.id}`}</div>
                        <div className="mt-1 text-xs text-(--kk-ink)/60">
                          Captain: {team.captain_name || playerNameMap[team.captain] || `Player #${team.captain}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-(--kk-line) bg-white">
              <CardHeader>
                <CardTitle>Match Roster</CardTitle>
                <CardDescription>Upcoming fixtures with time and venue.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingMatches.length === 0 ? (
                    <div className="text-sm text-slate-500">No upcoming matches.</div>
                  ) : (
                    upcomingMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex flex-col gap-3 rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-(--kk-ink)">{getMatchTitle(match, teamMap)}</p>
                          <p className="text-xs text-(--kk-ink)/60">
                            {formatDate(match.date, true)} •{" "}
                            {match.ground_name ||
                              (match.ground ? groundMap[match.ground] || `Ground #${match.ground}` : "-")}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-(--kk-line) text-(--kk-ink)">
                          {match.result ? "Completed" : "Scheduled"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-(--kk-line) bg-white">
              <CardHeader>
                <CardTitle>My Teams</CardTitle>
                <CardDescription>Teams you are registered with.</CardDescription>
              </CardHeader>
              <CardContent>
                {myTeams.length === 0 ? (
                  <div className="text-sm text-slate-500">No teams assigned yet.</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {myTeams.map((team) => (
                      <div key={team.id} className="rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-(--kk-ink)">{team.name || `Team #${team.id}`}</p>
                          <Users className="h-4 w-4 text-(--kk-field)" />
                        </div>
                        <p className="mt-2 text-xs text-(--kk-ink)/60">
                          {team.captain_name || team.captain
                            ? `Captain: ${team.captain_name || playerNameMap[team.captain] || `Player #${team.captain}`}`
                            : "Squad member"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <Card className="border-(--kk-line) bg-white">
            <CardHeader>
              <CardTitle>Lineups</CardTitle>
              <CardDescription>Your confirmed match lineups.</CardDescription>
            </CardHeader>
            <CardContent>
              {lineupsLoading ? (
                <div className="text-sm text-(--kk-ink)/60">Loading lineups...</div>
              ) : lineups.length === 0 ? (
                <div className="text-sm text-(--kk-ink)/60">No lineups available yet.</div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {lineups.map((lineup) => (
                    <div key={`${lineup.match.id}-${lineup.teamId}`} className="rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-(--kk-ink)">
                          {getMatchTitle(lineup.match, teamMap)}
                        </p>
                        <p className="text-xs text-(--kk-ink)/60">
                          {teamMap[lineup.teamId] || `Team #${lineup.teamId}`} • {formatDate(lineup.match.date, true)}
                        </p>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        {(lineup.data?.entries || []).map((entry) => (
                          <div key={`${lineup.match.id}-${entry.player}`} className="flex items-center justify-between rounded-lg border border-(--kk-line) bg-white px-3 py-2">
                            <span>{entry.batting_order}. {getEntryName(entry)}</span>
                            <div className="flex items-center gap-2 text-[10px] uppercase text-(--kk-ink)/60">
                              {entry.role && <span>{entry.role.replace("_", " ")}</span>}
                              {entry.is_captain && <span className="text-(--kk-field)">Captain</span>}
                              {entry.is_wicket_keeper && <span>WK</span>}
                            </div>
                          </div>
                        ))}
                        {(!lineup.data?.entries || lineup.data.entries.length === 0) && (
                          <div className="text-xs text-(--kk-ink)/60">No entries yet.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-(--kk-line) bg-white">
            <CardHeader>
              <CardTitle>Grounds</CardTitle>
              <CardDescription>Upcoming venues in a quick carousel.</CardDescription>
            </CardHeader>
            <CardContent>
              {grounds.length === 0 ? (
                <div className="text-sm text-slate-500">No grounds to show.</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {grounds.map((ground) => (
                    <div
                      key={ground.id}
                      className="min-w-[220px] rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4"
                    >
                      <div className="flex items-center justify-between text-sm font-semibold text-(--kk-ink)">
                        <span>{ground.name}</span>
                        <MapPin className="h-4 w-4 text-(--kk-ember)" />
                      </div>
                      <p className="mt-2 text-xs text-(--kk-ink)/60">
                        Next match: {ground.nextMatch ? formatDate(ground.nextMatch, true) : "TBA"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "membership" && (
        <Card className="border-(--kk-line) bg-white">
          <CardHeader>
            <CardTitle>Membership & Payments</CardTitle>
            <CardDescription>Keep track of your membership status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-(--kk-field)" />
                <div>
                  <p className="text-sm font-semibold text-(--kk-ink)">Status: {membershipStatus || "Unknown"}</p>
                  <p className="text-xs text-(--kk-ink)/60">
                    {nextDueDate ? `Next due: ${formatDate(nextDueDate)}` : "No due date"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-(--kk-ink)">Last Transaction</p>
                  <p className="text-xs text-(--kk-ink)/60">
                    {lastTransaction?.payment_date ? formatDate(lastTransaction.payment_date) : "No transactions yet"}
                  </p>
                </div>
                <div className="text-lg font-semibold text-(--kk-ink)">
                  {lastTransaction?.amount ? `₹${parseFloat(lastTransaction.amount).toLocaleString()}` : "-"}
                </div>
              </div>
              <Button onClick={handlePayNow} disabled={!pendingTransactionId} className="mt-4 w-full bg-(--kk-ember) text-white hover:opacity-90">
                Pay Membership
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "media" && (
        <Card className="border-(--kk-line) bg-white">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>Upload moments from training and matches.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-[1.1fr_0.8fr_1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--kk-ink)">Title</label>
                <Input
                  value={uploadForm.title}
                  onChange={(event) => setUploadForm({ ...uploadForm, title: event.target.value })}
                  placeholder="e.g. Net session highlights"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--kk-ink)">Media Type</label>
                <select
                  className="h-10 w-full rounded-md border border-(--kk-line) bg-white px-3 text-sm text-(--kk-ink)"
                  value={uploadForm.media_type}
                  onChange={(event) => setUploadForm({ ...uploadForm, media_type: event.target.value })}
                >
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--kk-ink)">File</label>
                <input
                  className="block w-full text-sm text-(--kk-ink) file:mr-4 file:rounded-md file:border-0 file:bg-(--kk-cream) file:px-3 file:py-2 file:text-sm file:font-semibold file:text-(--kk-field) hover:file:bg-(--kk-line)"
                  type="file"
                  accept={uploadForm.media_type === "video" ? "video/*" : "image/*"}
                  onChange={(event) => setUploadForm({ ...uploadForm, file: event.target.files?.[0] || null })}
                />
              </div>
              <Button type="submit" disabled={uploading} className="gap-2 bg-(--kk-ember) text-white hover:opacity-90">
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>

            {uploadForm.file && (
              <div className="mt-4 flex items-center gap-3 text-xs text-(--kk-ink)/60">
                <ImageIcon className="h-4 w-4" />
                Selected: {uploadForm.file?.name}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentMedia.length === 0 ? (
                <div className="text-sm text-(--kk-ink)/60">No recent media yet.</div>
              ) : (
                recentMedia.map((item) => {
                  const mediaType = (item.media_type || "").toLowerCase();
                  const src = normalizeUrl(item.file);
                  return (
                    <div key={item.id} className="overflow-hidden rounded-xl border border-(--kk-line) bg-(--kk-cream)">
                      <div className="h-40 w-full bg-(--kk-line)">
                        {mediaType === "video" ? (
                          <video className="h-full w-full object-cover" src={src} />
                        ) : (
                          <img className="h-full w-full object-cover" src={src} alt={item.title || "Media"} />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-(--kk-ink)">{item.title || "Untitled"}</p>
                        <p className="text-xs text-(--kk-ink)/60">
                          {formatDate(item.uploaded_at)} • {item.media_type || "Media"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-(--kk-line) bg-(--kk-sand)/95 px-4 py-2 shadow-[0_-12px_30px_-20px_rgba(18,24,32,0.4)] backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "membership", label: "Membership", icon: ShieldCheck },
            { id: "media", label: "Media", icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  isActive ? "text-(--kk-field)" : "text-(--kk-ink)/50"
                }`}
              >
                <span className={`rounded-xl p-2 ${isActive ? "bg-(--kk-cream)" : "bg-transparent"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
