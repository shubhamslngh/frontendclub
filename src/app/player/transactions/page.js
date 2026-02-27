"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clubService } from "@/services/clubService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export default function PlayerTransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("club_token");
    if (!token) {
      router.replace("/");
      return;
    }
    const loadTransactions = async () => {
      try {
        const res = await clubService.getTransactions();
        const all = Array.isArray(res.data) ? res.data : [];
        const playerId = Number(localStorage.getItem("club_player_id")) || null;
        const mine = playerId ? all.filter((tx) => tx.player === playerId) : all;
        setTransactions(mine);
      } catch (error) {
        console.error("Failed to load transactions", error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, [router]);

  const totals = useMemo(() => {
    const paid = transactions.filter((tx) => tx.paid).reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const pending = transactions.filter((tx) => !tx.paid).reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    return { paid, pending };
  }, [transactions]);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-(--kk-sand) text-(--kk-ink)"
        style={{
          "--kk-sand": "#f7f3e8",
          "--kk-ink": "#1f241a",
          "--kk-ember": "#d66b2d",
          "--kk-field": "#2f6b3f",
          "--kk-cream": "#fff7e8",
          "--kk-line": "#e4d8c4",
        }}
      >
        <div className="p-8 text-center text-(--kk-ink)/60">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-(--kk-sand) text-(--kk-ink)"
      style={{
        "--kk-sand": "#f7f3e8",
        "--kk-ink": "#1f241a",
        "--kk-ember": "#d66b2d",
        "--kk-field": "#2f6b3f",
        "--kk-cream": "#fff7e8",
        "--kk-line": "#e4d8c4",
      }}
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--kk-field)">Transactions</p>
            <h1 className="text-2xl font-semibold text-(--kk-ink)">Your Payments</h1>
          </div>
          <Button asChild variant="outline" className="border-(--kk-line) text-(--kk-ink)">
            <Link href="/player/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-(--kk-line) bg-white">
            <CardHeader>
              <CardTitle className="text-sm">Total Paid</CardTitle>
              <CardDescription>Completed payments</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-(--kk-ink)">
              ₹{totals.paid.toLocaleString()}
            </CardContent>
          </Card>
          <Card className="border-(--kk-line) bg-white">
            <CardHeader>
              <CardTitle className="text-sm">Pending Amount</CardTitle>
              <CardDescription>Outstanding dues</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-(--kk-ink)">
              ₹{totals.pending.toLocaleString()}
            </CardContent>
          </Card>
        </div>

        <Card className="border-(--kk-line) bg-white">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent membership and fee transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-sm text-(--kk-ink)/60">No transactions yet.</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex flex-col gap-3 rounded-2xl border border-(--kk-line) bg-(--kk-cream) p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-(--kk-ink)">{tx.category || "Membership"}</p>
                      <p className="text-xs text-(--kk-ink)/60">
                        {formatDate(tx.payment_date)} {tx.due_date ? `• Due ${formatDate(tx.due_date)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={tx.paid ? "default" : "outline"}>
                        {tx.paid ? "Paid" : "Pending"}
                      </Badge>
                      <span className="text-sm font-semibold text-(--kk-ink)">
                        ₹{parseFloat(tx.amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
