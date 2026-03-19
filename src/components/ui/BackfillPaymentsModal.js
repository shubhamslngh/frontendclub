"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clubService } from "@/services/clubService";

const today = new Date().toISOString().split("T")[0];

const EMPTY_FORM = {
  player_id: "",
  start_month: "",
  end_month: "",
  payment_date: "",
};

export default function BackfillPaymentsModal({ open, onOpenChange, players, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) {
      setFormData(EMPTY_FORM);
      setResult(null);
    }
  }, [open]);

  const sortedPlayers = useMemo(
    () =>
      [...players].sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      ),
    [players]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        player_id: Number(formData.player_id),
        start_month: formData.start_month,
        end_month: formData.end_month,
      };

      if (formData.payment_date) {
        payload.payment_date = formData.payment_date;
      }

      const response = await clubService.backfillMonthlyPayments(payload);
      setResult(response.data);
      toast.success(response.data?.message || "Monthly payments backfilled successfully.");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to backfill monthly payments", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Backfill failed. Please verify the selected range.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Backfill Paid Months</DialogTitle>
          <DialogDescription>
            Create historical monthly payment transactions for an existing member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="backfill-player">Player</Label>
            <Select
              value={formData.player_id}
              onValueChange={(value) => setFormData((current) => ({ ...current, player_id: value }))}
            >
              <SelectTrigger id="backfill-player">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {sortedPlayers.map((player) => (
                  <SelectItem key={player.id} value={String(player.id)}>
                    {player.first_name} {player.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_month">Start Month</Label>
              <Input
                id="start_month"
                type="date"
                value={formData.start_month}
                onChange={(e) => setFormData((current) => ({ ...current, start_month: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_month">End Month</Label>
              <Input
                id="end_month"
                type="date"
                value={formData.end_month}
                onChange={(e) => setFormData((current) => ({ ...current, end_month: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              max={today}
              onChange={(e) => setFormData((current) => ({ ...current, payment_date: e.target.value }))}
            />
            <p className="text-xs text-slate-500">Optional. Leave blank if backend should decide the date.</p>
          </div>

          {result ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{result.message}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div>Created: {result.created_transactions ?? 0}</div>
                <div>Skipped existing: {result.skipped_existing ?? 0}</div>
                <div>Skipped leave months: {result.skipped_leave_months ?? 0}</div>
                <div>Skipped before join: {result.skipped_before_join ?? 0}</div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={loading || !formData.player_id} className="w-full sm:w-auto">
              {loading ? "Backfilling..." : "Run Backfill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
