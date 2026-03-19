"use client";

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
import { validateLeavePeriod } from "@/lib/membership";
import { useState } from "react";

export default function LeaveRequestModal({ open, onOpenChange, loading = false, onSubmit }) {
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});

  const handleClose = (nextOpen) => {
    if (!nextOpen) {
      setFormData({ start_date: "", end_date: "", reason: "" });
      setErrors({});
    }
    onOpenChange(nextOpen);
  };

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLeavePeriod(formData);
    if (!formData.reason.trim()) {
      nextErrors.reason = "Reason is required.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit?.({
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason.trim(),
    });

    setFormData({ start_date: "", end_date: "", reason: "" });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>
            Submit a leave request for admin approval before it is applied to membership billing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-request-start">Start Date</Label>
              <Input
                id="leave-request-start"
                type="date"
                value={formData.start_date}
                onChange={(event) => setField("start_date", event.target.value)}
                aria-invalid={Boolean(errors.start_date)}
                required
              />
              {errors.start_date ? <p className="text-xs text-red-600">{errors.start_date}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-request-end">End Date</Label>
              <Input
                id="leave-request-end"
                type="date"
                value={formData.end_date}
                onChange={(event) => setField("end_date", event.target.value)}
                aria-invalid={Boolean(errors.end_date)}
                required
              />
              {errors.end_date ? <p className="text-xs text-red-600">{errors.end_date}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-request-reason">Reason</Label>
            <textarea
              id="leave-request-reason"
              value={formData.reason}
              onChange={(event) => setField("reason", event.target.value)}
              rows={4}
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[96px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              placeholder="Out of station"
            />
            {errors.reason ? <p className="text-xs text-red-600">{errors.reason}</p> : null}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
