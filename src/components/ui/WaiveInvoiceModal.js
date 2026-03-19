"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function WaiveInvoiceModal({
  open,
  onOpenChange,
  loading = false,
  transaction,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setReason("");
      setError("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("Waiver reason is required.");
      return;
    }

    await onSubmit?.({
      waived: true,
      waived_reason: trimmedReason,
      paid: false,
    });

    setReason("");
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Waive Invoice</DialogTitle>
          <DialogDescription>
            Mark this invoice as waived so it is no longer payable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">
              {transaction?.player_name || transaction?.player_full_name || `Player #${transaction?.player || "-"}`}
            </p>
            <p className="mt-1 capitalize">
              {(transaction?.category || "invoice").replaceAll("_", " ")} • ₹
              {parseFloat(transaction?.amount || 0).toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waive-reason">Waiver Reason</Label>
            <textarea
              id="waive-reason"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (error) setError("");
              }}
              rows={4}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              placeholder="Approved leave, management exception, etc."
            />
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Applying..." : "Apply Waiver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
