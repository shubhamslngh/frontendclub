"use client";
import React, { useEffect, useState } from 'react';
import { clubService } from '@/services/clubService';
import PaymentModal from "@/components/ui/PaymentModal";
import BackfillPaymentsModal from "@/components/ui/BackfillPaymentsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Plus, RotateCcw } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [playerOptions, setPlayerOptions] = useState([]);
  const [players, setPlayers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, monthly: 0 });

  const loadData = async () => {
    try {
      const [transRes, playerRes] = await Promise.all([
        clubService.getTransactions(),
        clubService.getPlayers()
      ]);
      
      setTransactions(transRes.data);
      setPlayerOptions(playerRes.data);
      
      // Create Player Lookup Map
      const pMap = {};
      playerRes.data.forEach(p => pMap[p.id] = `${p.first_name} ${p.last_name}`);
      setPlayers(pMap);

      // Stats Calculation
      const total = transRes.data
        .filter(t => t.paid) // Only count paid transactions
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        
      setStats({ total, monthly: total }); 
    } catch (error) {
      console.error("Failed to load finance data", error);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Helper to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid Date";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Track revenue, fees, and payments.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => setIsBackfillOpen(true)} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Backfill Paid Months
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        {/* Additional cards removed for brevity, you can keep them */}
      </div>

      {/* Transactions Table */}
      <div className="border rounded-lg bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment Date</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center py-8">No transactions found.</TableCell></TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  {/* FIX 1: Use payment_date or due_date */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{formatDate(t.payment_date)}</span>
                      {t.due_date && !t.payment_date && (
                        <span className="text-xs text-red-500">Due: {formatDate(t.due_date)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{players[t.player] || `ID: ${t.player}`}</TableCell>
                  {/* FIX 2: Use category instead of payment_type */}
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {t.category || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.paid ? "default" : "destructive"} className={t.paid ? "bg-green-600" : ""}>
                      {t.paid ? "Paid" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{parseFloat(t.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onSuccess={loadData}
      />
      <BackfillPaymentsModal
        open={isBackfillOpen}
        onOpenChange={setIsBackfillOpen}
        players={playerOptions}
        onSuccess={loadData}
      />
    </div>
  );
}
