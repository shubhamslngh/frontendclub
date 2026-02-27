"use client";
import React, { useState, useEffect } from "react";import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { clubService } from "@/services/clubService";

export default function PlayerModal({ open, onOpenChange, player, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    age: "",
    role: "Batsman",
    phone_number: "",
  });
  const [profilePic, setProfilePic] = useState(null);

  // Sync form data if editing an existing player
  useEffect(() => {
    if (player) {
      setFormData({
        first_name: player.first_name || "",
        last_name: player.last_name || "",
        age: player.age || "",
        role: player.role || "Batsman",
        phone_number: player.phone_number || "",
      });
    } else {
      setFormData({ first_name: "", last_name: "", age: "", role: "Batsman", phone_number: "" });
    }
  }, [player]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Use FormData for file uploads
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
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
      toast.error("Failed to save player. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{player ? "Edit Player" : "Add New Player"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input 
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input 
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v) => setFormData({...formData, role: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batsman">Batsman</SelectItem>
                  <SelectItem value="bowler">Bowler</SelectItem>
                  <SelectItem value="all_rounder">All-rounder</SelectItem>
                  <SelectItem value="wicket_keeper">Wicketkeeper</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input 
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <Input 
              type="file" 
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : player ? "Update Player" : "Create Player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}