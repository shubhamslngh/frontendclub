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
  const glassCard =
    "rounded-3xl border border-white/10 bg-white/5 text-white backdrop-blur-lg shadow-[0_10px_30px_rgba(0,0,0,0.35)]";

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

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,107,0,0.22),transparent_60%)]" />
        <div className="absolute -left-24 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.12),transparent_65%)] blur-2xl" />
        <div className="absolute left-1/3 top-12 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(46,204,113,0.16),transparent_65%)] blur-2xl" />
        <div className="absolute right-[-120px] top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_top,rgba(0,180,216,0.10),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.65))]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Transactions</p>
            <h1 className="text-3xl font-semibold text-white">Your Payments</h1>
          </div>
          <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
            <Link href="/player/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        {loading ? (
          <div className={`${glassCard} p-10 text-center text-white/60`}>
            Loading transactions...
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className={glassCard}>
                <CardHeader>
                  <CardTitle className="text-sm text-white">Total Paid</CardTitle>
                  <CardDescription className="text-white/60">Completed payments</CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-white">
                  ₹{totals.paid.toLocaleString()}
                </CardContent>
              </Card>
              <Card className={glassCard}>
                <CardHeader>
                  <CardTitle className="text-sm text-white">Pending Amount</CardTitle>
                  <CardDescription className="text-white/60">Outstanding dues</CardDescription>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-white">
                  ₹{totals.pending.toLocaleString()}
                </CardContent>
              </Card>
            </div>

            <Card className={glassCard}>
              <CardHeader>
                <CardTitle className="text-white">Transaction History</CardTitle>
                <CardDescription className="text-white/60">Recent membership and fee transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-sm text-white/60">No transactions yet.</div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{tx.category || "Membership"}</p>
                          <p className="text-xs text-white/60">
                            {formatDate(tx.payment_date)} {tx.due_date ? `• Due ${formatDate(tx.due_date)}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={tx.paid ? "default" : "outline"} className="border-white/20 text-white">
                            {tx.paid ? "Paid" : "Pending"}
                          </Badge>
                          <span className="text-sm font-semibold text-white">
                            ₹{parseFloat(tx.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
