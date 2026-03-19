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

export default function LeaveRequestReviewModal({
  open,
  onOpenChange,
  loading = false,
  request,
  action = "approve",
  onSubmit,
}) {
  const [reviewNote, setReviewNote] = useState("");

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setReviewNote("");
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit?.({ review_note: reviewNote.trim() || (action === "approve" ? "Approved" : "Rejected") });
    setReviewNote("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{action === "approve" ? "Approve Leave Request" : "Reject Leave Request"}</DialogTitle>
          <DialogDescription>
            {action === "approve"
              ? "Approving will apply the leave to the member record."
              : "Rejected requests remain visible to the player with your review note."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">{request?.player_name || "Player"}</p>
            <p className="mt-1">
              {request?.start_date} to {request?.end_date}
            </p>
            <p className="mt-1 text-slate-600">{request?.reason || "No reason provided"}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-review-note">Review Note</Label>
            <textarea
              id="leave-review-note"
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              rows={4}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              placeholder={action === "approve" ? "Approved" : "Reason for rejection"}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} variant={action === "approve" ? "default" : "destructive"}>
              {loading ? "Saving..." : action === "approve" ? "Approve Request" : "Reject Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
