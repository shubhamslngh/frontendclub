"use client";
import React, { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { clubService } from "@/services/clubService";

export default function TeamModal({ open, onOpenChange, team, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State to hold form data
  const [formData, setFormData] = useState({
    name: "",
    captain: "",
    player_ids: [], // Stores an array of Integers (e.g., [1, 2, 5])
  });

  // 1. Load all players when modal opens (to populate dropdowns)
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const res = await clubService.getPlayers();
        setPlayers(res.data);
      } catch (err) {
        toast.error("Could not load players list");
      }
    };
    if (open) loadPlayers();
  }, [open]);

  // 2. Pre-fill form when editing a team
  useEffect(() => {
    if (team) {
      // Extract just the IDs from the team.players object array
      const existingPlayerIds = team.players?.map(p => p.id) || [];
      const captainId = team.captain ? team.captain.toString() : "";
      const captainInt = team.captain ? Number(team.captain) : null;
      const normalizedIds =
        captainInt && !existingPlayerIds.includes(captainInt)
          ? [...existingPlayerIds, captainInt]
          : existingPlayerIds;
      
      setFormData({ 
        name: team.name, 
        // Convert ID to string for the Select component
        captain: captainId,
        player_ids: normalizedIds
      });
    } else {
      // Reset for "Create New" mode
      setFormData({ name: "", captain: "", player_ids: [] });
    }
  }, [team, open]);

  // Helper to handle checkbox toggles
  const togglePlayer = (playerId) => {
    setFormData(prev => {
      const captainId = prev.captain ? parseInt(prev.captain, 10) : null;
      const isSelected = prev.player_ids.includes(playerId);
      if (isSelected && captainId === playerId) {
        toast.error("Captain must remain in the team.");
        return prev;
      }
      const newIds = isSelected 
        ? prev.player_ids.filter(id => id !== playerId)
        : [...prev.player_ids, playerId];
      return { ...prev, player_ids: newIds };
    });
  };

  const filteredPlayers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return players;
    return players.filter((player) => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      return fullName.includes(query) || player.role?.toLowerCase().includes(query);
    });
  }, [players, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step A: Format Data for API
      const captainId = formData.captain ? parseInt(formData.captain, 10) : null;
      
      // Ensure we are using the array of IDs we built in state
      let finalSquadIds = [...formData.player_ids];

      // Rule: If a Captain is selected, ensure they are in the squad list
      if (captainId && !finalSquadIds.includes(captainId)) {
        finalSquadIds.push(captainId);
      }

      const payload = {
        name: formData.name,
        captain: captainId,
    player_ids: finalSquadIds // Sends array of IDs: [1, 2, 3]
      };

      console.log("Sending Payload:", payload);

      // Step B: Send Request
      if (team && team.id) {
        await clubService.updateTeam(team.id, payload);
        toast.success("Team updated successfully");
      } else {
        await clubService.createTeam(payload);
        toast.success("Team created successfully");
      }

      onSuccess(); // Refresh parent list
      onOpenChange(false); // Close modal

    } catch (error) {
      console.error("Save Error:", error);
      // specific error handling
      if (error.response?.data) {
        toast.error(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        toast.error("Failed to save team details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{team ? "Edit Team Squad" : "Create New Team"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          
          {/* Team Name Input */}
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input 
              placeholder="e.g. Thunderbolts"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          {/* Captain Select Dropdown */}
          <div className="space-y-2">
            <Label>Team Captain</Label>
            <Select 
              value={formData.captain} 
              onValueChange={(v) => {
                setFormData((prev) => {
                  const captainId = v ? parseInt(v, 10) : null;
                  const needsAdd = captainId && !prev.player_ids.includes(captainId);
                  return {
                    ...prev,
                    captain: v,
                    player_ids: needsAdd ? [...prev.player_ids, captainId] : prev.player_ids,
                  };
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a captain" />
              </SelectTrigger>
              <SelectContent>
                {players.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.first_name} {p.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Squad Selection Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Assign Players to Squad ({formData.player_ids.length} selected)</Label>
              <Input
                placeholder="Search players..."
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="rounded-md border bg-white p-4">
              {formData.player_ids.length === 0 ? (
                <div className="text-xs text-slate-500">No players selected yet.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.player_ids.map((playerId) => {
                    const player = players.find((p) => p.id === playerId);
                    const isCaptain = formData.captain && Number(formData.captain) === playerId;
                    return (
                      <button
                        type="button"
                        key={playerId}
                        onClick={() => !isCaptain && togglePlayer(playerId)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                          isCaptain
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {player ? `${player.first_name} ${player.last_name}` : `Player #${playerId}`}
                        {isCaptain ? <span className="text-[10px] uppercase">Captain</span> : "x"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <ScrollArea className="h-60 rounded-md border bg-slate-50 p-4">
              <div className="space-y-3">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3">
                    <Checkbox 
                      id={`player-${player.id}`}
                      checked={formData.player_ids.includes(player.id)}
                      onCheckedChange={() => togglePlayer(player.id)}
                    />
                    <label 
                      htmlFor={`player-${player.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-1"
                    >
                      {player.first_name} {player.last_name} 
                      <span className="ml-2 text-xs text-slate-500">({player.role})</span>
                    </label>
                  </div>
                ))}
                {filteredPlayers.length === 0 && (
                  <div className="text-xs text-slate-500">No players match this search.</div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : team ? "Update Team" : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
