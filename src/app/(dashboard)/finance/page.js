"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import {
  ArrowUpRight,
  Filter,
  IndianRupee,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldBan,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";

import BackfillPaymentsModal from "@/components/ui/BackfillPaymentsModal";
import PaymentModal from "@/components/ui/PaymentModal";
import WaiveInvoiceModal from "@/components/ui/WaiveInvoiceModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clubService } from "@/services/clubService";
import { getTransactionStatusMeta, getTransactionState, isTransactionPayable } from "@/lib/transactions";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "waived", label: "Waived" },
];

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [playerOptions, setPlayerOptions] = useState([]);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [waiveLoading, setWaiveLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transRes, playerRes] = await Promise.all([clubService.getTransactions(), clubService.getPlayers()]);

      const transactionData = Array.isArray(transRes.data) ? transRes.data : [];
      const playerData = Array.isArray(playerRes.data) ? playerRes.data : [];

      setTransactions(transactionData);
      setPlayerOptions(playerData);

      const playerMap = {};
      playerData.forEach((player) => {
        playerMap[player.id] = `${player.first_name} ${player.last_name}`.trim();
      });
      setPlayers(playerMap);
    } catch (error) {
      console.error("Failed to load finance data", error);
      toast.error("Could not load finance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid Date";
  };

  const normalizedTransactions = useMemo(() => {
    return transactions.map((transaction) => {
      const playerName = players[transaction.player] || transaction.player_name || `ID: ${transaction.player}`;
      return {
        ...transaction,
        player_name: playerName,
        state: getTransactionState(transaction),
      };
    });
  }, [players, transactions]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(normalizedTransactions.map((transaction) => transaction.category).filter(Boolean))
    ).sort();
    return ["all", ...uniqueCategories];
  }, [normalizedTransactions]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return normalizedTransactions
      .filter((transaction) => {
        if (statusFilter !== "all" && transaction.state !== statusFilter) return false;
        if (categoryFilter !== "all" && transaction.category !== categoryFilter) return false;
        if (!query) return true;

        return [
          transaction.player_name,
          transaction.category,
          transaction.waived_reason,
          transaction.amount,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => new Date(b.due_date || b.payment_date || 0) - new Date(a.due_date || a.payment_date || 0));
  }, [categoryFilter, normalizedTransactions, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalRevenue = normalizedTransactions
      .filter((transaction) => transaction.paid)
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);

    const outstanding = normalizedTransactions
      .filter((transaction) => isTransactionPayable(transaction))
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);

    const waived = normalizedTransactions
      .filter((transaction) => transaction.waived)
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);

    const monthlyInvoices = normalizedTransactions.filter((transaction) => transaction.category === "monthly").length;

    return {
      totalRevenue,
      outstanding,
      waived,
      monthlyInvoices,
    };
  }, [normalizedTransactions]);

  const handleWaiveInvoice = async (payload) => {
    if (!activeTransaction?.id) return;

    try {
      setWaiveLoading(true);
      await clubService.updateTransaction(activeTransaction.id, payload);
      toast.success("Invoice waived successfully.");
      setWaiveModalOpen(false);
      setActiveTransaction(null);
      await loadData();
    } catch (error) {
      console.error("Failed to waive invoice", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Could not waive this invoice.";
      toast.error(message);
    } finally {
      setWaiveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#1f2937_100%)] text-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300">
              <ReceiptText className="h-3.5 w-3.5" />
              Finance Control
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Finance</h1>
              <p className="mt-2 text-sm text-white/70 md:text-base">
                Track collected revenue, overdue invoices, waivers, and historical membership dues from one admin surface.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setIsBackfillOpen(true)} variant="outline" className="gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4" />
              Backfill Paid Months
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-emerald-500 text-white hover:bg-emerald-400">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600">
              Total Revenue
              <IndianRupee className="h-4 w-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Collected through paid transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600">
              Outstanding Dues
              <WalletCards className="h-4 w-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">₹{stats.outstanding.toLocaleString()}</div>
            <p className="mt-2 text-xs text-slate-500">Only invoices that are still payable</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600">
              Waived Amount
              <ShieldBan className="h-4 w-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">₹{stats.waived.toLocaleString()}</div>
            <p className="mt-2 text-xs text-slate-500">Non-payable invoices approved by management</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium text-slate-600">
              Monthly Invoices
              <ReceiptText className="h-4 w-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{stats.monthlyInvoices}</div>
            <p className="mt-2 text-xs text-slate-500">All monthly records currently loaded</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200">
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Transactions Workspace</CardTitle>
              <CardDescription>
                Search across players, categories, and waiver notes. Filters apply instantly.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit border-slate-200 bg-slate-50 text-slate-600">
              {filteredTransactions.length} visible
            </Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_0.7fr_0.7fr_auto] xl:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search player, category, amount, waiver reason"
                className="pl-9"
              />
            </div>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                <Filter className="h-3.5 w-3.5" />
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Category</span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All Categories" : option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <Button
              type="button"
              variant="outline"
              className="xl:self-end"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
            >
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              No transactions match the current filters.
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">
                              {formatDate(transaction.payment_date || transaction.due_date)}
                            </span>
                            {transaction.due_date ? (
                              <span className="text-xs text-slate-500">Due: {formatDate(transaction.due_date)}</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{transaction.player_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.category || "General"}
                          </Badge>
                          {transaction.waived_reason ? (
                            <p className="mt-1 text-xs text-slate-500">{transaction.waived_reason}</p>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("capitalize", getTransactionStatusMeta(transaction).className)}
                          >
                            {getTransactionStatusMeta(transaction).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900">
                          ₹{parseFloat(transaction.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isTransactionPayable(transaction) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setActiveTransaction(transaction);
                                setWaiveModalOpen(true);
                              }}
                            >
                              Waive
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">No action</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-3 p-4 lg:hidden">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{transaction.player_name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(transaction.payment_date || transaction.due_date)}
                          {transaction.due_date ? ` • Due ${formatDate(transaction.due_date)}` : ""}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", getTransactionStatusMeta(transaction).className)}
                      >
                        {getTransactionStatusMeta(transaction).label}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="capitalize">
                          {transaction.category || "General"}
                        </Badge>
                        {transaction.waived_reason ? (
                          <p className="mt-2 text-xs text-slate-500">{transaction.waived_reason}</p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-900">
                          ₹{parseFloat(transaction.amount || 0).toFixed(2)}
                        </p>
                        {isTransactionPayable(transaction) ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setActiveTransaction(transaction);
                              setWaiveModalOpen(true);
                            }}
                          >
                            Waive
                          </Button>
                        ) : (
                          <p className="mt-2 text-xs text-slate-400">No action</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <PaymentModal open={isModalOpen} onOpenChange={setIsModalOpen} onSuccess={loadData} />
      <BackfillPaymentsModal
        open={isBackfillOpen}
        onOpenChange={setIsBackfillOpen}
        players={playerOptions}
        onSuccess={loadData}
      />
      <WaiveInvoiceModal
        open={waiveModalOpen}
        onOpenChange={(open) => {
          setWaiveModalOpen(open);
          if (!open) setActiveTransaction(null);
        }}
        loading={waiveLoading}
        transaction={activeTransaction}
        onSubmit={handleWaiveInvoice}
      />
    </div>
  );
}
