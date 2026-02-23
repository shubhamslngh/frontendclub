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
  Activity, ArrowRight, ShieldCheck 
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    playerCount: 0,
    activeMembers: 0,
    teamCount: 0,
    upcomingMatches: [],
    recentTransactions: [],
    pendingInvoices: [],
    totalRevenue: 0,
    groundMap: {},
    teamMap: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [playersRes, teamsRes, matchesRes, financeRes, groundsRes] = await Promise.all([
          clubService.getPlayers(),
          clubService.getTeams(),
          clubService.getMatches(),
          clubService.getTransactions(),
          clubService.getGrounds()
        ]);

        const players = playersRes.data;
        const matches = matchesRes.data;
        const transactions = financeRes.data;
        const grounds = groundsRes.data;

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

        const upcoming = matches
          .filter(m => new Date(m.date) > now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3); // Get next 3 matches

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

        setStats({
          playerCount: players.length,
          activeMembers,
          teamCount: teamsRes.data.length,
          upcomingMatches: upcoming,
          recentTransactions: recentTx,
          pendingInvoices: pending,
          totalRevenue: revenue,
          groundMap,
          teamMap
        });
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

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

  const handlePayNow = async (transactionId) => {
    const toastId = toast.loading("Starting payment...");
    try {
      const res = await clubService.initiatePayment(transactionId);
      
      const { payment_url, merchant_transaction_id } = res.data;
      
      if (payment_url) {
        toast.success("Redirecting to payment gateway...", { id: toastId });
        // Store transaction ID for status page in case callback redirect is stripped of params
        if (merchant_transaction_id) {
          sessionStorage.setItem('current_transaction_id', merchant_transaction_id);
        }
        window.location.href = payment_url;
      } else {
        const message =
          res?.data?.message ||
          res?.data?.error ||
          "Payment initiated but no URL found.";
        toast.error(message, { id: toastId });
        console.log("Payment initiated but no URL found:", res.data);
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      const message = getErrorMessage(
        error,
        "Payment initiation failed. Please try again."
      );
      toast.error(message, { id: toastId });
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your club's performance today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/matches">Schedule Match</Link>
          </Button>
          <Button asChild>
            <Link href="/players">Add Player</Link>
          </Button>
        </div>
      </div>

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

      {/* Pending Invoices Section */}
      {stats.pendingInvoices.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Pending Invoices</CardTitle>
            <CardDescription className="text-red-600">
              You have {stats.pendingInvoices.length} unpaid invoices. Please clear your dues.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingInvoices.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-red-100 rounded-full text-red-600">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.category ? t.category.replace('_', ' ').toUpperCase() : 'FEE'}</p>
                      <p className="text-sm text-gray-500">Due Date: {t.payment_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg">₹{parseFloat(t.amount).toLocaleString()}</span>
                    <Button onClick={() => handlePayNow(t.id)} className="bg-red-600 hover:bg-red-700 text-white">
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Split: Matches (Left) vs Finance (Right) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Upcoming Fixtures - Takes up 4 columns */}
        <Card className="col-span-4">
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
                  <div key={match.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
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
                    <Badge variant="outline">{match.result ? "Completed" : "Scheduled"}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions - Takes up 3 columns */}
        <Card className="col-span-3">
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
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">₹</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Player #{t.player}</p>
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
