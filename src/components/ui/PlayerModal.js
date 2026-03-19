"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEMBERSHIP_STATUS_OPTIONS } from "@/lib/membership";
import { PLAYER_ROLE_OPTIONS } from "@/lib/players";
import { clubService } from "@/services/clubService";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  age: "",
  role: "none",
  phone_number: "",
  membership_join_date: "",
  membership_status: "pending",
  membership_fee_exempt: false,
  membership_fee_exempt_reason: "",
};

export default function PlayerModal({ open, onOpenChange, player, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (player) {
      setFormData({
        first_name: player.first_name || "",
        last_name: player.last_name || "",
        age: player.age ?? "",
        role: player.role || "none",
        phone_number: player.phone_number || "",
        membership_join_date: player.membership?.join_date || "",
        membership_status: player.membership?.status || "pending",
        membership_fee_exempt: Boolean(player.membership?.fee_exempt),
        membership_fee_exempt_reason: player.membership?.fee_exempt_reason || "",
      });
      setProfilePic(null);
      return;
    }

    setFormData(EMPTY_FORM);
    setProfilePic(null);
  }, [player, open]);

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "membership_fee_exempt") {
        data.append(key, value ? "true" : "false");
        return;
      }

      if (key === "membership_fee_exempt_reason" && !formData.membership_fee_exempt) {
        data.append(key, "");
        return;
      }

      data.append(key, value ?? "");
    });

    if (profilePic) data.append("profile_picture", profilePic);

    try {
      if (player?.id) {
        await clubService.updatePlayer(player.id, data);
        toast.success("Player updated successfully");
      } else {
        await clubService.createPlayer(data);
        toast.success("New player registered");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save player. Please check the form data and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{player ? "Edit Player" : "Add New Player"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setField("first_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setField("last_name", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setField("age", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setField("role", value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAYER_ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setField("phone_number", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_picture">Profile Picture</Label>
                <Input
                  id="profile_picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Membership</h3>
              <p className="text-xs text-slate-500">These fields are sent through the existing player API.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="membership_join_date">Join Date</Label>
                <Input
                  id="membership_join_date"
                  type="date"
                  value={formData.membership_join_date}
                  onChange={(e) => setField("membership_join_date", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership_status">Status</Label>
                <Select
                  value={formData.membership_status}
                  onValueChange={(value) => setField("membership_status", value)}
                >
                  <SelectTrigger id="membership_status">
                    <SelectValue placeholder="Select membership status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBERSHIP_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <Checkbox
                id="membership_fee_exempt"
                checked={formData.membership_fee_exempt}
                onCheckedChange={(checked) => {
                  const enabled = Boolean(checked);
                  setFormData((current) => ({
                    ...current,
                    membership_fee_exempt: enabled,
                    membership_fee_exempt_reason: enabled ? current.membership_fee_exempt_reason : "",
                  }));
                }}
              />
              <div className="space-y-1">
                <Label htmlFor="membership_fee_exempt">Fee Exempt</Label>
                <p className="text-xs text-slate-500">
                  Exempt members stay bill-exempt and leave months are skipped by backend billing.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="membership_fee_exempt_reason">Fee Exemption Reason</Label>
              <textarea
                id="membership_fee_exempt_reason"
                value={formData.membership_fee_exempt_reason}
                onChange={(e) => setField("membership_fee_exempt_reason", e.target.value)}
                disabled={!formData.membership_fee_exempt}
                rows={3}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 min-h-[88px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Optional reason for fee exemption"
              />
            </div>
          </section>

          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : player ? "Update Player" : "Create Player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
