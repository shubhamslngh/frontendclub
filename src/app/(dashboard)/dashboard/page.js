"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { clubService } from '@/services/clubService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Trophy, CalendarDays, IndianRupee, ArrowUpRight, 
  Activity, ArrowRight, ShieldCheck, AlertTriangle, MapPin, ReceiptText, UserRoundPlus, ImageIcon, CheckCircle2, ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { normalizeMatchStatus } from "@/lib/matches";

const FALLBACK_MEDIA_BASE = "http://127.0.0.1:8000";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    playerCount: 0,
    activeMembers: 0,
    teamCount: 0,
    upcomingMatches: [],
    pendingResults: [],
    pendingRegistrations: [],
    pendingMedia: [],
    recentTransactions: [],
    pendingInvoices: [],
    totalRevenue: 0,
    groundMap: {},
    teamMap: {},
    playerMap: {}
  });
  const [loading, setLoading] = useState(true);
  const [generatingInvoices, setGeneratingInvoices] = useState(false);
  const [approvingRegistrationId, setApprovingRegistrationId] = useState(null);
  const [decliningRegistrationId, setDecliningRegistrationId] = useState(null);
  const [approvingMediaId, setApprovingMediaId] = useState(null);
  const [decliningMediaId, setDecliningMediaId] = useState(null);
  const [settlingTransactionId, setSettlingTransactionId] = useState(null);

  const loadDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [playersRes, teamsRes, matchesRes, financeRes, groundsRes, registrationsRes, mediaRes] = await Promise.all([
        clubService.getPlayers(),
        clubService.getTeams(),
        clubService.getMatches(),
        clubService.getTransactions(),
        clubService.getGrounds(),
        clubService.getPendingRegistrations(),
        clubService.getMedia()
      ]);

      const players = playersRes.data;
      const matches = matchesRes.data;
      const transactions = financeRes.data;
      const grounds = groundsRes.data;
      const pendingRegistrations = Array.isArray(registrationsRes.data) ? registrationsRes.data : [];
      const mediaItems = Array.isArray(mediaRes.data) ? mediaRes.data : [];

      // 1. Player Stats
      const activeMembers = players.filter(p => p.membership_active).length;

      // 2. Match Stats (Filter for future dates)
      const now = new Date();
      const groundMap = {};
      grounds.forEach((ground) => {
        groundMap[ground.id] = ground.name;
      });

      const teamMap = {};
      teamsRes.data.forEach((team) => {
        teamMap[team.id] = team.name;
      });
      const playerMap = {};
      players.forEach((player) => {
        playerMap[player.id] = `${player.first_name} ${player.last_name}`;
      });

      const upcoming = matches
        .filter(m => new Date(m.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3); // Get next 3 matches

      const pendingResults = matches
        .filter((m) => {
          const matchDate = new Date(m.date);
          return matchDate <= now && normalizeMatchStatus(m) !== "completed";
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      // 3. Finance Stats (Sum of all paid transactions)
      const revenue = transactions
        .filter(t => t.paid)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      // Get last 4 transactions for the list
      const recentTx = transactions
        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
        .slice(0, 4);

      // Filter pending invoices (Assuming API returns all. Ideally backend filters for user)
      // For now, displaying all unpaid transactions as "Pending Dues"
      const pending = transactions
        .filter(t => !t.paid)
        .sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

      const pendingMedia = mediaItems
        .filter((item) => item && item.is_approved === false)
        .sort((a, b) => new Date(b.uploaded_at || b.created_at || 0) - new Date(a.uploaded_at || a.created_at || 0));

      setStats({
        playerCount: players.length,
        activeMembers,
        teamCount: teamsRes.data.length,
        upcomingMatches: upcoming,
        pendingResults,
        pendingRegistrations,
        pendingMedia,
        recentTransactions: recentTx,
        pendingInvoices: pending,
        totalRevenue: revenue,
        groundMap,
        teamMap,
        playerMap
      });
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.error) return data.error;
    try {
      return JSON.stringify(data);
    } catch {
      return fallback;
    }
  };

  const formatTransactionDate = (value) => {
    if (!value) return "No due date";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : format(date, "MMM d, yyyy");
  };

  const normalizeMediaUrl = (file) => {
    if (!file) return "";
    if (file.startsWith("http://") || file.startsWith("https://")) return file;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || FALLBACK_MEDIA_BASE;
    const needsSlash = file.startsWith("/") ? "" : "/";
    return `${base}${needsSlash}${file}`;
  };

  const getTransactionPlayerName = (transaction) => {
    if (transaction.player_detail) {
      const fullName = `${transaction.player_detail.first_name || ""} ${transaction.player_detail.last_name || ""}`.trim();
      if (fullName) return fullName;
    }
    if (transaction.player_full_name) return transaction.player_full_name;
    if (transaction.player_name) return transaction.player_name;
    if (transaction.player_info?.name) return transaction.player_info.name;
    if (transaction.player && stats.playerMap[transaction.player]) return stats.playerMap[transaction.player];
    if (transaction.player) return `Player #${transaction.player}`;
    return "Unknown Player";
  };

  const getMediaUploaderName = (item) => {
    if (item.uploaded_by_name) return item.uploaded_by_name;
    if (item.uploaded_by_detail?.full_name) return item.uploaded_by_detail.full_name;
    if (item.uploaded_by_detail) {
      const fullName = `${item.uploaded_by_detail.first_name || ""} ${item.uploaded_by_detail.last_name || ""}`.trim();
      if (fullName) return fullName;
    }
    if (item.user_name) return item.user_name;
    if (item.player_name) return item.player_name;
    if (item.uploaded_by) return `User #${item.uploaded_by}`;
    return "Unknown uploader";
  };

  const handleGenerateMonthlyInvoices = async () => {
    const toastId = toast.loading("Generating monthly membership invoices...");
    try {
      setGeneratingInvoices(true);
      const res = await clubService.generateMonthlyInvoices();
      const data = res.data || {};
      const billingDate = data.billing_date
        ? format(new Date(data.billing_date), "MMMM yyyy")
        : "this month";

      toast.success(
        `Invoices generated for ${billingDate}: ${data.created_invoices || 0} created, ${data.skipped_existing || 0} skipped.`,
        { id: toastId }
      );
      await loadDashboardData();
    } catch (error) {
      console.error("Monthly invoice generation failed:", error);
      toast.error(
        getErrorMessage(error, "Could not generate monthly invoices."),
        { id: toastId }
      );
    } finally {
      setGeneratingInvoices(false);
    }
  };

  const handleApproveRegistration = async (registration) => {
    const fullName = [registration.first_name, registration.last_name].filter(Boolean).join(" ").trim();
    const toastId = toast.loading(`Approving ${fullName || registration.phone_number}...`);

    try {
      setApprovingRegistrationId(registration.id);
      await clubService.approveRegistration(registration.id);
      toast.success(`${fullName || registration.phone_number} approved successfully.`, { id: toastId });
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to approve registration:", error);
      toast.error(getErrorMessage(error, "Could not approve registration."), { id: toastId });
    } finally {
      setApprovingRegistrationId(null);
    }
  };

  const handleDeclineRegistration = async (registration) => {
    const fullName = [registration.first_name, registration.last_name].filter(Boolean).join(" ").trim();
    const label = fullName || registration.phone_number || `Request #${registration.id}`;
    const confirmed = window.confirm(`Decline ${label}'s registration request?`);
    if (!confirmed) return;

    const toastId = toast.loading(`Declining ${label}...`);

    try {
      setDecliningRegistrationId(registration.id);
      await clubService.rejectRegistration(registration.id);
      toast.success(`${label} declined successfully.`, { id: toastId });
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to decline registration:", error);
      toast.error(getErrorMessage(error, "Could not decline registration."), { id: toastId });
    } finally {
      setDecliningRegistrationId(null);
    }
  };

  const handleSettleCashPayment = async (transaction) => {
    const playerName = getTransactionPlayerName(transaction);
    const toastId = toast.loading(`Settling ${playerName}'s payment...`);

    try {
      setSettlingTransactionId(transaction.id);
      await clubService.updateTransaction(transaction.id, {
        paid: true,
        payment_date: new Date().toISOString().split("T")[0],
      });
      toast.success(`Marked ${playerName}'s payment as settled.`, { id: toastId });
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to settle payment:", error);
      toast.error(getErrorMessage(error, "Could not settle this payment."), { id: toastId });
    } finally {
      setSettlingTransactionId(null);
    }
  };

  const handleApproveMedia = async (item) => {
    const label = item.title || item.file_name || `Media #${item.id}`;
    const toastId = toast.loading(`Approving ${label}...`);

    try {
      setApprovingMediaId(item.id);
      await clubService.approveMedia(item.id);
      toast.success(`${label} approved successfully.`, { id: toastId });
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to approve media:", error);
      toast.error(getErrorMessage(error, "Could not approve this media item."), { id: toastId });
    } finally {
      setApprovingMediaId(null);
    }
  };

  const handleDeclineMedia = async (item) => {
    const label = item.title || item.file_name || `Media #${item.id}`;
    const confirmed = window.confirm(`Decline ${label}? This will remove the pending upload.`);
    if (!confirmed) return;

    const toastId = toast.loading(`Declining ${label}...`);

    try {
      setDecliningMediaId(item.id);
      await clubService.deleteMedia(item.id);
      toast.success(`${label} declined successfully.`, { id: toastId });
      await loadDashboardData();
    } catch (error) {
      console.error("Failed to decline media:", error);
      toast.error(getErrorMessage(error, "Could not decline this media item."), { id: toastId });
    } finally {
      setDecliningMediaId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your club&apos;s performance today.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={handleGenerateMonthlyInvoices}
            disabled={generatingInvoices}
          >
            <ReceiptText className="h-4 w-4" />
            {generatingInvoices ? "Generating..." : "Generate Monthly Fee"}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/matches">Schedule Match</Link>
          </Button>
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/players">Add Player</Link>
          </Button>
        </div>
      </div>

      {stats.pendingRegistrations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                  <UserRoundPlus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-blue-900">Pending Player Registrations</CardTitle>
                  <CardDescription className="mt-1 text-blue-700">
                    {stats.pendingRegistrations.length} registration{stats.pendingRegistrations.length === 1 ? "" : "s"} waiting for admin approval.
                  </CardDescription>
                </div>
              </div>
              <Badge className="w-fit bg-blue-600 hover:bg-blue-600">
                {stats.pendingRegistrations.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingRegistrations.slice(0, 5).map((registration) => {
              const fullName = [registration.first_name, registration.last_name].filter(Boolean).join(" ").trim();
              const requestedAt = registration.created_at || registration.requested_at || registration.date_created;

              return (
                <div
                  key={registration.id}
                  className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{fullName || "Unnamed Request"}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{registration.phone_number}</span>
                      {requestedAt && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                          {format(new Date(requestedAt), "MMM d, yyyy h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
                      onClick={() => handleDeclineRegistration(registration)}
                      disabled={approvingRegistrationId === registration.id || decliningRegistrationId === registration.id}
                    >
                      {decliningRegistrationId === registration.id ? "Declining..." : "Decline"}
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={() => handleApproveRegistration(registration)}
                      disabled={approvingRegistrationId === registration.id || decliningRegistrationId === registration.id}
                    >
                      {approvingRegistrationId === registration.id ? "Approving..." : "Approve Registration"}
                    </Button>
                  </div>
                </div>
              );
            })}
            {stats.pendingRegistrations.length > 5 && (
              <p className="text-xs text-blue-700">
                +{stats.pendingRegistrations.length - 5} more pending registration{stats.pendingRegistrations.length - 5 === 1 ? "" : "s"}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {stats.pendingResults.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-amber-800">Past Matches Need Results</CardTitle>
                  <CardDescription className="mt-1 text-amber-700">
                    {stats.pendingResults.length} past {stats.pendingResults.length === 1 ? "match is" : "matches are"} still missing a result. Update them from the matches page.
                  </CardDescription>
                </div>
              </div>
              <Button className="w-full sm:w-auto" asChild>
                <Link href="/matches">Set Match Results</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.pendingResults.slice(0, 3).map((match) => {
              const opponentLabel = match.external_opponent
                ? `${stats.teamMap[match.team1] || "Team 1"} vs ${match.external_opponent}`
                : `${stats.teamMap[match.team1] || "Team 1"} vs ${stats.teamMap[match.team2] || "Team 2"}`;

              return (
                <div
                  key={match.id}
                  className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{opponentLabel}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
                        {format(new Date(match.date), "MMM d, yyyy h:mm a")}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-amber-600" />
                        {stats.groundMap[match.ground] || `Ground #${match.ground}`}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit border-amber-300 text-amber-800">
                    Result Pending
                  </Badge>
                </div>
              );
            })}
            {stats.pendingResults.length > 3 && (
              <p className="text-xs text-amber-700">
                +{stats.pendingResults.length - 3} more pending result{stats.pendingResults.length - 3 === 1 ? "" : "s"}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {stats.pendingMedia.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50">
          <details className="group" open>
            <summary className="cursor-pointer list-none">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-900">Pending Media Uploads</CardTitle>
                      <CardDescription className="mt-1 text-emerald-700">
                        {stats.pendingMedia.length} media upload{stats.pendingMedia.length === 1 ? "" : "s"} waiting for approval before appearing publicly.
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="w-fit bg-emerald-600 hover:bg-emerald-600">
                      {stats.pendingMedia.length} Pending
                    </Badge>
                    <ChevronDown className="h-5 w-5 text-emerald-700 transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </CardHeader>
            </summary>
            <CardContent className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/media">Open Media Library</Link>
                </Button>
              </div>
              {stats.pendingMedia.slice(0, 5).map((item) => {
                const mediaLabel = item.title || item.file_name || `Media #${item.id}`;
                const mediaType = (item.media_type || "media").toLowerCase();
                const previewUrl = normalizeMediaUrl(item.file);
                const uploadedAt = item.uploaded_at || item.created_at;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-lg border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-20 overflow-hidden rounded-md border border-emerald-100 bg-emerald-50">
                        {mediaType === "video" ? (
                          <video className="h-full w-full object-cover" src={previewUrl} />
                        ) : (
                          <img className="h-full w-full object-cover" src={previewUrl} alt={mediaLabel} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{mediaLabel}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <Badge variant="outline" className="capitalize">{mediaType}</Badge>
                          <span>{getMediaUploaderName(item)}</span>
                          {uploadedAt && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                              {format(new Date(uploadedAt), "MMM d, yyyy h:mm a")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
                        onClick={() => handleDeclineMedia(item)}
                        disabled={approvingMediaId === item.id || decliningMediaId === item.id}
                      >
                        {decliningMediaId === item.id ? "Declining..." : "Decline"}
                      </Button>
                      <Button
                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
                        onClick={() => handleApproveMedia(item)}
                        disabled={approvingMediaId === item.id || decliningMediaId === item.id}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {approvingMediaId === item.id ? "Approving..." : "Approve"}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {stats.pendingMedia.length > 5 && (
                <p className="text-xs text-emerald-700">
                  +{stats.pendingMedia.length - 5} more pending media upload{stats.pendingMedia.length - 5 === 1 ? "" : "s"}.
                </p>
              )}
            </CardContent>
          </details>
        </Card>
      )}

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.playerCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeMembers} active memberships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamCount}</div>
            <p className="text-xs text-muted-foreground">Squads active this season</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>Collected YTD</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Match</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingMatches.length > 0 
                ? format(new Date(stats.upcomingMatches[0].date), "MMM d") 
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {stats.upcomingMatches.length > 0 
                ? stats.groundMap[stats.upcomingMatches[0].ground] || `Ground #${stats.upcomingMatches[0].ground}` 
                : "No matches scheduled"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Section */}
      {stats.pendingInvoices.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <details className="group" open>
            <summary className="cursor-pointer list-none">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-100 p-2 text-red-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-red-700">Pending Payments</CardTitle>
                      <CardDescription className="mt-1 text-red-600">
                        {stats.pendingInvoices.length} payment{stats.pendingInvoices.length === 1 ? "" : "s"} still need settlement. Use cash settle when money has already been collected offline.
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-fit border-red-300 bg-white text-red-700">
                      {stats.pendingInvoices.length} Pending
                    </Badge>
                    <ChevronDown className="h-5 w-5 text-red-700 transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </CardHeader>
            </summary>
            <CardContent>
              <div className="space-y-4">
                {stats.pendingInvoices.map((t) => (
                  <div key={t.id} className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-red-100 p-2 text-red-600">
                        <IndianRupee className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{getTransactionPlayerName(t)}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <span className="capitalize">{t.category ? t.category.replaceAll('_', ' ') : 'fee'}</span>
                          <span>•</span>
                          <span>Due: {formatTransactionDate(t.due_date || t.payment_date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="text-lg font-bold">₹{parseFloat(t.amount).toLocaleString()}</span>
                      <Button
                        onClick={() => handleSettleCashPayment(t)}
                        disabled={settlingTransactionId === t.id}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        {settlingTransactionId === t.id ? "Settling..." : "Settle"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </details>
        </Card>
      )}

      {/* Main Content Split: Matches (Left) vs Finance (Right) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Upcoming Fixtures - Takes up 4 columns */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Fixtures</CardTitle>
            <CardDescription>
              You have {stats.upcomingMatches.length} matches coming up soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingMatches.length === 0 ? (
                <div className="text-sm text-center py-4 text-slate-500">No upcoming matches found.</div>
              ) : (
                stats.upcomingMatches.map((match) => (
                  <div key={match.id} className="flex flex-col gap-3 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded bg-slate-100 text-slate-600">
                        <span className="text-xs font-bold uppercase">{format(new Date(match.date), "MMM")}</span>
                        <span className="text-lg font-bold">{format(new Date(match.date), "d")}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {match.external_opponent ||
                            `${stats.teamMap[match.team1] || "Team 1"} vs ${stats.teamMap[match.team2] || "Team 2"}`}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                           <Activity className="h-3 w-3 text-green-500" /> 
                           {format(new Date(match.date), "h:mm a")} • {stats.groundMap[match.ground] || `Ground #${match.ground}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit capitalize">{normalizeMatchStatus(match).replace("_", " ")}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions - Takes up 3 columns */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>
              Latest fees collected from players.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {stats.recentTransactions.length === 0 ? (
                <div className="text-sm text-center py-4 text-slate-500">No recent transactions.</div>
              ) : (
                stats.recentTransactions.map((t) => (
                  <div key={t.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">₹</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {stats.playerMap[t.player] || `Player #${t.player}`}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {t.category.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium text-sm">+₹{parseFloat(t.amount).toLocaleString()}</div>
                  </div>
                ))
              )}
              
              <Button variant="ghost" className="w-full text-xs" asChild>
                <Link href="/finance" className="flex items-center gap-2">
                  View All Transactions <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
